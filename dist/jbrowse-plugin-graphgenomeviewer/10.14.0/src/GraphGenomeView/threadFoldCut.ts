import { foldVariants } from '@jbrowse/bandage-core/foldVariants'
import { walkPathName } from '@jbrowse/bandage-core/gfa/graphTables'
import { clipToWindow } from '@jbrowse/bandage-core/layout/trimToWindow'
import { panSNSample } from '@jbrowse/bandage-core/pansn'
import { foldThreads } from '@jbrowse/bandage-core/threadFold'
import { foldThreadRuns } from '@jbrowse/bandage-core/threadFoldRuns'

import type { WalkRunsTables } from '@jbrowse/bandage-core/gfa/walkRuns'
import type { ThreadEvent } from '@jbrowse/bandage-core/threadFold'
import type { Graph, PathOrigin } from '@jbrowse/bandage-core/types'

/**
 * The fold under which a graph with walks is drawn whole, as it was before
 * walks could be folded: 5 bp a pixel at FOLD_PX, where graph-fold's own
 * default takes a detour for a structural variant
 */
export const THREAD_FOLD_MIN_BP = 50

export interface FoldedCut {
  graph: Graph
  foldedBelowBp: number | undefined
  /** why a graph with walks was not folded at a zoom that folds one */
  foldRefusal: string | undefined
  /** what a thread fold kept, in graph-fold's words, for the hover */
  threadEvents: ThreadEvent[] | undefined
  /**
   * the graph a thread fold was made of, whose walks the pickers list and
   * which a change of layout or reference folds again
   */
  unfoldedGraph: Graph | undefined
  /**
   * the walks of runs a thread fold was made of, each as the cut would name
   * it, whose names the pickers list; undefined for a fold of a cut, whose
   * walks are its unfolded graph's
   */
  cutWalks: PathOrigin[] | undefined
}

/** Whether a cut at `foldBelowBp` folds its walks to threads */
export const foldsThreads = (foldBelowBp: number, threads: boolean) =>
  threads && foldBelowBp >= THREAD_FOLD_MIN_BP

/**
 * A cut at the view's resolution. A graph with walks whose steps are loaded
 * folds to threads (bandage-core's foldThreads over graph-fold) from
 * THREAD_FOLD_MIN_BP, leaving out any walk with no steps here, and is drawn
 * whole where graph-fold refuses it, with the reason. One without walks folds
 * its small alleles into the reference and is clipped to the region it was
 * cut for.
 */
export function foldedCut(
  graph: Graph,
  foldBelowBp: number,
  {
    region,
    threads = true,
  }: {
    region?: { start: number; end: number }
    /** false where the layout draws each walk itself, as a tube map does */
    threads?: boolean
  } = {},
): FoldedCut {
  const walked = !!graph.paths?.length
  const threaded =
    foldsThreads(foldBelowBp, threads) &&
    graph.paths?.some(path => path.nodeIds.length > 0)
      ? foldThreads(graph, foldBelowBp)
      : undefined
  const folded = walked
    ? (threaded?.graph ?? graph)
    : foldBelowBp > 0
      ? foldVariants(graph, foldBelowBp, { cut: true })
      : graph
  return {
    graph:
      region && folded !== graph && !walked
        ? clipToWindow(folded, region, foldBelowBp)
        : folded,
    foldedBelowBp: folded === graph ? undefined : foldBelowBp,
    foldRefusal: threaded?.folded === false ? threaded.reason : undefined,
    threadEvents: threaded?.folded ? threaded.events : undefined,
    unfoldedGraph: threaded?.folded ? graph : undefined,
    cutWalks: undefined,
  }
}

/**
 * A window's walks read as runs, folded to threads as foldedCut folds the
 * same window's cut, or why graph-fold would not: no step is made of a run,
 * so a window whose cut holds too many steps folds from the rows that state
 * it. A folded node's `members` lists only reference nodes, since sequence
 * off the reference has no node names in runs.
 */
export function foldedRuns(
  runs: WalkRunsTables,
  foldBelowBp: number,
  name: string,
): FoldedCut | { refusal: string } {
  const threaded = foldThreadRuns(runs, foldBelowBp, { name })
  return threaded.folded
    ? {
        graph: threaded.graph,
        foldedBelowBp: foldBelowBp,
        foldRefusal: undefined,
        threadEvents: threaded.events,
        unfoldedGraph: undefined,
        cutWalks: runs.walks.names.map((walk, p) => {
          const start = runs.walks.starts[p]!
          const end = runs.walks.ends[p]!
          const name = walkPathName(walk, start, end)
          return { name, sample: panSNSample(name), start, length: end - start }
        }),
      }
    : { refusal: threaded.reason }
}
