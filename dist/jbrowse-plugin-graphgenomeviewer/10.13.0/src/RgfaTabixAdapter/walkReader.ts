import {
  CUT_PRESETS,
  RunsRefusedError,
  checkRange,
  walksKept,
} from '@gmod/gfa-tabix'
import { resolvePanSNPrefix } from '@jbrowse/bandage-core/pansn'

import { walkCutFor } from './walkCut.ts'
import { DEFAULT_LINKS_DRAWN } from '../linksDrawn.ts'

import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { RefNameSource } from '../panSNTabix.ts'
import type { WalkFile } from '@gmod/gfa-tabix'
import type {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'

// The zoom-in notices name the config slots that set the budgets
export const BUDGET_SLOTS = {
  steps: 'walkStepBudget',
  bytes: 'walkByteBudget',
}

/**
 * A walk file and the answers both walk-indexed adapters give from it,
 * RgfaTabixAdapter and WalkTabixSyntenyAdapter, whose schemas declare the
 * budget slots. @gmod/gfa-tabix reads and cuts the file.
 */
export class WalkIndex {
  // What PanSNRefNames reads of the file: its reference sequences, and the
  // bytes a cut of each region fetches, which the directory gives before any
  // row is read
  readonly source: RefNameSource = {
    names: opts => this.reader.getReferenceSequences(opts),
    bytes: async (regions, opts) => {
      let total = 0
      for (const { refName, start, end } of regions) {
        checkRange(refName, start, end)
        total += await this.reader.getBytesForRange(refName, start, end, opts)
      }
      return total
    },
  }

  constructor(
    readonly reader: WalkFile,
    private adapter: BaseFeatureDataAdapter,
  ) {}

  /**
   * The haplotypes the header names, `sample#haplotype` in byte order, or
   * undefined when it names none
   */
  async haplotypeNames(opts: BaseOptions = {}) {
    const { haplotypes } = await this.reader.getHeader(opts)
    return haplotypes.length > 0 ? haplotypes : undefined
  }

  cutOptions() {
    return {
      ...CUT_PRESETS.browser,
      stepBudget: this.adapter.getConf('walkStepBudget') as number,
      byteBudget: this.adapter.getConf('walkByteBudget') as number,
      budgetNames: BUDGET_SLOTS,
    }
  }

  /**
   * The graph display's cut of a window: the reference walk, the walks of
   * `haplotypes` (every walk when unset), the nodes they visit, the links
   * those walks take, with `links: 'between'` also the links any other walk
   * takes between those nodes, and every departure from the reference over
   * the window, which walk rows draw.
   * Walk rows draw runs, so the step budget spares them. Only the walks named
   * in `expand` come back with every node.
   */
  async subgraph(
    refName: string,
    region: { start: number; end: number },
    {
      signal,
      haplotypes,
      walkRows,
      links = DEFAULT_LINKS_DRAWN,
      expand,
      forcedByteBudget = 0,
    }: SubgraphAdapterOptions,
  ) {
    const options = this.cutOptions()
    const keep = walksKept(
      haplotypes?.map(lane => resolvePanSNPrefix(this.adapter, lane)),
      refName,
    )
    const asked = expand?.length
      ? (name: string) => expand.includes(name)
      : undefined
    const { graph, kept, fragments, departures } =
      await this.reader.getCutForRange(refName, region.start, region.end, {
        ...options,
        byteBudget: Math.max(options.byteBudget, forcedByteBudget),
        stepBudget: walkRows ? Infinity : options.stepBudget,
        links: walkRows ? 'walked' : links,
        signal,
        keep,
        ...(asked ? { expand: asked } : {}),
      })
    return walkCutFor(
      graph.tables(kept, fragments, departures),
      region,
      walkRows,
    )
  }

  /**
   * The walks the graph display's cut of a window holds, as runs, for a fold
   * to threads: no step is decoded and no node made, so the step budget does
   * not apply and the byte budget alone bounds it. Read contained: a walk
   * that leaves the window and steps the reference elsewhere in the tiles read
   * would otherwise keep that stretch, which graph-fold refuses as off the
   * reference nodes it folds. Undefined for a file that does not state that
   * its reference passes no node twice, whose window is cut instead.
   */
  async runs(
    refName: string,
    region: { start: number; end: number },
    { signal, haplotypes, forcedByteBudget = 0 }: SubgraphAdapterOptions,
  ) {
    const { context, byteBudget, departureByteBudget, budgetNames } =
      this.cutOptions()
    try {
      const runs = await this.reader.getRunsForRange(
        refName,
        region.start,
        region.end,
        {
          context,
          contained: true,
          byteBudget: Math.max(byteBudget, forcedByteBudget),
          departureByteBudget,
          budgetNames,
          signal,
          haplotypes: haplotypes?.map(lane =>
            resolvePanSNPrefix(this.adapter, lane),
          ),
        },
      )
      return { runs }
    } catch (e) {
      if (!(e instanceof RunsRefusedError)) {
        throw e
      }
      return undefined
    }
  }

  /**
   * The reference nodes overlapping a window, each once, from the ref rows of
   * the tiles over it
   */
  async referenceNodes(
    refName: string,
    region: { start: number; end: number },
    opts: BaseOptions,
  ) {
    const nodes = await this.reader.getReferenceNodes(
      refName,
      region.start,
      region.end,
      opts,
    )
    const seen = new Set<number>()
    return nodes.filter(node => {
      const first = !seen.has(node.id)
      seen.add(node.id)
      return first
    })
  }
}
