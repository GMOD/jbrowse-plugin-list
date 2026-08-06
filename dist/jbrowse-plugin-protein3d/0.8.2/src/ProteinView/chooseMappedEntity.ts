import { alignmentTooLarge, runLocalAlignment } from './pairwiseAlignment'
import { stripStopCodon } from '../LaunchProteinView/utils/util'
import { structureAlignedSeq, transcriptAlignedSeq } from '../mappings'

import type { PairwiseAlignment } from '../mappings'
import type { AlignmentAlgorithm } from './types'

/**
 * Whether a structure interaction (hover/click) should drive genome navigation.
 * Only the transcript's mapped entity may — a hover on any other chain carries
 * that chain's own label_seq_id and would mis-map through the wrong alignment.
 * A structure with no resolved mapping (`mappedEntityId` undefined, e.g. a
 * standalone viewer with no transcript) stays fully interactive.
 */
export function interactionMatchesMappedEntity(
  entityId: string,
  mappedEntityId: string | undefined,
): boolean {
  return mappedEntityId === undefined || entityId === mappedEntityId
}

export interface EntitySelection {
  /** index into the entity-sequence array that best matches the transcript */
  index: number
  /** alignment of the transcript against the chosen entity (stop codons
   * stripped on both sides, matching the rest of the mapping pipeline) */
  alignment: PairwiseAlignment
  /** identical aligned residues, the score used to pick the entity */
  matches: number
}

function countMatches(pa: PairwiseAlignment) {
  const a = transcriptAlignedSeq(pa)
  const b = structureAlignedSeq(pa)
  let matches = 0
  for (let i = 0; i < a.length; i++) {
    const ca = a[i]
    const cb = b[i]
    if (ca !== '-' && cb !== '-' && ca?.toUpperCase() === cb?.toUpperCase()) {
      matches++
    }
  }
  return matches
}

/**
 * Pick which polymer entity of a structure corresponds to the transcript.
 *
 * The plugin historically hardcoded entity `[0]`, which silently mis-maps every
 * heteromeric / protein-DNA / processed-peptide structure where the protein of
 * interest is some other chain. Selecting by alignment makes the structure self-
 * describe which entity is the gene's protein: an exact sequence match wins
 * outright, otherwise the entity with the most identical aligned residues.
 *
 * Returns `undefined` only when there is nothing to map (no transcript or no
 * entities) — never a silent fallback to the wrong entity.
 */
export function chooseMappedEntity(
  transcript: string,
  entitySeqs: string[],
  algorithm: AlignmentAlgorithm,
): EntitySelection | undefined {
  const t = stripStopCodon(transcript)
  if (!t || entitySeqs.length === 0) {
    return undefined
  }

  const stripped = entitySeqs.map(stripStopCodon)

  const exactIndex = stripped.findIndex(s => s.length > 0 && s === t)
  if (exactIndex !== -1) {
    return {
      index: exactIndex,
      alignment: {
        consensus: '|'.repeat(t.length),
        alns: [
          { id: 'seq1', seq: t },
          { id: 'seq2', seq: stripped[exactIndex]! },
        ],
      },
      matches: t.length,
    }
  }

  // Each alignment is an O(len(t) * len(s)) main-thread DP, so a complex with
  // many chains pays it once per chain. Homomers and repeated chains share a
  // sequence, so align each distinct one once and reuse the result; oversized
  // chains (long nucleic-acid strands, say) are skipped rather than allowed to
  // lock up the tab.
  const bySeq = new Map<
    string,
    { alignment: PairwiseAlignment; matches: number }
  >()
  let best: EntitySelection | undefined
  for (let index = 0; index < stripped.length; index++) {
    const s = stripped[index]!
    if (s.length > 0 && !alignmentTooLarge(t.length, s.length)) {
      let scored = bySeq.get(s)
      if (!scored) {
        const alignment = runLocalAlignment(t, s, algorithm)
        scored = { alignment, matches: countMatches(alignment) }
        bySeq.set(s, scored)
      }
      if (!best || scored.matches > best.matches) {
        best = { index, ...scored }
      }
    }
  }
  return best
}
