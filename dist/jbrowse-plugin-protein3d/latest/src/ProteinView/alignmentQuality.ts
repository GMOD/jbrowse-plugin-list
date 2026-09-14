import {
  alignmentLength,
  structureAlignedSeq,
  transcriptAlignedSeq,
} from '../mappings'

import type { PairwiseAlignment } from '../mappings'

export interface AlignmentQuality {
  /** columns carrying a residue on both rows, i.e. mapped positions */
  aligned: number
  identical: number
  transcriptLength: number
  structureLength: number
  /** identical over aligned; 0 when nothing aligned */
  identity: number
  /** identical over the shorter of the two sequences: the statistic that
   * separates a real match from a chance local alignment, see below */
  identityOverShorter: number
  /** aligned over the structure's length */
  structureCoverage: number
}

/**
 * Below either floor the mapped positions are as likely to be chance as
 * homology. Local alignment picks the best-scoring stretch of two sequences,
 * so identity over the aligned columns is inflated whatever the inputs:
 * measured 2026-09-11 on random sequences, Smith-Waterman with BLOSUM62 gave
 * 37% identity over 27 columns at 300 × 300 and 30% over 100 columns at
 * 500 × 150, two thirds of the shorter chain, and p53 against a ribosomal
 * protein (7K00 RPS11) gives 31 identities at a third identity. Neither local
 * identity nor coverage alone separates those from a real match. Identical
 * residues over the shorter sequence does: 0.03, 0.20 and 0.24 for the chance
 * cases against 0.9 or better for any structure of the transcript's protein
 * and about 0.6 for an ortholog.
 *
 * A short alignment has to be nearly perfect instead: a 10-residue decoy with
 * 3 identities sits at the ratio floor, while a real bound peptide (1YCR's 15
 * p53 residues, 4ZZJ's 7) is identical or one off. So under
 * SHORT_ALIGNMENT_RESIDUES identical residues the ratio floor rises to
 * SHORT_ALIGNMENT_IDENTITY, and under MIN_IDENTICAL_RESIDUES nothing passes,
 * since a tetrapeptide is never the gene's product.
 */
export const LOW_IDENTITY_OVER_SHORTER = 0.3
export const SHORT_ALIGNMENT_RESIDUES = 20
export const SHORT_ALIGNMENT_IDENTITY = 0.8
export const MIN_IDENTICAL_RESIDUES = 5

export function alignmentQuality(pa: PairwiseAlignment): AlignmentQuality {
  const t = transcriptAlignedSeq(pa)
  const s = structureAlignedSeq(pa)
  let aligned = 0
  let identical = 0
  let transcriptLength = 0
  let structureLength = 0
  for (let i = 0; i < alignmentLength(pa); i++) {
    const a = t[i]!
    const b = s[i]!
    const ta = a !== '-'
    const sb = b !== '-'
    if (ta) {
      transcriptLength++
    }
    if (sb) {
      structureLength++
    }
    if (ta && sb) {
      aligned++
      if (a.toUpperCase() === b.toUpperCase()) {
        identical++
      }
    }
  }
  const shorter = Math.min(transcriptLength, structureLength)
  return {
    aligned,
    identical,
    transcriptLength,
    structureLength,
    identity: aligned ? identical / aligned : 0,
    identityOverShorter: shorter ? identical / shorter : 0,
    structureCoverage: structureLength ? aligned / structureLength : 0,
  }
}

export function isLowSimilarity(q: AlignmentQuality) {
  const floor =
    q.identical < SHORT_ALIGNMENT_RESIDUES
      ? SHORT_ALIGNMENT_IDENTITY
      : LOW_IDENTITY_OVER_SHORTER
  return q.identical < MIN_IDENTICAL_RESIDUES || q.identityOverShorter < floor
}

/** One line for the alignment header: "87% identity over 219 of 393
 * structure residues". */
export function describeAlignmentQuality(q: AlignmentQuality) {
  if (q.aligned === 0) {
    return 'no residues aligned'
  }
  return `${Math.round(q.identity * 100)}% identity over ${q.aligned} of ${q.structureLength} structure residues`
}
