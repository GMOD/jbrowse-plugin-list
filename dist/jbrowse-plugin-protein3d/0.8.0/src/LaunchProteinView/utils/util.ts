import type { Feature } from '@jbrowse/core/util'

export function stripStopCodon(seq: string) {
  return seq.replaceAll('*', '')
}

/**
 * Pull an NCBI taxon id out of reference-sequence-track metadata. jb2hubs
 * assemblies expose it differently by source: UCSC golden-path spreads it flat
 * (`metadata.taxId`), GenArk nests the raw hub stanza (`metadata.ucsc.taxId`).
 * `taxonId` is accepted too. Returns a positive integer, or undefined when
 * absent/unparseable so callers can fall back to a default organism.
 */
export function extractTaxonId(metadata: unknown): number | undefined {
  if (metadata === null || typeof metadata !== 'object') {
    return undefined
  }
  const m = metadata as Record<string, unknown>
  const ucsc =
    m.ucsc !== null && typeof m.ucsc === 'object'
      ? (m.ucsc as Record<string, unknown>)
      : undefined
  const n = Number(m.taxId ?? m.taxonId ?? ucsc?.taxId)
  return Number.isFinite(n) && n > 0 ? n : undefined
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

export function getId(val?: Feature): string {
  return val === undefined ? '' : val.id()
}

export function getTranscriptDisplayName(val?: Feature): string {
  return val === undefined ? '' : (val.get('name') ?? val.get('id') ?? '')
}

export function getGeneDisplayName(val?: Feature): string {
  return val === undefined
    ? ''
    : (val.get('gene_name') ?? val.get('name') ?? val.get('id') ?? '')
}

export function getUniProtIdFromFeature(f?: Feature): string | undefined {
  if (!f) {
    return undefined
  }
  return f.get('uniprot') ?? f.get('uniprotId') ?? f.get('uniprotid')
}

// Single source of truth for database IDs that UniProt can cross-reference.
// Each entry carries everything downstream needs: the UniProt xref database
// keyword, the regex (Ensembl patterns cover human ENS, mouse ENSMUS, zebrafish
// ENSDAR, etc.), and a human-readable label. Recognition, label rendering, and
// xref-query building all derive from this list, so a new ID type is one entry.
type DbType = 'ensembl' | 'refseq' | 'ccds' | 'hgnc'

const DB_ID_PATTERNS: { db: DbType; pattern: RegExp; label: string }[] = [
  { db: 'ensembl', pattern: /^ENS[A-Z]*G\d+/i, label: 'Ensembl gene' },
  { db: 'ensembl', pattern: /^ENS[A-Z]*T\d+/i, label: 'Ensembl transcript' },
  { db: 'ensembl', pattern: /^ENS[A-Z]*P\d+/i, label: 'Ensembl protein' },
  { db: 'refseq', pattern: /^[NX]M_\d+/i, label: 'RefSeq mRNA' },
  { db: 'refseq', pattern: /^[NX]R_\d+/i, label: 'RefSeq ncRNA' },
  { db: 'refseq', pattern: /^[NX]P_\d+/i, label: 'RefSeq protein' },
  { db: 'ccds', pattern: /^CCDS\d+/i, label: 'CCDS' },
  { db: 'hgnc', pattern: /^HGNC:\d+/i, label: 'HGNC' },
]

function matchDbIdPattern(id: string) {
  return DB_ID_PATTERNS.find(p => p.pattern.test(id))
}

// Check if an ID is a recognized database identifier that UniProt can map
export function isRecognizedDatabaseId(id: string) {
  return matchDbIdPattern(id) !== undefined
}

// Human-readable label for an ID, e.g. "ENST00000123 (Ensembl transcript)".
// Unrecognized IDs are returned unadorned.
export function getDbIdLabel(id: string) {
  const match = matchDbIdPattern(id)
  return match ? `${id} (${match.label})` : id
}

// Build the UniProt xref query fragment for a recognized ID, e.g.
// "xref:ensembl-ENST00000123". HGNC strips its redundant "HGNC:" prefix.
export function buildUniProtXrefQuery(id: string) {
  const match = matchDbIdPattern(id)
  return match
    ? `xref:${match.db}-${match.db === 'hgnc' ? id.replace('HGNC:', '') : id}`
    : undefined
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

// New helper function to extract recognized DB IDs
export function findRecognizedDbIds(f?: Feature): string[] {
  if (!f) {
    return []
  }

  const recognizedIds: string[] = []

  // Check various feature attributes for recognized IDs
  const attributesToCheck = [
    f.get('ID'),
    f.get('id'),
    f.get('name'),
    f.get('Name'),
    f.get('transcript_id'),
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
    } else if (matchDbIdPattern(hgncStr)?.db === 'hgnc') {
      recognizedIds.push(hgncStr)
    }
  }

  // Parse dbxref for additional IDs
  const dbxref = f.get('Dbxref') ?? f.get('dbxref') ?? f.get('db_xref')
  const dbxrefIds = extractIdsFromDbxref(parseDbxref(dbxref))
  for (const id of dbxrefIds) {
    recognizedIds.push(id)
  }

  return [...new Set(recognizedIds)]
}

export interface FeatureIdentifiers {
  recognizedIds: string[]
  uniprotId?: string
  geneId?: string
  geneName?: string
}

/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * If the feature is a gene, prioritizes identifiers from its first transcript.
 * Otherwise, extracts identifiers from the feature itself.
 * geneId and geneName are always extracted from the parent feature 'f'.
 */
export function extractFeatureIdentifiers(f?: Feature): FeatureIdentifiers {
  if (!f) {
    return { recognizedIds: [] }
  }

  let featureToProcess = f // Default to the parent feature

  // If the feature is a gene, try to get identifiers from its first transcript.
  if (f.get('type') === 'gene') {
    const transcripts = getTranscriptFeatures(f)
    if (transcripts.length > 0) {
      featureToProcess = transcripts[0]! // Prioritize the first transcript (length > 0 checked above)
    }
    // If no transcripts found, featureToProcess remains the parent gene 'f'.
  }

  // --- Extracting Recognized IDs and UniProt ID from featureToProcess ---
  const recognizedIds = findRecognizedDbIds(featureToProcess)

  // Handle UniProt ID from feature attributes (trust that it's valid if present)
  const uniprotIdAttr =
    featureToProcess.get('uniprot') ??
    featureToProcess.get('uniprotId') ??
    featureToProcess.get('uniprotid') ??
    featureToProcess.get('UniProt')
  const uniprotId =
    typeof uniprotIdAttr === 'string' && uniprotIdAttr.length > 0
      ? uniprotIdAttr
      : undefined

  // --- Get gene ID and name as fallbacks from the original parent feature 'f' ---
  // This assumes gene_id and gene_name are attributes of the parent gene, not the transcript.
  const geneId = f.get('gene_id') ?? f.get('ID')
  const geneName =
    f.get('gene_name') ?? f.get('gene') ?? f.get('name') ?? f.get('Name')

  return {
    recognizedIds: [...new Set(recognizedIds)], // Ensure unique IDs
    uniprotId,
    geneId: typeof geneId === 'string' ? geneId : undefined,
    geneName: typeof geneName === 'string' ? geneName : undefined,
  }
}

export interface IsoformSequence {
  feature: Feature
  seq: string
}

export type IsoformSequences = Record<string, IsoformSequence>

export interface RankedIsoform {
  feature: Feature
  length: number
}

export interface ClassifiedIsoforms {
  // protein matches the structure residues, longest first
  matches: RankedIsoform[]
  // has a protein sequence but doesn't match the structure, longest first
  nonMatches: RankedIsoform[]
  // no protein sequence could be computed
  noData: Feature[]
}

// The single rule for ranking transcript isoforms against a structure, shared
// by the picker UI and the auto-selection: partition by whether the translated
// protein matches the structure residues, with each group ordered longest-first.
export function classifyIsoforms({
  options,
  isoformSequences,
  structureSequence,
}: {
  options: Feature[]
  isoformSequences: IsoformSequences
  structureSequence?: string
}): ClassifiedIsoforms {
  const matches: RankedIsoform[] = []
  const nonMatches: RankedIsoform[] = []
  const noData: Feature[] = []
  for (const feature of options) {
    const entry = isoformSequences[feature.id()]
    const ranked = { feature, length: entry?.seq.length ?? 0 }
    if (!entry) {
      noData.push(feature)
    } else if (
      structureSequence &&
      stripStopCodon(entry.seq) === structureSequence
    ) {
      matches.push(ranked)
    } else {
      nonMatches.push(ranked)
    }
  }
  const byLengthDesc = (a: RankedIsoform, b: RankedIsoform) =>
    b.length - a.length
  return {
    matches: matches.toSorted(byLengthDesc),
    nonMatches: nonMatches.toSorted(byLengthDesc),
    noData,
  }
}

export function selectBestTranscript(args: {
  options: Feature[]
  isoformSequences: IsoformSequences
  structureSequence?: string
}) {
  const { matches, nonMatches } = classifyIsoforms(args)
  return (matches[0] ?? nonMatches[0])?.feature
}
