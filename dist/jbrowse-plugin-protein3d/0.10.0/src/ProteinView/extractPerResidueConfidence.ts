// Minimal shape of the molstar Model fields we read. AlphaFold and ColabFold
// store the per-residue pLDDT in the B-factor column (B_iso_or_equiv), so the
// first atom of each residue yields pLDDT for a predicted model and the
// crystallographic B-factor for an experimental one.
interface ConfidenceModel {
  obj?: {
    data: {
      atomicConformation: {
        B_iso_or_equiv: { value: (row: number) => number }
      }
      atomicHierarchy: {
        residueAtomSegments: {
          offsets: ArrayLike<number>
          count: number
        }
        chainAtomSegments: {
          index: ArrayLike<number>
        }
        chains: {
          label_entity_id: { value: (row: number) => string }
        }
        residues: {
          label_seq_id: { value: (row: number) => number }
        }
      }
    }
  }
}

/**
 * Per-residue B-factor / pLDDT of one polymer entity, keyed by molstar's
 * `label_seq_id`. Keyed by id rather than by residue order because the atomic
 * hierarchy only holds *observed* residues: a chain with an unmodeled loop, or
 * a chain that is not the first in the file, would otherwise plot every value
 * against the wrong SEQRES position. Convert through `Entity.seqIds`.
 */
export interface EntityConfidence {
  entityId: string
  byLabelSeqId: Map<number, number>
}

export function extractPerResidueConfidence(
  model: ConfidenceModel,
): EntityConfidence[] | undefined {
  const data = model.obj?.data
  if (!data) {
    return undefined
  }
  const { B_iso_or_equiv } = data.atomicConformation
  const { residueAtomSegments, chainAtomSegments, chains, residues } =
    data.atomicHierarchy
  const byEntity = new Map<string, Map<number, number>>()
  for (let residue = 0; residue < residueAtomSegments.count; residue++) {
    const atom = residueAtomSegments.offsets[residue]!
    const entityId = chains.label_entity_id.value(
      chainAtomSegments.index[atom]!,
    )
    let values = byEntity.get(entityId)
    if (!values) {
      values = new Map()
      byEntity.set(entityId, values)
    }
    const seqId = residues.label_seq_id.value(residue)
    if (!values.has(seqId)) {
      values.set(seqId, B_iso_or_equiv.value(atom))
    }
  }
  return [...byEntity].map(([entityId, byLabelSeqId]) => ({
    entityId,
    byLabelSeqId,
  }))
}

/**
 * AlphaFold-style pLDDT lives in [0, 100] and varies across residues. A
 * constant column (common when a PDB has no B-factors) or out-of-range values
 * indicate the track wouldn't be meaningful as confidence.
 */
export function looksLikePlddt(
  values: number[] | undefined,
): values is number[] {
  return (
    !!values &&
    values.length > 1 &&
    values.every(v => v >= 0 && v <= 100) &&
    new Set(values).size > 1
  )
}
