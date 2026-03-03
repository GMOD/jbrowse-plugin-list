import { jsonfetch } from '../../fetchUtils'
import {
  getDatabaseTypeForId,
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

// Re-export for backward compatibility
export { isRecognizedDatabaseId as isRecognizedTranscriptId }

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

/**
 * Build UniProt xref query for a recognized database ID
 */
function buildXrefQuery(id: string): string | undefined {
  const dbType = getDatabaseTypeForId(id)
  switch (dbType) {
    case 'ensembl':
      return `xref:ensembl-${id}`
    case 'refseq':
      return `xref:refseq-${id}`
    case 'ccds':
      return `xref:ccds-${id}`
    case 'hgnc':
      return `xref:hgnc-${id.replace('HGNC:', '')}`
    default:
      return undefined
  }
}

async function searchUniProt(
  query: string,
  size = 10,
): Promise<UniProtEntry[]> {
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&fields=${UNIPROT_FIELDS}&size=${size}`
  const data = (await jsonfetch(url)) as UniProtApiResult
  return data.results.map(mapApiResultToEntry)
}

async function searchByXref(id: string) {
  const query = buildXrefQuery(id)
  if (query) {
    try {
      return await searchUniProt(query)
    } catch (e) {
      console.error(`xref search failed for ${id}:`, e)
    }
  }
  return []
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

/**
 * Search UniProt for entries matching a gene, returning multiple results.
 * Tries multiple strategies in order of specificity:
 * 1. Recognized database IDs (Ensembl, RefSeq, CCDS, HGNC) via xref search
 * 2. Gene name search (fallback if no reviewed entries found)
 */
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
  // Collect all IDs to search, including legacy geneId if applicable
  const idsToSearch = new Set(recognizedIds)
  const strippedGeneId = geneId ? stripTrailingVersion(geneId) : undefined
  if (strippedGeneId && isRecognizedDatabaseId(strippedGeneId)) {
    idsToSearch.add(strippedGeneId)
  }

  // Search all xrefs in parallel
  const xrefResults = await Promise.all([...idsToSearch].map(searchByXref))
  let entries = deduplicateEntries(xrefResults.flat())

  // Fallback: if no reviewed entries found, try gene name search
  if (!entries.some(e => e.isReviewed) && geneName) {
    try {
      const query = `gene:${geneName}+AND+organism_id:${organismId}+AND+reviewed:true`
      const geneNameResults = await searchUniProt(query, 5)
      entries = deduplicateEntries([...entries, ...geneNameResults])
    } catch (e) {
      console.error(`gene name search failed for ${geneName}:`, e)
    }
  }

  // Sort reviewed entries first
  return entries.toSorted((a, b) => Number(b.isReviewed) - Number(a.isReviewed))
}
