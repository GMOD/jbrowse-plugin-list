import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

import type { IsoformRanking } from './isoformRanking'
import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  AlignmentAlgorithm,
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
// or in place on a host whose driver is MainThreadRpcDriver. The aligner loads
// on the first call, so registering the methods costs the plugin's boot nothing.
export class ProteinChooseMappedEntity extends RpcMethodType<'ProteinChooseMappedEntity'> {
  name = 'ProteinChooseMappedEntity' as const

  async execute({ transcript, entities, algorithm }: ChooseArgs) {
    const { chooseMappedEntity } = await import('p2s_mapper')
    return chooseMappedEntity(transcript, entities, algorithm)
  }
}

export class ProteinAlignTranscriptToEntity extends RpcMethodType<'ProteinAlignTranscriptToEntity'> {
  name = 'ProteinAlignTranscriptToEntity' as const

  async execute({ transcript, entitySeq, algorithm }: AlignArgs) {
    const { alignTranscriptToEntity } = await import('p2s_mapper')
    return alignTranscriptToEntity(transcript, entitySeq, algorithm)
  }
}

export class ProteinRankIsoforms extends RpcMethodType<'ProteinRankIsoforms'> {
  name = 'ProteinRankIsoforms' as const

  async execute({ isoforms, structureSequences }: RankArgs) {
    const { rankIsoforms } = await import('./isoformRanking')
    return rankIsoforms(isoforms, structureSequences)
  }
}

export default function AlignTranscriptRpcF(pluginManager: PluginManager) {
  pluginManager.addRpcMethod(pm => new ProteinChooseMappedEntity(pm))
  pluginManager.addRpcMethod(pm => new ProteinAlignTranscriptToEntity(pm))
  pluginManager.addRpcMethod(pm => new ProteinRankIsoforms(pm))
}
