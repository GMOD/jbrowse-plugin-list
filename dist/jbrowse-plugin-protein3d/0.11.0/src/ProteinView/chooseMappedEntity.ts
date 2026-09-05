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

export interface EntitySelection extends ScoredAlignment {
  /** index into the candidate array of the entity that is the transcript's */
  index: number
}

export interface ScoredAlignment {
  /** alignment of the transcript against the entity (stop codons stripped on
   * both sides, matching the rest of the mapping pipeline) */
  alignment: PairwiseAlignment
  /** identical aligned residues */
  matches: number
  /** the share of the entity's residues the transcript reproduces, the score
   * that picks the entity; see `explainedFraction` */
  explained: number
}

/** A candidate entity: its sequence, and whether it is DNA/RNA, which is never
 * the transcript's product however its letters happen to align. */
export interface EntityCandidate {
  seq: string
  nucleicAcid?: boolean
}

/**
 * How much of an entity the transcript accounts for: identical residues over
 * the entity's length. A raw match count favours whatever chain is longest,
 * and a complex's partner usually is: on 1H26 the 11-residue p53 peptide
 * matches 11 while CDK2 accrues 58 scattered identities, and on 4ZZJ SIRT1
 * beats the 7-residue p53 peptide 63 to 6. The Smith-Waterman score is no
 * better there (56 vs 58). Dividing by the entity's length asks the question
 * the picker actually has, which chain *is* this gene's product: the peptide
 * scores 0.69 and 0.50, the partners 0.19 and 0.17, and across a ribosome's
 * 55 chains no decoy passes 0.29. The pseudocount keeps a two-residue
 * fragment that happens to match (a tRNA end in 7K00) from scoring 1.0.
 */
const EXPLAINED_PSEUDOCOUNT = 5

export function explainedFraction(matches: number, entityLength: number) {
  return matches / (entityLength + EXPLAINED_PSEUDOCOUNT)
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
 * Align one transcript to one entity, stop codons stripped on both sides. An
 * exact match skips the DP entirely; an oversized pair returns undefined rather
 * than locking up the tab. Used both to score every entity of a structure and
 * to honour a user's explicit chain choice.
 */
export function alignTranscriptToEntity(
  transcript: string,
  entitySeq: string,
  algorithm: AlignmentAlgorithm,
): ScoredAlignment | undefined {
  const t = stripStopCodon(transcript)
  const s = stripStopCodon(entitySeq)
  if (!t || !s || alignmentTooLarge(t.length, s.length)) {
    return undefined
  }
  if (s === t) {
    return {
      alignment: {
        consensus: '|'.repeat(t.length),
        alns: [
          { id: 'seq1', seq: t },
          { id: 'seq2', seq: s },
        ],
      },
      matches: t.length,
      explained: explainedFraction(t.length, s.length),
    }
  }
  const alignment = runLocalAlignment(t, s, algorithm)
  const matches = countMatches(alignment)
  return { alignment, matches, explained: explainedFraction(matches, s.length) }
}

/**
 * Pick which polymer entity of a structure corresponds to the transcript.
 *
 * The plugin historically hardcoded entity `[0]`, which silently mis-maps every
 * heteromeric / protein-DNA / processed-peptide structure where the protein of
 * interest is some other chain. Selecting by alignment makes the structure self-
 * describe which entity is the gene's protein: an exact sequence match wins
 * outright, otherwise the entity the transcript explains the largest share of
 * (see `explainedFraction`). Nucleic-acid entities are never candidates.
 *
 * Returns `undefined` only when there is nothing to map (no transcript or no
 * protein entities) — never a silent fallback to the wrong entity.
 */
export function chooseMappedEntity(
  transcript: string,
  entities: readonly (string | EntityCandidate)[],
  algorithm: AlignmentAlgorithm,
): EntitySelection | undefined {
  const t = stripStopCodon(transcript)
  if (!t) {
    return undefined
  }

  const candidates = entities.map(e =>
    typeof e === 'string'
      ? { seq: stripStopCodon(e) }
      : { ...e, seq: stripStopCodon(e.seq) },
  )
  const exactIndex = candidates.findIndex(
    c => !c.nucleicAcid && c.seq.length > 0 && c.seq === t,
  )
  if (exactIndex !== -1) {
    const exact = alignTranscriptToEntity(
      t,
      candidates[exactIndex]!.seq,
      algorithm,
    )!
    return { index: exactIndex, ...exact }
  }

  // Each alignment is an O(len(t) * len(s)) main-thread DP, so a complex with
  // many chains pays it once per chain. Homomers and repeated chains share a
  // sequence, so align each distinct one once and reuse the result.
  const bySeq = new Map<string, ScoredAlignment | undefined>()
  let best: EntitySelection | undefined
  for (let index = 0; index < candidates.length; index++) {
    const { seq, nucleicAcid } = candidates[index]!
    if (nucleicAcid) {
      continue
    }
    if (!bySeq.has(seq)) {
      bySeq.set(seq, alignTranscriptToEntity(t, seq, algorithm))
    }
    const scored = bySeq.get(seq)
    if (scored && (!best || scored.explained > best.explained)) {
      best = { index, ...scored }
    }
  }
  return best
}
