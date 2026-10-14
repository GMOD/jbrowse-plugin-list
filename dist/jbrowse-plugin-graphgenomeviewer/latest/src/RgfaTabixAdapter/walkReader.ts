import { resolvePanSNPrefix } from '@jbrowse/bandage-core/pansn'
import { WalkReader, referenceNodes, walksKept } from '@jbrowse/graph-walks'

import { getLines } from '../tabixRange.ts'
import { walkCutFor } from './walkRowRuns.ts'

import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { TabixIndexedFile } from '@gmod/tabix'
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
 * budget slots. @jbrowse/graph-walks reads and cuts the file.
 */
export class WalkIndex {
  readonly reader: WalkReader

  constructor(
    readonly file: TabixIndexedFile,
    private adapter: BaseFeatureDataAdapter,
  ) {
    this.reader = new WalkReader(file)
  }

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
   * `haplotypes` (every walk when unset), and the nodes and links they visit.
   * Walk rows draw runs, so the step budget spares them.
   */
  async subgraph(
    refName: string,
    region: { start: number; end: number },
    { signal, haplotypes, walkRows }: SubgraphAdapterOptions,
  ) {
    const budgets = this.budgets()
    const { graph, kept, fragments } = await this.reader.cut(refName, region, {
      ...budgets,
      stepBudget: walkRows ? Infinity : budgets.stepBudget,
      signal,
      keep: walksKept(
        haplotypes?.map(lane => resolvePanSNPrefix(this.adapter, lane)),
        refName,
      ),
    })
    return walkCutFor(graph.tables(kept, fragments), region, walkRows)
  }

  /**
   * The reference nodes overlapping a window, from the ref rows of its
   * chunks. A row's tabix interval is its chunk's first base, and gfa-to-tabix
   * files a node crossing in from a chunk before under that chunk, so the read
   * starts at queryStart.
   */
  async referenceNodes(
    refName: string,
    region: { start: number; end: number },
    opts: BaseOptions,
  ) {
    const refRows: string[][] = []
    await getLines(
      this.file,
      refName,
      await this.reader.queryStart(region.start, opts),
      region.end,
      {
        signal: opts.signal,
        lineCallback: line => {
          const cols = line.split('\t')
          if (cols[3] === 'ref') {
            refRows.push(cols)
          }
        },
      },
    )
    const seen = new Set<number>()
    return referenceNodes(refRows).filter(node => {
      if (
        node.refName !== refName ||
        node.end <= region.start ||
        node.start >= region.end ||
        seen.has(node.id)
      ) {
        return false
      }
      seen.add(node.id)
      return true
    })
  }
}
