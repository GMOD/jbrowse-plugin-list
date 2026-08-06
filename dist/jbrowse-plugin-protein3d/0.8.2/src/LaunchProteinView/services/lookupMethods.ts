import { jsonfetch } from '../../fetchUtils'
import {
  buildUniProtXrefQuery,
  isRecognizedDatabaseId,
  stripTrailingVersion,
} from '../utils/util'

interface UniProtApiResult {
  results: {
    entryType: string
    primaryAccession: string
    uniProtkbId?: string
    genes?: {
      geneName?: {
        value: string
      }
    }[]
    organism?: {
      taxonId: number
      scientificName?: string
      commonName?: string
    }
    proteinDescription?: {
      recommendedName?: {
        fullName?: {
          value: string
        }
      }
    }
  }[]
}

export interface UniProtEntry {
  accession: string
  id?: string
  geneName?: string
  organismName?: string
  proteinName?: string
  isReviewed: boolean
}

const UNIPROT_FIELDS =
  'accession,id,gene_names,organism_name,protein_name,reviewed'

function mapApiResultToEntry(
  result: UniProtApiResult['results'][0],
): UniProtEntry {
  return {
    accession: result.primaryAccession,
    id: result.uniProtkbId,
    geneName: result.genes?.[0]?.geneName?.value,
    organismName:
      result.organism?.commonName ?? result.organism?.scientificName,
    proteinName: result.proteinDescription?.recommendedName?.fullName?.value,
    isReviewed: result.entryType === 'UniProtKB reviewed (Swiss-Prot)',
  }
}

async function searchUniProt(
  query: string,
  size = 10,
): Promise<UniProtEntry[]> {
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&fields=${UNIPROT_FIELDS}&size=${size}`
  const data = await jsonfetch<UniProtApiResult>(url)
  return data.results.map(mapApiResultToEntry)
}

interface SearchByXrefResult {
  entries: UniProtEntry[]
  error: unknown
}

async function searchByXref(id: string): Promise<SearchByXrefResult> {
  const query = buildUniProtXrefQuery(id)
  if (!query) {
    return { entries: [], error: undefined }
  }
  try {
    return { entries: await searchUniProt(query), error: undefined }
  } catch (e) {
    console.error(`xref search failed for ${id}:`, e)
    return { entries: [], error: e }
  }
}

function deduplicateEntries(entries: UniProtEntry[]) {
  const seen = new Set<string>()
  const result: UniProtEntry[] = []
  for (const entry of entries) {
    if (!seen.has(entry.accession)) {
      seen.add(entry.accession)
      result.push(entry)
    }
  }
  return result
}

export async function searchUniProtEntries({
  recognizedIds = [],
  geneId,
  geneName,
  organismId = 9606,
}: {
  recognizedIds?: string[]
  geneId?: string
  geneName?: string
  organismId?: number
}) {
  const idsToSearch = new Set(recognizedIds)
  const strippedGeneId = geneId ? stripTrailingVersion(geneId) : undefined
  if (strippedGeneId && isRecognizedDatabaseId(strippedGeneId)) {
    idsToSearch.add(strippedGeneId)
  }

  const xrefResults = await Promise.all([...idsToSearch].map(searchByXref))
  let entries = deduplicateEntries(xrefResults.flatMap(r => r.entries))
  const xrefErrors = xrefResults.filter(r => r.error !== undefined)

  // Fallback: if no reviewed entries found, try gene name search
  let geneNameError: unknown
  if (!entries.some(e => e.isReviewed) && geneName) {
    try {
      const query = `gene:${geneName} AND organism_id:${organismId} AND reviewed:true`
      const geneNameResults = await searchUniProt(query, 5)
      entries = deduplicateEntries([...entries, ...geneNameResults])
    } catch (e) {
      console.error(`gene name search failed for ${geneName}:`, e)
      geneNameError = e
    }
  }

  // If we got no entries but every attempted lookup failed, surface the
  // underlying error rather than silently returning []. Otherwise consumers
  // see "No UniProt ID found" with no indication that the network failed.
  if (entries.length === 0) {
    const attempted = idsToSearch.size + (geneName ? 1 : 0)
    const failed = xrefErrors.length + (geneNameError ? 1 : 0)
    if (attempted > 0 && attempted === failed) {
      throw (geneNameError ?? xrefErrors[0]?.error) as Error
    }
  }

  return entries.toSorted((a, b) => Number(b.isReviewed) - Number(a.isReviewed))
}
