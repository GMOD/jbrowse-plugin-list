import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

import loadBandage from './loadBandage'

import type { EngineRequest } from './GraphGenomeView/pipeline'
import type { LayoutResult } from './GraphGenomeView/types'
import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'

// The payload is the pipeline's EngineRequest, the same request a standalone
// page hands the engine. `sessionId` and `statusCallback` are the CALL's, not
// the payload's: core's `EntriesDeclaringCallLevelFields` fails the build for a
// registry entry that declares either. `execute` still receives both, through
// `RpcExecuteArgs`'s intersection with `RpcCallContext`.

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GraphComputeLayout: {
      args: EngineRequest
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
