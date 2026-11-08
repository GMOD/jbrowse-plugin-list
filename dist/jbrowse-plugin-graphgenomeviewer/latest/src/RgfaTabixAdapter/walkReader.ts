import { resolvePanSNPrefix } from '@jbrowse/bandage-core/pansn'
import { checkRange, walksKept } from '@jbrowse/graph-walks'

import { walkCutFor } from './walkCut.ts'

import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { RefNameSource } from '../panSNTabix.ts'
import type {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import type { WalkReader } from '@jbrowse/graph-walks'

// The zoom-in notices name the config slots that set the budgets
export const BUDGET_SLOTS = {
  steps: 'walkStepBudget',
  bytes: 'walkByteBudget',
}

// Walk rows read a list of haplotypes, or of the samples they show, this long or
// shorter in full where the walk file abridged it; a longer list, or every
// haplotype, keeps the abridged rows
export const EXPAND_NAMED_MAX = 64

/**
 * A walk file and the answers both walk-indexed adapters give from it,
 * RgfaTabixAdapter and WalkTabixSyntenyAdapter, whose schemas declare the
 * budget slots. @jbrowse/graph-walks reads and cuts the file.
 */
export class WalkIndex {
  // What PanSNRefNames reads of the file: its reference sequences, and the
  // bytes a cut of each region fetches, which the directory gives before any
  // row is read
  readonly source: RefNameSource = {
    names: opts => this.reader.referenceSequences(opts),
    bytes: async (regions, opts) => {
      let total = 0
      for (const { refName, start, end } of regions) {
        checkRange(refName, start, end)
        total += await this.reader.bytesFor(refName, { start, end }, opts)
      }
      return total
    },
  }

  constructor(
    readonly reader: WalkReader,
    private adapter: BaseFeatureDataAdapter,
  ) {}

  /**
   * The haplotypes the header names, `sample#haplotype` in byte order, or
   * undefined when it names none
   */
  async haplotypeNames(opts: BaseOptions = {}) {
    const { haplotypes } = await this.reader.header(opts)
    return haplotypes.length > 0 ? haplotypes : undefined
  }

  budgets() {
    return {
      stepBudget: this.adapter.getConf('walkStepBudget') as number,
      byteBudget: this.adapter.getConf('walkByteBudget') as number,
      budgetNames: BUDGET_SLOTS,
    }
  }

  /**
   * The graph display's cut of a window: the reference walk, the walks of
   * `haplotypes` (every walk when unset), the nodes and links they visit, and
   * every departure from the reference over the window, which walk rows draw.
   * Walk rows draw runs, so the step budget spares them, and read a short
   * list of named walks in full where the file abridged them.
   */
  async subgraph(
    refName: string,
    region: { start: number; end: number },
    {
      signal,
      haplotypes,
      walkRows,
      expand,
      expandSamples,
    }: SubgraphAdapterOptions,
  ) {
    const budgets = this.budgets()
    const keep = walksKept(
      haplotypes?.map(lane => resolvePanSNPrefix(this.adapter, lane)),
      refName,
    )
    const named =
      walkRows && keep && (haplotypes?.length ?? 0) <= EXPAND_NAMED_MAX
        ? keep
        : undefined
    const shown =
      walkRows &&
      expandSamples?.length &&
      expandSamples.length <= EXPAND_NAMED_MAX
        ? walksKept(
            expandSamples.map(s => resolvePanSNPrefix(this.adapter, s)),
            refName,
          )
        : undefined
    const asked = expand?.length
      ? (name: string) => expand.includes(name)
      : undefined
    const { graph, kept, fragments, departures } = await this.reader.cut(
      refName,
      region,
      {
        ...budgets,
        stepBudget: walkRows ? Infinity : budgets.stepBudget,
        signal,
        keep,
        ...(named || shown || asked
          ? {
              expand: (name: string) =>
                !!named?.(name) || !!shown?.(name) || !!asked?.(name),
            }
          : {}),
      },
    )
    return walkCutFor(
      graph.tables(kept, fragments, departures),
      region,
      walkRows,
    )
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
    const nodes = await this.reader.referenceNodes(refName, region, opts)
    const seen = new Set<number>()
    return nodes.filter(node => {
      const first = !seen.has(node.id)
      seen.add(node.id)
      return first
    })
  }
}
