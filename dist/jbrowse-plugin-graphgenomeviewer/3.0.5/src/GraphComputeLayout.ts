import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

import loadBandage from './loadBandage'

import type { LayoutNode } from './GraphGenomeView/layout/referenceSeeds'
import type { Graph, LayoutResult } from './GraphGenomeView/types'
import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'

// `sessionId` and `statusCallback` are the CALL's, not this payload's — core's
// `EntriesDeclaringCallLevelFields` fails the build for a registry entry that
// declares either, on the grounds that a field one method owns is a field the
// other forty cannot be passed. `execute` still receives both, through
// `RpcExecuteArgs`'s intersection with `RpcCallContext`.
export interface GraphComputeLayoutArgs {
  // a node may carry an `x`/`y` seed, which the engine reads as where its
  // chain starts (referenceSeeds.ts)
  graph: { nodes: LayoutNode[]; edges: Graph['edges'] }
  options: Record<string, unknown>
}

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GraphComputeLayout: {
      args: GraphComputeLayoutArgs
      return: { result: LayoutResult; duration: number }
    }
  }
}

export default class GraphComputeLayout extends RpcMethodType<'GraphComputeLayout'> {
  name = 'GraphComputeLayout' as const

  async execute(args: RpcExecuteArgs<'GraphComputeLayout'>) {
    const { graph, options, statusCallback } = args

    statusCallback?.('Loading layout engine')
    const module = await loadBandage()

    statusCallback?.('Computing layout')
    const startTime = performance.now()
    const result = module.computeLayout(graph, options)
    const duration = performance.now() - startTime

    return { result, duration }
  }
}
