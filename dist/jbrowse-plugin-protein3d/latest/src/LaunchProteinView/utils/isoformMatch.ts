import {
  LOW_IDENTITY_OVER_SHORTER,
  MIN_IDENTICAL_RESIDUES,
  SHORT_ALIGNMENT_IDENTITY,
  SHORT_ALIGNMENT_RESIDUES,
  alignmentTooLarge,
  stripStopCodon,
} from 'p2s_mapper'

import type { ClassifiedIsoforms } from 'p2s_mapper'

// p2s_mapper's isLowSimilarity, on the counts a ranking keeps: it takes a whole
// AlignmentQuality, and the ranking keeps no alignment to build one from
function isLowIdentity(identical: number, shorterLength: number) {
  const floor =
    identical < SHORT_ALIGNMENT_RESIDUES
      ? SHORT_ALIGNMENT_IDENTITY
      : LOW_IDENTITY_OVER_SHORTER
  return identical < MIN_IDENTICAL_RESIDUES || identical / shorterLength < floor
}

/**
 * How far the selected isoform's protein is from the chain it was ranked
 * against, by the ranking's alignment. Undefined when the two are the same
 * protein, when there was no chain to rank against, and when the pair was too
 * large to align, which the ranking reports as no identical residues.
 */
export function isoformMatch({
  ranking,
  selectedId,
  structureSequence,
}: {
  ranking?: ClassifiedIsoforms
  selectedId?: string
  structureSequence?: string
}) {
  const ranked = ranking?.nonMatches.find(i => i.id === selectedId)
  const chainLength = structureSequence
    ? stripStopCodon(structureSequence).length
    : 0
  return ranked?.identical !== undefined &&
    chainLength > 0 &&
    !alignmentTooLarge(ranked.length, chainLength)
    ? {
        identical: ranked.identical,
        chainLength,
        lowIdentity: isLowIdentity(
          ranked.identical,
          Math.min(ranked.length, chainLength),
        ),
      }
    : undefined
}
