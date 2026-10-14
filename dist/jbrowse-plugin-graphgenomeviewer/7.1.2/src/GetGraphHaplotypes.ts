import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'

import { adapterImplementing } from './adapterImplementing'

import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'

// The haplotypes a graph names without a cut, for the track's haplotype picker:
// a walk-indexed rGFA's header lines. Undefined where the graph names none, and
// the picker falls back to typed names.

export interface GetGraphHaplotypesArgs {
  adapterConfig: Record<string, unknown>
}

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GetGraphHaplotypes: {
      args: GetGraphHaplotypesArgs
      return: string[] | undefined
    }
  }
}

interface HaplotypeNamesAdapter {
  getHaplotypeNames(opts: {
    signal?: AbortSignal
  }): Promise<string[] | undefined>
}

export default class GetGraphHaplotypes extends RpcMethodType<'GetGraphHaplotypes'> {
  name = 'GetGraphHaplotypes' as const

  async execute(args: RpcExecuteArgs<'GetGraphHaplotypes'>) {
    const { adapter } = await adapterImplementing<HaplotypeNamesAdapter>(
      this.pluginManager,
      args,
      'getHaplotypeNames',
    )
    return adapter?.getHaplotypeNames({ signal: args.signal })
  }
}
