import {
  pairwiseAlignmentProblem,
  pairwiseAlignmentSequenceProblem,
  stripStopCodon,
  structureAlignedSeq,
  transcriptAlignedSeq,
} from 'p2s_mapper'

import type { Entity, PairwiseAlignment } from 'p2s_mapper'

function withoutStopColumn(alignment: PairwiseAlignment): PairwiseAlignment {
  const t = transcriptAlignedSeq(alignment)
  const s = structureAlignedSeq(alignment)
  const [a, b] = alignment.alns
  return t.endsWith('*') && s.endsWith('-')
    ? {
        consensus: alignment.consensus.slice(0, -1),
        alns: [
          { ...a, seq: t.slice(0, -1) },
          { ...b, seq: s.slice(0, -1) },
        ],
      }
    : alignment
}

export function entityAlignedTo(
  supplied: PairwiseAlignment,
  transcript: string,
  entities: readonly Entity[],
  preferredId?: string,
): { entityId: string } | { problem: string } {
  const alignment = withoutStopColumn(supplied)
  const t = stripStopCodon(transcript)
  const shape = pairwiseAlignmentProblem(alignment)
  if (shape) {
    return { problem: shape }
  }
  const ownRow = structureAlignedSeq(alignment).replaceAll('-', '')
  const transcriptProblem = pairwiseAlignmentSequenceProblem(
    alignment,
    t,
    ownRow,
  )
  if (transcriptProblem) {
    return { problem: transcriptProblem }
  }
  const rank = (e: Entity) =>
    (e.entityId === preferredId ? 0 : 2) + (e.nucleicAcid ? 1 : 0)
  const match = [...entities]
    .sort((a, b) => rank(a) - rank(b))
    .find(
      e =>
        !pairwiseAlignmentSequenceProblem(alignment, t, stripStopCodon(e.seq)),
    )
  return match
    ? { entityId: match.entityId }
    : {
        problem: `The second sequence (${ownRow.length} residues) is not the sequence of any chain in this structure`,
      }
}
