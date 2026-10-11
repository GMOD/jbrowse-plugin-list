import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'
import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

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

function isReadsAdapter(adapter: object): adapter is ReadsAdapter {
  return (
    'getReads' in adapter &&
    typeof (adapter as ReadsAdapter).getReads === 'function'
  )
}

const isNamed = (location: unknown) =>
  typeof location === 'object' &&
  location !== null &&
  Object.entries(location).some(
    ([key, value]) =>
      ['uri', 'localPath', 'blobId'].includes(key) &&
      typeof value === 'string' &&
      value !== '',
  )

// Whether an adapter config as written names reads, so a graph without them
// makes no round trip to ask
export function namesReads(adapterConfig: Record<string, unknown>) {
  return (
    (typeof adapterConfig.reads === 'string' && adapterConfig.reads !== '') ||
    isNamed(adapterConfig.readsLocation)
  )
}

export default class GetGraphReads extends RpcMethodType<'GetGraphReads'> {
  name = 'GetGraphReads' as const

  async execute(args: RpcExecuteArgs<'GetGraphReads'>) {
    const { adapterConfig, nodeNames, sessionId, signal } = args
    const { dataAdapter } = await getAdapter(
      this.pluginManager,
      sessionId,
      adapterConfig,
    )
    return isReadsAdapter(dataAdapter)
      ? dataAdapter.getReads(nodeNames, { signal })
      : { records: [], total: 0 }
  }
}
