import type { MapUniProtPosition } from 'p2s_mapper'

export const VARIANT_EFFECT_SCHEMES = ['alphamissense', 'clinvar'] as const

export type VariantEffectScheme = (typeof VARIANT_EFFECT_SCHEMES)[number]

export function isVariantEffectScheme(
  scheme: string | undefined,
): scheme is VariantEffectScheme {
  return VARIANT_EFFECT_SCHEMES.some(s => s === scheme)
}

export const VARIANT_EFFECT_SOURCE_NAMES: Record<VariantEffectScheme, string> =
  {
    alphamissense: 'AlphaMissense scores',
    clinvar: 'ClinVar variants',
  }

/**
 * A value per 1-based position of a UniProt entry, beside the sequence the
 * source numbers those positions on
 */
export interface UniProtValues {
  sequence: string
  byPosition: ReadonlyMap<number, number>
}

/** Values of one entity's residues, keyed by label_seq_id */
export interface PlacedValues {
  entityId: string
  byLabelSeqId: ReadonlyMap<number, number>
}

/**
 * The mean AlphaMissense pathogenicity of every substitution at each residue,
 * the per-residue figure AlphaFold DB colours its models by. The sequence is
 * spelled from each row's reference residue, `X` where no row names one.
 */
export function meanScoreByPosition(
  rows: readonly { start: number; score: number; ref: string }[],
): UniProtValues {
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
    sequence: Array.from(residues, r => r ?? 'X').join(''),
    byPosition: new Map(
      [...sums].map(([position, { total, count }]) => [
        position,
        total / count,
      ]),
    ),
  }
}

export interface VariationEntry {
  sequence?: string
  features: readonly {
    begin: string
    end: string
    mutatedType?: string
    consequenceType?: string
    clinicalSignificances?: readonly { type: string; sources?: string[] }[]
  }[]
}

const PATHOGENIC_SIGNIFICANCE = new Set(['Pathogenic', 'Likely pathogenic'])

/**
 * How many distinct missense substitutions ClinVar calls pathogenic or likely
 * pathogenic at each residue of the entry, from the EBI proteins API's
 * variation record. Every residue of the entry gets a count, zero included,
 * so a residue with none is told apart from one the structure cannot place.
 * A substitution reported by several ClinVar records (two codon changes to
 * one amino acid) counts once; a significance only Ensembl or UniProt
 * asserts does not count.
 */
export function pathogenicCountByPosition({
  sequence = '',
  features,
}: VariationEntry): UniProtValues {
  const substitutions = new Map<number, Set<string>>()
  for (const f of features) {
    if (
      f.consequenceType === 'missense' &&
      f.clinicalSignificances?.some(
        c =>
          PATHOGENIC_SIGNIFICANCE.has(c.type) && c.sources?.includes('ClinVar'),
      )
    ) {
      for (let pos = +f.begin; pos <= +f.end; pos++) {
        const seen = substitutions.get(pos) ?? new Set()
        seen.add(`${f.begin}-${f.end}${f.mutatedType ?? ''}`)
        substitutions.set(pos, seen)
      }
    }
  }
  return {
    sequence,
    byPosition: new Map(
      Array.from(sequence, (_, i) => [
        i + 1,
        substitutions.get(i + 1)?.size ?? 0,
      ]),
    ),
  }
}

/**
 * Carries an entry's per-position values onto one entity's residues through
 * `mapUniProtPosition` (see structureUniProt), which places only what it can:
 * a residue the map does not reach gets no value rather than a neighbour's.
 */
export function placeValues(
  values: UniProtValues,
  mapUniProtPosition: MapUniProtPosition,
  entity: { entityId: string; seqIds: readonly number[] },
): PlacedValues {
  const byLabelSeqId = new Map<number, number>()
  for (const [position, value] of values.byPosition) {
    const structurePos = mapUniProtPosition(position)
    const labelSeqId =
      structurePos === undefined ? undefined : entity.seqIds[structurePos]
    if (labelSeqId !== undefined) {
      byLabelSeqId.set(labelSeqId, value)
    }
  }
  return { entityId: entity.entityId, byLabelSeqId }
}

type Rgb = readonly [number, number, number]

function hexRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * AlphaMissense's scale as the 1D protein view's track draws it and AlphaFold
 * DB colours it: likely benign blue, ambiguous white at 0.5, likely
 * pathogenic red.
 */
export const ALPHAMISSENSE_RANGE = ['#2c7bb6', '#ffffff', '#d7191c'] as const
export const ALPHAMISSENSE_MID = 0.5

const [BENIGN, AMBIGUOUS, PATHOGENIC] = ALPHAMISSENSE_RANGE.map(hexRgb)

export function alphaMissenseRgb(score: number): Rgb {
  const t = Math.max(0, Math.min(1, score))
  const [from, to, f] =
    t < ALPHAMISSENSE_MID
      ? [BENIGN!, AMBIGUOUS!, t / ALPHAMISSENSE_MID]
      : [AMBIGUOUS!, PATHOGENIC!, (t - ALPHAMISSENSE_MID) / ALPHAMISSENSE_MID]
  const mix = (i: 0 | 1 | 2) => Math.round(from[i] + (to[i] - from[i]) * f)
  return [mix(0), mix(1), mix(2)]
}

/** ColorBrewer Reds, one step per pathogenic substitution up to four */
export const CLINVAR_COLORS = [
  '#fee5d9',
  '#fcae91',
  '#fb6a4a',
  '#de2d26',
  '#a50f15',
] as const

export function clinVarRgb(count: number): Rgb {
  const index = Math.max(0, Math.min(CLINVAR_COLORS.length - 1, count))
  return hexRgb(CLINVAR_COLORS[index]!)
}
