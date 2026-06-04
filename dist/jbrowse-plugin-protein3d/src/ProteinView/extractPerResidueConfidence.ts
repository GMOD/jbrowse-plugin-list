// Minimal shape of the molstar Model fields we read. AlphaFold structures
// store the per-residue pLDDT in the B-factor column (B_iso_or_equiv), so
// reading the first atom of each residue yields pLDDT for AlphaFold files and
// the crystallographic B-factor for experimental ones.
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
      }
    }
  }
}

/**
 * Per-residue B-factor / pLDDT, indexed by 0-based residue order (which aligns
 * with the structure's first-chain sequence for AlphaFold models). `maxLength`
 * caps the result to the structure sequence length so trailing chains/hetero
 * residues don't bleed in.
 */
export function extractPerResidueConfidence(
  model: ConfidenceModel,
  maxLength?: number,
): number[] | undefined {
  const data = model.obj?.data
  if (!data) {
    return undefined
  }
  const { B_iso_or_equiv } = data.atomicConformation
  const { offsets, count } = data.atomicHierarchy.residueAtomSegments
  const n = maxLength === undefined ? count : Math.min(count, maxLength)
  const values: number[] = []
  for (let i = 0; i < n; i++) {
    values.push(B_iso_or_equiv.value(offsets[i]!))
  }
  return values
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
