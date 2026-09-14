// PDBe's SIFTS-derived list of the experimental structures covering a UniProt
// entry, one row per chain, ranked by PDBe (coverage, then resolution). The
// dialog shows one row per entry, so the chains of a homomer collapse into it.

export interface PdbStructureEntry {
  pdbId: string
  experimentalMethod: string
  /** Å; absent for NMR and some EM entries */
  resolution?: number
  /** 1-based inclusive UniProt positions the entry covers */
  unpStart: number
  unpEnd: number
  /** share of the UniProt sequence the entry covers, 0..1 */
  coverage: number
  chains: string[]
}

export function pdbeBestStructuresUrl(uniprotId: string) {
  return `https://www.ebi.ac.uk/pdbe/api/mappings/best_structures/${uniprotId}`
}

export function rcsbEntryUrl(pdbId: string) {
  return `https://www.rcsb.org/structure/${pdbId.toUpperCase()}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/**
 * Groups the per-chain rows into one entry per PDB id, keeping PDBe's order.
 * An entry whose chains cover different UniProt ranges (a construct
 * crystallised beside a different fragment of itself) keeps its first row's
 * range, which is the one PDBe ranked it by. The response is keyed by
 * accession, so the single entry is taken whatever its key.
 */
export function parseBestStructures(json: unknown): PdbStructureEntry[] {
  const rows = isRecord(json) ? Object.values(json)[0] : undefined
  if (!Array.isArray(rows)) {
    return []
  }
  const byId = new Map<string, PdbStructureEntry>()
  for (const row of rows) {
    if (!isRecord(row)) {
      continue
    }
    const pdbId = typeof row.pdb_id === 'string' ? row.pdb_id : undefined
    const chain = typeof row.chain_id === 'string' ? row.chain_id : undefined
    const unpStart = finiteNumber(row.unp_start)
    const unpEnd = finiteNumber(row.unp_end)
    const coverage = finiteNumber(row.coverage)
    if (
      pdbId === undefined ||
      chain === undefined ||
      unpStart === undefined ||
      unpEnd === undefined ||
      coverage === undefined
    ) {
      continue
    }
    const existing = byId.get(pdbId)
    if (existing) {
      if (!existing.chains.includes(chain)) {
        existing.chains.push(chain)
      }
      continue
    }
    const resolution = finiteNumber(row.resolution)
    byId.set(pdbId, {
      pdbId,
      experimentalMethod:
        typeof row.experimental_method === 'string'
          ? row.experimental_method
          : 'unknown',
      ...(resolution === undefined ? {} : { resolution }),
      unpStart,
      unpEnd,
      coverage,
      chains: [chain],
    })
  }
  return [...byId.values()]
}
