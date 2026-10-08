import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'
import {
  alignTranscriptToEntity,
  chooseMappedEntity,
  classifyIsoforms,
  pickStructureSequence,
} from 'p2s_mapper'

import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  AlignmentAlgorithm,
  ClassifiedIsoforms,
  EntityCandidate,
  EntitySelection,
  Isoform,
  ScoredAlignment,
} from 'p2s_mapper'

interface ChooseArgs {
  transcript: string
  entities: EntityCandidate[]
  algorithm: AlignmentAlgorithm
}

interface AlignArgs {
  transcript: string
  entitySeq: string
  algorithm: AlignmentAlgorithm
}

interface RankArgs {
  isoforms: Isoform[]
  structureSequences: string[]
}

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

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    ProteinChooseMappedEntity: {
      args: ChooseArgs
      return: EntitySelection | undefined
    }
    ProteinAlignTranscriptToEntity: {
      args: AlignArgs
      return: ScoredAlignment | undefined
    }
    ProteinRankIsoforms: {
      args: RankArgs
      return: IsoformRanking
    }
  }
}

// The alignment DP runs ~50 ns a cell, so a 4,000-residue transcript against
// its structure is almost a second and a complex of long chains several: on
// the main thread, frozen UI. These run it in the host's RPC worker instead,
// or in place on a host whose driver is MainThreadRpcDriver.
export class ProteinChooseMappedEntity extends RpcMethodType<'ProteinChooseMappedEntity'> {
  name = 'ProteinChooseMappedEntity' as const

  async execute({ transcript, entities, algorithm }: ChooseArgs) {
    return chooseMappedEntity(transcript, entities, algorithm)
  }
}

export class ProteinAlignTranscriptToEntity extends RpcMethodType<'ProteinAlignTranscriptToEntity'> {
  name = 'ProteinAlignTranscriptToEntity' as const

  async execute({ transcript, entitySeq, algorithm }: AlignArgs) {
    return alignTranscriptToEntity(transcript, entitySeq, algorithm)
  }
}

export class ProteinRankIsoforms extends RpcMethodType<'ProteinRankIsoforms'> {
  name = 'ProteinRankIsoforms' as const

  async execute({ isoforms, structureSequences }: RankArgs) {
    return rankIsoforms(isoforms, structureSequences)
  }
}

export default function AlignTranscriptRpcF(pluginManager: PluginManager) {
  pluginManager.addRpcMethod(pm => new ProteinChooseMappedEntity(pm))
  pluginManager.addRpcMethod(pm => new ProteinAlignTranscriptToEntity(pm))
  pluginManager.addRpcMethod(pm => new ProteinRankIsoforms(pm))
}
