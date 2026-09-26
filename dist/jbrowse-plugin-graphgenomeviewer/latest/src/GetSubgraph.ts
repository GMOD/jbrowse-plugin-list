import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'
import { RpcMethodTypeWithRenameRegion } from '@jbrowse/core/pluggableElementTypes'

import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'
import type { Region } from '@jbrowse/core/util'

// No `sessionId`, `signal` or `statusCallback` here: those belong to the
// CALL, not to this payload, and core's `EntriesDeclaringCallLevelFields` fails
// the build for a registry entry that declares one. `execute` still receives
// them, because `RpcExecuteArgs` intersects `RpcCallContext` in.
// `hops` is how far past the window a cut follows links, which only the rGFA
// cut reads; the GBZ cut has its own bp `context` slot. `haplotypes` is the
// set the cut is for, lane assembly names or PanSN prefixes, which only the GBZ
// cut reads: it keeps those walks and the nodes they visit. Undefined or empty
// is every haplotype.
export interface SubgraphCutOptions {
  hops?: number
  haplotypes?: string[]
}

// What an adapter's cut is handed: the payload, plus the call's own signal so
// a cut the view has moved on from stops reading.
export interface SubgraphAdapterOptions extends SubgraphCutOptions {
  signal?: AbortSignal
}

export interface GetSubgraphArgs {
  adapterConfig: Record<string, unknown>
  region: Region
  opts?: SubgraphCutOptions
}

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GetSubgraph: {
      args: GetSubgraphArgs
      return: string
    }
  }
}

// Adapters that can cut a local subgraph out of a graph file implement this:
// RgfaTabixAdapter and GbzBaseSyntenyAdapter today.
interface SubgraphAdapter {
  getSubgraph(region: Region, opts?: SubgraphAdapterOptions): Promise<string>
}

function isSubgraphAdapter(adapter: object): adapter is SubgraphAdapter {
  return (
    'getSubgraph' in adapter &&
    typeof (adapter as SubgraphAdapter).getSubgraph === 'function'
  )
}

// RpcMethodTypeWithRenameRegion, not the plain RpcMethodType: the base class is
// what maps `region.refName` from the assembly's spelling onto the adapter's own
// before the call crosses to the worker. Without it a launch on an hg38 whose
// contigs are bare (`6`, which is what every GRCh38 FASTA on jbrowse.org uses)
// asked RgfaTabixAdapter for `GRCh38#0#6`, matched nothing, and opened a view
// reading "0 nodes, 0 edges" with no error. The segments track drew the whole
// time, because CoreGetFeatures renames and this did not, so the graph looked
// broken while its own track looked fine. `assemblyNameToPanSN` covers the
// sample half of a PanSN name only; the contig half is refName aliasing, which
// the assembly already knows and this now consults.
export default class GetSubgraph extends RpcMethodTypeWithRenameRegion<'GetSubgraph'> {
  name = 'GetSubgraph' as const

  // Parameterized by the registry key, not left at the default `string`: a bare
  // RpcMethodTypeWithRenameRegion resolves RpcExecuteArgs to `unknown`, so
  // `execute` type-checks against nothing at all. `invoke` has already run
  // `deserializeArguments` by the time this is called, so it does not.
  async execute(args: RpcExecuteArgs<'GetSubgraph'>) {
    // `signal` arrives on every call and has to be named to be forwarded:
    // unnamed, a cut the view had replaced went on querying to the end, one
    // tabix read per off-reference segment per hop.
    const { adapterConfig, region, sessionId, opts, signal } = args

    const { dataAdapter } = await getAdapter(
      this.pluginManager,
      sessionId,
      adapterConfig,
    )
    if (isSubgraphAdapter(dataAdapter)) {
      return dataAdapter.getSubgraph(region, { ...opts, signal })
    }
    // An empty result is how the view and the launch menu detect "this track
    // can't do subgraphs" — see GraphGenomeView.loadFromTabixSubgraph.
    console.warn(
      `[GetSubgraph] ${dataAdapter.constructor.name} does not implement getSubgraph`,
    )
    return ''
  }
}
