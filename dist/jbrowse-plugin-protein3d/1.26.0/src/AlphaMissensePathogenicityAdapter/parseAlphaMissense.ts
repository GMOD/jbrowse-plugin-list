import type { ProteinAnnotationRow } from '../BaseProteinAnnotationAdapter'

export interface AlphaMissenseRow extends ProteinAnnotationRow {
  score: number
  ref: string
  variant: string
  am_class: string
}

/**
 * Parses AlphaMissense CSV text (protein_variant,score,am_class). The
 * protein_variant column looks like "V123L": a ref AA, a 1-based residue
 * coordinate, and a variant AA, converted here to a 0-based half-open interval
 * to match the interbase protein reference sequence. Rows that don't match the
 * ref/coord/variant shape are skipped rather than emitted as bogus features (a
 * short string like "VL" would otherwise parse to a position-0 feature).
 */
const VARIANT_RE = /^([A-Za-z])(\d+)([A-Za-z])$/

export function parseAlphaMissense(text: string): AlphaMissenseRow[] {
  return text
    .split('\n')
    .slice(1)
    .map(f => f.trim())
    .filter(f => !!f)
    .flatMap((row, idx) => {
      const [protein_variant = '', score, am_class] = row.split(',')
      const match = VARIANT_RE.exec(protein_variant)
      return match && score !== undefined && am_class !== undefined
        ? [
            {
              uniqueId: `feat-${idx}`,
              ref: match[1]!,
              variant: match[3]!,
              start: +match[2]! - 1,
              end: +match[2]!,
              score: +score,
              am_class,
            },
          ]
        : []
    })
}
