export const VARIANT_EFFECT_SCHEMES = [
  'alphamissense',
  'clinvar',
  'genome-track',
] as const

export type VariantEffectScheme = (typeof VARIANT_EFFECT_SCHEMES)[number]

export const VARIANT_EFFECT_SOURCE_NAMES: Record<VariantEffectScheme, string> =
  {
    alphamissense: 'AlphaMissense scores',
    clinvar: 'ClinVar variants',
    'genome-track': 'Genome track scores',
  }

/**
 * A source's values by the coordinate it numbers. AlphaMissense numbers the
 * 1-based positions of a UniProt entry, beside the sequence it numbers; ClinVar
 * is read off the genome, so its values sit on the 0-based residues of the
 * structure's transcript.
 */
export type VariantEffectValues =
  | {
      numbering: 'uniprot'
      sequence: string
      byPosition: ReadonlyMap<number, number>
    }
  | {
      numbering: 'transcript'
      byPosition: ReadonlyMap<number, number>
    }

/**
 * A source that answered, but with values that would mislead, such as a VCF
 * read against the wrong build. Its message is the whole explanation.
 */
export class VariantEffectRefusal extends Error {}

/** Values of one entity's residues, keyed by label_seq_id */
export interface PlacedValues {
  entityId: string
  byLabelSeqId: ReadonlyMap<number, number>
}

/**
 * The mean AlphaMissense pathogenicity of every substitution at each residue,
 * the per-residue figure AlphaFold DB colors its models by. The sequence is
 * spelled from each row's reference residue, `X` where no row names one.
 */
export function meanScoreByPosition(
  rows: readonly { start: number; score: number; ref: string }[],
): VariantEffectValues {
  const sums = new Map<number, { total: number; count: number }>()
  const residues: (string | undefined)[] = []
  for (const { start, score, ref } of rows) {
    residues[start] = ref
    const sum = sums.get(start + 1)
    if (sum) {
      sum.total += score
      sum.count++
    } else {
      sums.set(start + 1, { total: score, count: 1 })
    }
  }
  return {
    numbering: 'uniprot',
    sequence: Array.from(residues, r => r ?? 'X').join(''),
    byPosition: new Map(
      [...sums].map(([position, { total, count }]) => [
        position,
        total / count,
      ]),
    ),
  }
}

/**
 * Carries a source's per-position values onto one entity's residues through
 * `toStructurePosition`, which places only what it can: a residue the map
 * does not reach gets no value rather than a neighbour's.
 */
export function placeValues(
  byPosition: ReadonlyMap<number, number>,
  toStructurePosition: (position: number) => number | undefined,
  entity: { entityId: string; seqIds: readonly number[] },
): PlacedValues {
  const byLabelSeqId = new Map<number, number>()
  for (const [position, value] of byPosition) {
    const structurePos = toStructurePosition(position)
    const labelSeqId =
      structurePos === undefined ? undefined : entity.seqIds[structurePos]
    if (labelSeqId !== undefined) {
      byLabelSeqId.set(labelSeqId, value)
    }
  }
  return { entityId: entity.entityId, byLabelSeqId }
}
