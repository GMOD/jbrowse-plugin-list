import { Feature } from '@jbrowse/core/util'

export function stripStopCodon(seq: string) {
  return seq.replaceAll('*', '')
}

export function getTranscriptFeatures(feature: Feature) {
  // check if we are looking at a 'two-level' or 'three-level' feature by
  // finding exon/CDS subfeatures. we want to select from transcript names
  const subfeatures = feature.get('subfeatures') ?? []

  // Check for mRNA/transcript subfeatures (three-level: gene → mRNA → CDS)
  const transcripts = subfeatures.filter(
    (f: Feature) => f.get('type') === 'mRNA' || f.get('type') === 'transcript',
  )
  if (transcripts.length > 0) {
    return transcripts
  }

  // Has direct CDS/exon children, treat feature itself as the transcript
  // (two-level: gene → CDS or mRNA → CDS)
  return [feature]
}

export function stripTrailingVersion(s?: string) {
  return s?.replace(/\.[^./]+$/, '')
}

export function z(n: number) {
  return n.toLocaleString('en-US')
}

export function getDisplayName(f: Feature): string {
  return f.get('name') ?? f.get('id')
}

export function getId(val?: Feature): string {
  return val === undefined ? '' : val.id()
}

export function getTranscriptDisplayName(val?: Feature): string {
  return val === undefined
    ? ''
    : [val.get('name') ?? val.get('id')].filter(f => !!f).join(' ')
}

export function getGeneDisplayName(val?: Feature): string {
  return val === undefined
    ? ''
    : [val.get('gene_name') ?? val.get('name') ?? val.get('id')]
        .filter(f => !!f)
        .join(' ')
}

export function getUniProtIdFromFeature(f?: Feature): string | undefined {
  if (!f) {
    return undefined
  }
  return f.get('uniprot') ?? f.get('uniprotId') ?? f.get('uniprotid')
}

// Ensembl ID patterns - covers human (ENS), mouse (ENSMUS), zebrafish (ENSDAR), etc.
const ensemblGenePattern = /^ENS[A-Z]*G\d+/i
const ensemblTranscriptPattern = /^ENS[A-Z]*T\d+/i
const ensemblProteinPattern = /^ENS[A-Z]*P\d+/i

// NCBI RefSeq ID patterns
const refSeqTranscriptPattern = /^[NX][MR]_\d+/i
const refSeqProteinPattern = /^[NX]P_\d+/i

// CCDS pattern
const ccdsPattern = /^CCDS\d+/i

// HGNC pattern (HGNC:12345)
const hgncPattern = /^HGNC:\d+/i

/**
 * Check if an ID is a recognized database identifier that UniProt can map
 */
export function isRecognizedDatabaseId(id: string) {
  return (
    ensemblGenePattern.test(id) ||
    ensemblTranscriptPattern.test(id) ||
    ensemblProteinPattern.test(id) ||
    refSeqTranscriptPattern.test(id) ||
    refSeqProteinPattern.test(id) ||
    ccdsPattern.test(id) ||
    hgncPattern.test(id)
  )
}

/**
 * Get the database type for a recognized ID (used for UniProt xref queries)
 */
export function getDatabaseTypeForId(id: string): string | undefined {
  if (ensemblGenePattern.test(id)) {
    return 'ensembl'
  }
  if (ensemblTranscriptPattern.test(id)) {
    return 'ensembl'
  }
  if (ensemblProteinPattern.test(id)) {
    return 'ensembl'
  }
  if (refSeqTranscriptPattern.test(id) || refSeqProteinPattern.test(id)) {
    return 'refseq'
  }
  if (ccdsPattern.test(id)) {
    return 'ccds'
  }
  if (hgncPattern.test(id)) {
    return 'hgnc'
  }
  return undefined
}

/**
 * Parse dbxref attribute which can have formats like:
 * - "GeneID:1234,HGNC:HGNC:5678"
 * - "Dbxref=GeneID:1234"
 * - Array of strings
 */
function parseDbxref(dbxref: unknown): string[] {
  if (!dbxref) {
    return []
  }
  if (Array.isArray(dbxref)) {
    return dbxref.flatMap(item =>
      typeof item === 'string' ? item.split(',') : [],
    )
  }
  if (typeof dbxref === 'string') {
    return dbxref.split(',').map(s => s.trim())
  }
  return []
}

/**
 * Extract recognized database IDs from dbxref entries
 * Returns IDs without their database prefix where applicable
 */
