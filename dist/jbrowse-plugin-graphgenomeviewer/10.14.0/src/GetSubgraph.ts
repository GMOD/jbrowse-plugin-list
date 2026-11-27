import { gfaTables } from '@jbrowse/bandage-core/gfa/gfaTables'
import { RpcMethodTypeWithRenameRegion } from '@jbrowse/core/pluggableElementTypes'
import { rpcResultWithArrayBuffers } from '@jbrowse/core/util/librpc'

import { adapterImplementing } from './adapterImplementing'

import type { RunsCut, WalkCut } from './RgfaTabixAdapter/walkCut.ts'
import type { LinksDrawn } from './linksDrawn.ts'
import type { RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry'
import type { Region } from '@jbrowse/core/util'

// No `sessionId`, `signal` or `statusCallback` here: those belong to the
// CALL, not to this payload, and core's `EntriesDeclaringCallLevelFields` fails
// the build for a registry entry that declares one. `execute` still receives
// them, because `RpcExecuteArgs` intersects `RpcCallContext` in.
// `hops` is how far past the window a cut follows links, which only the rGFA
// cut reads; the GBZ cut has its own bp `context` slot. `haplotypes` is the
// set the cut is for, lane assembly names or PanSN prefixes, which the GBZ cut
// and a walk-indexed rGFA cut read: they keep those walks, the reference's,
// and the nodes they visit. Undefined or empty
// is every haplotype. `tier` picks which of an rGFA track's two index pairs the
// cut reads, the adapter's own or its `coarse` one; fine when absent.
export type SubgraphTier = 'fine' | 'coarse'

export interface SubgraphCutOptions {
  hops?: number
  haplotypes?: string[]
  tier?: SubgraphTier
  // which snarls a GBZ cut follows past the window, over the track's
  // `subgraphSnarls`; 'overlapping' when the layout measures whole walks
  snarls?: 'none' | 'contained' | 'overlapping'
  // a cut for walk rows: its runs come with the tables, and the
  // step budget, which guards a Graph of every step, does not apply
  walkRows?: boolean
  links?: LinksDrawn
  // walks, `sample#haplotype#contig`, a walk-file cut fetches every node of
  expand?: string[]
  forcedByteBudget?: number
  // a cut for a fold to threads: a walk-indexed adapter hands back the
  // window's walks as runs, bounded by `walkByteBudget` alone, unless the file
  // does not state that its reference passes no node twice
  foldRuns?: boolean
}

// The most walks a view fetches every node of on its own: those a tube map
// shows, or the rows a comparison of walk rows would leave out
export const EXPAND_NAMED_MAX = 64

// What an adapter's cut is handed: the payload, plus the call's own signal so
// a cut the view has moved on from stops reading.
export interface SubgraphAdapterOptions extends SubgraphCutOptions {
  signal?: AbortSignal
}

export interface SubgraphRegion {
  refName: string
  assemblyName: string
  start: number
  end: number
}

export interface GetSubgraphArgs {
  adapterConfig: Record<string, unknown>
  region: Region
  opts?: SubgraphCutOptions
}

// A cut is tables, or runs, whose typed arrays cross to the main thread
// without a copy, or GFA text the tables cannot hold
declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    GetSubgraph: {
      args: GetSubgraphArgs
      return: string | WalkCut | RunsCut
      transferables: WalkCut | RunsCut
    }
  }
}

// Adapters that can cut a local subgraph out of a graph file implement this:
// RgfaTabixAdapter, WalkTabixSyntenyAdapter and GbzBaseSyntenyAdapter.
interface SubgraphAdapter {
  getSubgraph(
    region: Region,
    opts?: SubgraphAdapterOptions,
  ): Promise<string | WalkCut>
}

// The walk-indexed ones also read a window's walks as runs, for a fold to
// threads, or say the window is to be cut instead
interface SubgraphRunsAdapter {
  getSubgraphRuns(
    region: Region,
    opts?: SubgraphAdapterOptions,
  ): Promise<RunsCut | undefined>
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
    const { region, opts, signal } = args
    const { adapter, name } = await adapterImplementing<SubgraphAdapter>(
      this.pluginManager,
      args,
      'getSubgraph',
    )
    const runsAdapter = opts?.foldRuns
      ? (
          await adapterImplementing<SubgraphRunsAdapter>(
            this.pluginManager,
            args,
            'getSubgraphRuns',
          )
        ).adapter
      : undefined
    const runs = await runsAdapter?.getSubgraphRuns(region, {
      ...opts,
      signal,
    })
    // runs nest their tables three deep, each array made for this call
    if (runs) {
      return rpcResultWithArrayBuffers(runs, { depth: 3 })
    }
    // A text cut is read into tables here, off the main thread: a GBZ cut of
    // every haplotype is tens of MB of W lines
    if (adapter) {
      const cut = await adapter.getSubgraph(region, { ...opts, signal })
      if (typeof cut !== 'string') {
        return rpcResultWithArrayBuffers(cut)
      }
      const tables = cut ? gfaTables(cut) : undefined
      return tables ? rpcResultWithArrayBuffers(tables) : cut
    }
    // The pane's cutSubgraph reports an empty result as a track that cannot
    // cut subgraphs
    console.warn(`[GetSubgraph] ${name} does not implement getSubgraph`)
    return ''
  }
}
