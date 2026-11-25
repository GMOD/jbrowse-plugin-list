import { getSession } from '@jbrowse/core/util'
import { isAlive } from '@jbrowse/mobx-state-tree'
import { action, untracked } from 'mobx'
import {
  alignTranscriptToEntity,
  chooseMappedEntity,
  sameProtein,
} from 'p2s_mapper'

import { alignOffThread } from './alignOffThread'
import { decideAlignment } from './alignmentDecision'

import type { AlignmentMethod } from './alignOffThread'
import type { AlignmentState } from './alignmentDecision'
import type { RpcCallArgs, RpcCallReturn } from '@jbrowse/core/rpc/RpcRegistry'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'
import type {
  AlignmentAlgorithm,
  Entity,
  EntitySelection,
  PairwiseAlignment,
  ScoredAlignment,
} from 'p2s_mapper'

type StructureAlignerHost = IAnyStateTreeNode &
  AlignmentState & {
    readonly alignmentAlgorithm: AlignmentAlgorithm
    readonly aligning: boolean
    readonly pendingEntityId: string | undefined
    readonly mappedEntity: Entity | undefined
    readonly label: string
    readonly parentView: { addNotice: (notice: unknown) => void }
    setAligning: (aligning: boolean, pendingEntityId?: string) => void
    settleAlignment: (apply: () => void) => void
    setError: (error: unknown) => void
    setAlignment: (alignment?: PairwiseAlignment) => void
    setAlignmentSkipped: (reason?: string) => void
    setEntityChosen: () => void
    setMappedEntityId: (id?: string) => void
    applyEntitySelection: (selection: EntitySelection | undefined) => void
    applyRealignment: (realigned: ScoredAlignment | undefined) => void
    applyChosenEntity: (entityId: string, alignment: PairwiseAlignment) => void
    switchEntity: (entityId: string) => void
  }

interface AlignmentRun<M extends AlignmentMethod> {
  identical: boolean
  name: M
  args: RpcCallArgs<M>
  inPlace: () => RpcCallReturn<M>
  apply: (result: RpcCallReturn<M>) => void
  fail: (e: unknown) => void
  pendingEntityId?: string
}

/**
 * Decides and runs a structure's alignment to its transcript: the body of the
 * autorun that keeps, adopts, realigns or chooses once the entities load
 * (see decideAlignment), and a chain the user picks.
 *
 * An answer is applied only if no alignment has started since it was asked
 * for: a changed transcript or entity list, or another chain the user picked,
 * supersedes whatever is still running in the worker. The worker finishes a
 * superseded DP regardless; only its answer is dropped.
 */
