import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'
import type { LayoutResult } from '@jbrowse/bandage-core/types'
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
    const { graph, options, signal, statusCallback } = args
    // The engine takes no signal, so a layout superseded while it queued
    // behind another is dropped here rather than holding up the next cut
    signal?.throwIfAborted()
    statusCallback?.('Computing layout')
    return layoutEngine({ graph, options })
  }
}
