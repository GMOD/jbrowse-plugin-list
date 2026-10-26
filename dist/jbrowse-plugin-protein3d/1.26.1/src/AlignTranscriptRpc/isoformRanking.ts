import { classifyIsoforms, pickStructureSequence } from 'p2s_mapper'

import type { ClassifiedIsoforms, Isoform, RankedIsoform } from 'p2s_mapper'

export interface IsoformRanking {
  /** the chain the isoforms are compared against; see pickStructureSequence */
  structureSequence?: string
  ranking: ClassifiedIsoforms
}

/** The launch dialog's isoform order: one alignment per chain to pick the
 * chain, then one per isoform that does not match it exactly. */
export function rankIsoforms(
  isoforms: Isoform[],
  structureSequences?: string[],
): IsoformRanking {
  const structureSequence = pickStructureSequence(structureSequences, isoforms)
  return {
    structureSequence,
    ranking: classifyIsoforms({ isoforms, structureSequence }),
  }
}

/**
 * The isoform to open from a ranking. An exact match to the structure wins;
 * the annotation's flagged transcript (MANE Select) breaks a tie between exact
 * matches, and leads when there is no structure to rank against, where length
 * alone would decide.
 */
export function rankedTranscriptId(
  { matches, nonMatches }: ClassifiedIsoforms,
  flaggedId?: string,
) {
  const flagged = (list: RankedIsoform[]) => list.find(i => i.id === flaggedId)
  const unranked = nonMatches.every(i => i.score === undefined)
  return (
    flagged(matches) ??
    matches[0] ??
    (unranked ? flagged(nonMatches) : undefined) ??
    nonMatches[0]
  )?.id
}