export function makeStructureAligner(host: StructureAlignerHost) {
  let latestRequest = 0
  let realigning: string | undefined

  function supersede() {
    latestRequest++
    host.setAligning(false)
  }

  /** Decides again after a chain pick that superseded the decision was
   * cancelled or failed */
  function redecide() {
    supersede()
    decide()
  }

  // an action, so what a run reads (the session's rpcManager) stays out of
  // the decision autorun's dependencies, as it did as the model's action
  const runAlignment = action(function runAlignment<M extends AlignmentMethod>({
    identical,
    name,
    args,
    inPlace,
    apply,
    fail,
    pendingEntityId,
  }: AlignmentRun<M>) {
    if (identical) {
      supersede()
      try {
        apply(inPlace())
      } catch (e) {
        console.error(e)
        host.setError(e)
      }
    } else {
      const request = ++latestRequest
      const current = () => request === latestRequest && isAlive(host)
      host.setAligning(true, pendingEntityId)
      alignOffThread({
        rpcManager: getSession(host).rpcManager,
        name,
        args,
        inPlace,
        current,
      }).then(
        result => {
          if (current()) {
            try {
              host.settleAlignment(() => {
                apply(result)
              })
            } catch (e) {
              console.error(e)
              host.setError(e)
            }
          }
        },
        (e: unknown) => {
          if (current()) {
            console.error(e)
            host.settleAlignment(() => {
              fail(e)
            })
          }
        },
      )
    }
  })

  function alignToEntity(entity: Entity, transcript: string) {
    const { entityId } = entity
    runAlignment({
      identical: sameProtein(transcript, entity.seq),
      name: 'ProteinAlignTranscriptToEntity',
      args: {
        transcript,
        entitySeq: entity.seq,
        algorithm: host.alignmentAlgorithm,
      },
      inPlace: () =>
        alignTranscriptToEntity(
          transcript,
          entity.seq,
          host.alignmentAlgorithm,
        ),
      apply: scored => {
        if (scored) {
          host.applyChosenEntity(entityId, scored.alignment)
        } else {
          host.parentView.addNotice(
            new Error(
              `${entity.chains.join('/') || entity.entityId} is too long to align to this transcript`,
            ),
          )
          redecide()
        }
      },
      fail: e => {
        host.parentView.addNotice(e)
        redecide()
      },
      pendingEntityId: entityId,
    })
  }

  function chooseEntity(entityId: string) {
    const entity = host.entities?.find(e => e.entityId === entityId)
    const shown = host.mappedEntity?.entityId
    const transcript = host.userProvidedTranscriptSequence
    if (entity && entityId !== (host.pendingEntityId ?? shown)) {
      if (!transcript) {
        host.switchEntity(entityId)
      } else if (host.pendingEntityId !== undefined && entityId === shown) {
        // back to the chain on screen: the pick may have superseded the
        // automatic alignment, so that decides again
        redecide()
      } else {
        alignToEntity(entity, transcript)
      }
    }
  }

  function decide() {
    try {
      const { alignmentAlgorithm: algorithm } = host
      const decision = decideAlignment(host)
      const reportStale = (problem: string) => {
        host.parentView.addNotice(
          new Error(
            `The alignment stored for ${host.label} no longer matches its chain and was recomputed: ${problem}`,
          ),
        )
      }
      switch (decision.kind) {
        case 'nothingToAlign':
          supersede()
          break
        case 'skip':
          supersede()
          host.setAlignment(undefined)
          host.setAlignmentSkipped(decision.reason)
          host.setEntityChosen()
          break
        case 'keep':
          host.setEntityChosen()
          break
        case 'adopt':
          host.setMappedEntityId(decision.entityId)
          host.setEntityChosen()
          break
        case 'discard':
          reportStale(decision.problem)
          supersede()
          host.applyRealignment(undefined)
          break
        case 'realign': {
          const {
            transcript,
            entity: { seq },
          } = decision
          const key = `${algorithm}:${transcript}:${seq}`
          // read untracked: the realign ending would rerun this, and a
          // realign that keeps failing would start itself again forever
          if (key === realigning && untracked(() => host.aligning)) {
            break
          }
          realigning = key
          reportStale(decision.problem)
          runAlignment({
            identical: decision.identical,
            name: 'ProteinAlignTranscriptToEntity',
            args: { transcript, entitySeq: seq, algorithm },
            inPlace: () => alignTranscriptToEntity(transcript, seq, algorithm),
            apply: realigned => {
              host.applyRealignment(realigned)
            },
            fail: e => {
              host.setError(e)
            },
          })
          break
        }
        case 'choose': {
          const { transcript, entities } = decision
          runAlignment({
            identical: decision.identical,
            name: 'ProteinChooseMappedEntity',
            args: {
              transcript,
              entities: entities.map(({ seq, nucleicAcid }) => ({
                seq,
                nucleicAcid,
              })),
              algorithm,
            },
            inPlace: () => chooseMappedEntity(transcript, entities, algorithm),
            apply: selection => {
              host.applyEntitySelection(selection)
            },
            fail: e => {
              host.setError(e)
            },
          })
          break
        }
      }
    } catch (e) {
      console.error(e)
      host.setError(e)
    }
  }

  return { decide, chooseEntity, runAlignment, supersede }
}