function extractIdsFromDbxref(dbxrefEntries: string[]): string[] {
  const ids: string[] = []
  for (const entry of dbxrefEntries) {
    // Handle formats like "Ensembl:ENST00000123456" or "RefSeq:NM_001234"
    const parts = entry.split(':')
    const lastPart = parts[parts.length - 1]
    if (lastPart && isRecognizedDatabaseId(lastPart)) {
      ids.push(lastPart)
    }
    // Also check if the whole entry is a recognized ID
    if (isRecognizedDatabaseId(entry)) {
      ids.push(entry)
    }
    // Handle HGNC format "HGNC:HGNC:12345" -> "HGNC:12345"
    if (entry.startsWith('HGNC:HGNC:')) {
      ids.push(entry.replace('HGNC:HGNC:', 'HGNC:'))
    } else if (entry.startsWith('HGNC:') && /^HGNC:\d+$/.test(entry)) {
      ids.push(entry)
    }
  }
  return [...new Set(ids)]
}

export interface FeatureIdentifiers {
  recognizedIds: string[]
  uniprotId?: string
  geneId?: string
  geneName?: string
}

/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * Prioritizes recognized database IDs (Ensembl, RefSeq, CCDS, HGNC) over gene symbols.
 */
export function extractFeatureIdentifiers(f?: Feature): FeatureIdentifiers {
  if (!f) {
    return { recognizedIds: [] }
  }

  const recognizedIds: string[] = []

  // Check various feature attributes for recognized IDs
  const attributesToCheck = [
    f.get('ID'),
    f.get('id'),
    f.get('name'),
    f.get('Name'),
    f.get('transcript_id'),
    f.get('gene_id'),
    f.get('protein_id'),
    f.get('protAcc'), // RefSeq protein accession
    f.get('mrnaAcc'), // RefSeq mRNA accession
  ]

  for (const attr of attributesToCheck) {
    if (typeof attr === 'string') {
      const stripped = attr.replace(/\.[^./]+$/, '') // Strip version
      if (isRecognizedDatabaseId(stripped)) {
        recognizedIds.push(stripped)
      }
    }
  }

  // Handle HGNC attribute which may be just the number (e.g., "10848" instead of "HGNC:10848")
  const hgnc = f.get('hgnc') ?? f.get('HGNC')
  if (typeof hgnc === 'string' || typeof hgnc === 'number') {
    const hgncStr = String(hgnc)
    if (/^\d+$/.test(hgncStr)) {
      recognizedIds.push(`HGNC:${hgncStr}`)
    } else if (hgncPattern.test(hgncStr)) {
      recognizedIds.push(hgncStr)
    }
  }

  // Handle UniProt ID from feature attributes (trust that it's valid if present)
  const uniprotIdAttr =
    f.get('uniprot') ??
    f.get('uniprotId') ??
    f.get('uniprotid') ??
    f.get('UniProt')
  const uniprotId =
    typeof uniprotIdAttr === 'string' && uniprotIdAttr.length > 0
      ? uniprotIdAttr
      : undefined

  // Parse dbxref for additional IDs
  const dbxref = f.get('Dbxref') ?? f.get('dbxref') ?? f.get('db_xref')
  const dbxrefIds = extractIdsFromDbxref(parseDbxref(dbxref))
  for (const id of dbxrefIds) {
    recognizedIds.push(id)
  }

  // Get gene ID and name as fallbacks
  const geneId = f.get('gene_id') ?? f.get('ID')
  const geneName =
    f.get('gene_name') ?? f.get('gene') ?? f.get('name') ?? f.get('Name')

  return {
    recognizedIds: [...new Set(recognizedIds)],
    uniprotId,
    geneId: typeof geneId === 'string' ? geneId : undefined,
    geneName: typeof geneName === 'string' ? geneName : undefined,
  }
}

export function selectBestTranscript({
  options,
  isoformSequences,
  structureSequence,
}: {
  options: Feature[]
  isoformSequences: Record<string, { feature: Feature; seq: string }>
  structureSequence: string | undefined
}) {
  const exactMatch = options.find(
    f =>
      structureSequence &&
      stripStopCodon(isoformSequences[f.id()]?.seq ?? '') === structureSequence,
  )
  const longestWithData = options
    .filter(f => !!isoformSequences[f.id()])
    .sort(
      (a, b) =>
        isoformSequences[b.id()]!.seq.length -
        isoformSequences[a.id()]!.seq.length,
    )[0]
  return exactMatch ?? longestWithData
}
