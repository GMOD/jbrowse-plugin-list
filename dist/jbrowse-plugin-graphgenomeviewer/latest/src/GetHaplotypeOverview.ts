import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'
import { RpcMethodTypeWithRenameRegion } from '@jbrowse/core/pluggableElementTypes'

import type { OverviewBin } from '@gmod/gbz-base'
import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'
import type { Region } from '@jbrowse/core/util'

// Every haplotype classed per bin of a reference window, from the overview a
// format 3 haplotype index carries: what a GBZ track draws once its window is
// too large to cut. `rows` labels each haplotype as the track's lanes do,
// `pinned` lists the rows of the lanes the track names, in their order, and
// `reference` the reference sample's own rows, which match the reference by
// construction.
export interface HaplotypeOverviewData {
  level: number
  bin: number
  rows: string[]
  pinned: number[]
  reference: number[]
  bins: OverviewBin[]
  cells: Uint8Array
}

export interface OverviewAdapterOptions {
  bpPerPx: number
  haplotypes?: string[]
  signal?: AbortSignal
}

export interface GetHaplotypeOverviewArgs {
  adapterConfig: Record<string, unknown>
  region: Region
  bpPerPx: number
  haplotypes?: string[]
}

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GetHaplotypeOverview: {
      args: GetHaplotypeOverviewArgs
      return: HaplotypeOverviewData | undefined
    }
  }
}

interface OverviewAdapter {
  getOverview(
    region: Region,
    opts: OverviewAdapterOptions,
  ): Promise<HaplotypeOverviewData | undefined>
}

function isOverviewAdapter(adapter: object): adapter is OverviewAdapter {
  return (
    'getOverview' in adapter &&
    typeof (adapter as OverviewAdapter).getOverview === 'function'
  )
}

// With region renaming, as GetSubgraph has, so a bare `6` reaches the adapter
// as the contig its reference path names
export default class GetHaplotypeOverview extends RpcMethodTypeWithRenameRegion<'GetHaplotypeOverview'> {
  name = 'GetHaplotypeOverview' as const

  async execute(args: RpcExecuteArgs<'GetHaplotypeOverview'>) {
    const { adapterConfig, region, bpPerPx, haplotypes, sessionId, signal } =
      args
    const { dataAdapter } = await getAdapter(
      this.pluginManager,
      sessionId,
      adapterConfig,
    )
    return isOverviewAdapter(dataAdapter)
      ? dataAdapter.getOverview(region, { bpPerPx, haplotypes, signal })
      : undefined
  }
}
