import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

import { adapterImplementing } from './adapterImplementing'
import { snapshotNamesFile } from './locationName.ts'

import type { GafReads } from './gaf/gafFile'
import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'

// The reads aligned over a cut's segments, from an adapter whose config names
// a GAF (GbzBaseSyntenyAdapter's `readsLocation`). Asked after the cut is
// parsed, because the segment names are what a GAF index is keyed by.

export interface GetGraphReadsArgs {
  adapterConfig: Record<string, unknown>
  nodeNames: string[]
}

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GetGraphReads: {
      args: GetGraphReadsArgs
      return: GafReads
    }
  }
}

interface ReadsAdapter {
  getReads(
    nodeNames: string[],
    opts: { signal?: AbortSignal },
  ): Promise<GafReads>
}

// Whether an adapter config as written names reads, so a graph without them
// makes no round trip to ask
export function namesReads(adapterConfig: Record<string, unknown>) {
  return (
    (typeof adapterConfig.reads === 'string' && adapterConfig.reads !== '') ||
    snapshotNamesFile(adapterConfig.readsLocation)
  )
}

export default class GetGraphReads extends RpcMethodType<'GetGraphReads'> {
  name = 'GetGraphReads' as const

  async execute(args: RpcExecuteArgs<'GetGraphReads'>) {
    const { nodeNames, signal } = args
    const { adapter } = await adapterImplementing<ReadsAdapter>(
      this.pluginManager,
      args,
      'getReads',
    )
    return adapter
      ? adapter.getReads(nodeNames, { signal })
      : { records: [], total: 0 }
  }
}
