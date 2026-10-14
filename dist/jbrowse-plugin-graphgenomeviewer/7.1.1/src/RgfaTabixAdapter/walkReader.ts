import { panSNHaplotype } from '@jbrowse/bandage-core/pansn'
import { walkNameFilter } from '@jbrowse/graph-walks'

import { walkCutFor } from './walkRowRuns.ts'

import type { WalkReader } from '@jbrowse/graph-walks'

// The zoom-in notices name the config slots that set the budgets
export const BUDGET_SLOTS = {
  steps: 'walkStepBudget',
  bytes: 'walkByteBudget',
}

/**
 * The graph display's cut of a walk-indexed window: the reference walk, the
 * walks of `prefixes` (every walk when undefined), and the nodes and links
 * they visit. Walk rows draw runs, so the step budget spares them.
 * @jbrowse/graph-walks reads and cuts the window.
 */
export async function walkSubgraph(
  reader: WalkReader,
  refName: string,
  region: { start: number; end: number },
  opts: {
    signal?: AbortSignal
    prefixes?: string[]
    walkRows?: boolean
    stepBudget: number
    byteBudget: number
  },
) {
  const { graph, kept, fragments } = await reader.cut(refName, region, {
    signal: opts.signal,
    keep: walkNameFilter(opts.prefixes, panSNHaplotype(refName)),
    stepBudget: opts.walkRows ? Infinity : opts.stepBudget,
    byteBudget: opts.byteBudget,
    budgetNames: BUDGET_SLOTS,
  })
  return walkCutFor(graph.tables(kept, fragments), region, opts.walkRows)
}
