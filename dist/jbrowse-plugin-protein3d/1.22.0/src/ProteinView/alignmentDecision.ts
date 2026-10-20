import { isIdentical } from './alignOffThread'
import { entityAlignedTo } from './entityAlignedTo'

import type { Entity, PairwiseAlignment } from 'p2s_mapper'

/**
 * `keep` and `adopt` leave a chain pick still aligning alone; the others
 * supersede it. `identical` marks a free alignment, applied without the
 * worker.
 */
export type AlignmentDecision =
  | { kind: 'nothingToAlign' }
  | { kind: 'keep' }
  | { kind: 'adopt'; entityId: string }
  | { kind: 'discard'; problem: string }
  | {
      kind: 'realign'
      problem: string
      transcript: string
      entity: Entity
      identical: boolean
    }
  | {
      kind: 'choose'
      transcript: string
      entities: readonly Entity[]
      identical: boolean
    }

export interface AlignmentState {
  readonly userProvidedTranscriptSequence: string
  readonly entities: readonly Entity[] | undefined
  readonly pairwiseAlignment: PairwiseAlignment | undefined
  readonly alignmentImported: boolean
  readonly mappedEntityId: string | undefined
}

/**
 * Keeps an alignment computed here. Maps an imported one onto the chain it
 * spells, realigns one that spells none against the stored protein chain, and
 * otherwise discards it. Reads only the fields each branch needs, so an
 * autorun calling it tracks no more.
 */
export function decideAlignment(state: AlignmentState): AlignmentDecision {
  const {
    userProvidedTranscriptSequence: transcript,
    entities,
    pairwiseAlignment,
  } = state
  if (!transcript || !entities?.length) {
    return { kind: 'nothingToAlign' }
  }
  if (pairwiseAlignment) {
    if (!state.alignmentImported) {
      return { kind: 'keep' }
    }
    const { mappedEntityId } = state
    const fit = entityAlignedTo(
      pairwiseAlignment,
      transcript,
      entities,
      mappedEntityId,
    )
    if ('entityId' in fit) {
      return { kind: 'adopt', entityId: fit.entityId }
    }
    const entity = entities.find(
      e => e.entityId === mappedEntityId && !e.nucleicAcid,
    )
    return entity
      ? {
          kind: 'realign',
          problem: fit.problem,
          transcript,
          entity,
          identical: isIdentical(transcript, entity.seq),
        }
      : { kind: 'discard', problem: fit.problem }
  }
  return {
    kind: 'choose',
    transcript,
    entities,
    identical: entities.some(
      e => !e.nucleicAcid && isIdentical(transcript, e.seq),
    ),
  }
}
