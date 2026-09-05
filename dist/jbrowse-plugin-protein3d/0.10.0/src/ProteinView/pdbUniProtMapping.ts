// SIFTS UniProt <-> PDB residue mapping.
//
// UniProt feature coordinates are positions in the UniProt canonical sequence.
// For an AlphaFold model that *is* the structure's own sequence, so a feature at
// UniProt position p sits at structure position p - 1. For an experimental PDB
// entry it is not: the deposited construct is usually a fragment, often with
// tags or engineered residues, so the two numberings differ by a per-segment
// offset (1TUP's p53 chain starts at UniProt 94; 6VXX's spike SEQRES 33 is
// UniProt 14). SIFTS is the authoritative alignment between the two, published
// per entity/chain by PDBe.
//
// `residue_number` in the PDBe response is the 1-based index into the entity's
// SEQRES, i.e. label_seq_id, which is exactly this plugin's structure-sequence
// position + 1 (see applyLociInteractivity.ts for the other place that boundary
// is crossed).

/** One contiguous UniProt <-> structure correspondence for a single entity.
 * `unp*` are 1-based UniProt positions; `struct*` are 0-based inclusive
 * structure-sequence positions, this plugin's native coordinate. */
export interface UniProtStructureSegment {
  entityId: string
  unpStart: number
  unpEnd: number
  structStart: number
  structEnd: number
}

export interface UniProtStructureMapping {
  accession: string
  /** UniProt entry name, e.g. "P53_HUMAN" */
  name?: string
  segments: UniProtStructureSegment[]
}

/**
 * Maps a 1-based UniProt position to a 0-based structure-sequence position.
 * Returns undefined for positions outside the modeled region, so callers drop
 * the feature instead of drawing it somewhere misleading.
 */
export type MapUniProtPosition = (uniprotPos: number) => number | undefined

export function pdbeSiftsUrl(pdbId: string) {
  return `https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/${pdbId.toLowerCase()}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function residueNumber(endpoint: unknown) {
  return isRecord(endpoint) ? finiteNumber(endpoint.residue_number) : undefined
}

function parseSegment(mapping: unknown): UniProtStructureSegment | undefined {
  if (!isRecord(mapping)) {
    return undefined
  }
  const entityId = finiteNumber(mapping.entity_id)
  const unpStart = finiteNumber(mapping.unp_start)
  const unpEnd = finiteNumber(mapping.unp_end)
  const structStart = residueNumber(mapping.start)
  const structEnd = residueNumber(mapping.end)
  return entityId === undefined ||
    unpStart === undefined ||
    unpEnd === undefined ||
    structStart === undefined ||
    structEnd === undefined
    ? undefined
    : {
        entityId: String(entityId),
        unpStart,
        unpEnd,
        // SEQRES/label_seq_id is 1-based, structure positions are 0-based
        structStart: structStart - 1,
        structEnd: structEnd - 1,
      }
}

/**
 * Parses a PDBe `mappings/uniprot/{pdbId}` response into one entry per UniProt
 * accession. Unparseable segments are skipped rather than failing the whole
 * response — a chimera with one malformed segment still maps its other chains.
 * The response is keyed by pdb id, so the single entry is taken whatever its key.
 */
export function parseUniProtStructureMappings(
  json: unknown,
): UniProtStructureMapping[] {
  const entry = isRecord(json) ? Object.values(json)[0] : undefined
  const uniprot = isRecord(entry) ? entry.UniProt : undefined
  if (!isRecord(uniprot)) {
    return []
  }
  const result: UniProtStructureMapping[] = []
  for (const [accession, value] of Object.entries(uniprot)) {
    const mappings = isRecord(value) ? value.mappings : undefined
    const segments = Array.isArray(mappings)
      ? mappings.map(parseSegment).filter(s => s !== undefined)
      : []
    if (segments.length > 0) {
      result.push({
        accession,
        name:
          isRecord(value) && typeof value.name === 'string'
            ? value.name
            : undefined,
        segments,
      })
    }
  }
  return result
}

function coveredResidues(segments: UniProtStructureSegment[]) {
  return segments.reduce((a, s) => a + (s.structEnd - s.structStart + 1), 0)
}

/**
 * Picks the UniProt entry that describes a given entity, with its segments
 * narrowed to that entity. Only the entity the plugin has mapped to the
 * transcript is relevant — a heteromer maps each of its chains to a different
 * accession, and using the wrong one would silently annotate the wrong protein.
 * When several accessions cover the same entity (a chimeric construct) the one
 * contributing the most residues wins.
 */
export function chooseUniProtMappingForEntity(
  mappings: UniProtStructureMapping[],
  entityId: string | undefined,
): UniProtStructureMapping | undefined {
  if (entityId === undefined) {
    return undefined
  }
  let best: UniProtStructureMapping | undefined
  for (const mapping of mappings) {
    const segments = dedupeSegments(
      mapping.segments.filter(s => s.entityId === entityId),
    )
    if (
      segments.length > 0 &&
      (!best || coveredResidues(segments) > coveredResidues(best.segments))
    ) {
      best = { ...mapping, segments }
    }
  }
  return best
}

// SIFTS lists one mapping per *chain*, so the several chains of a homodimer
// repeat the same entity-level correspondence. They collapse to one segment.
function dedupeSegments(segments: UniProtStructureSegment[]) {
  const seen = new Set<string>()
  return segments.filter(s => {
    const key = `${s.unpStart}-${s.unpEnd}-${s.structStart}-${s.structEnd}`
    const isNew = !seen.has(key)
    seen.add(key)
    return isNew
  })
}

/** 1-based UniProt position -> 0-based structure position, for an AlphaFold
 * model whose sequence is the UniProt sequence. */
export const identityUniProtPositionMap: MapUniProtPosition = uniprotPos =>
  uniprotPos - 1

export function makeUniProtPositionMap(
  segments: UniProtStructureSegment[],
): MapUniProtPosition {
  return uniprotPos => {
    const segment = segments.find(
      s => uniprotPos >= s.unpStart && uniprotPos <= s.unpEnd,
    )
    if (!segment) {
      return undefined
    }
    const pos = segment.structStart + (uniprotPos - segment.unpStart)
    return pos <= segment.structEnd ? pos : undefined
  }
}
