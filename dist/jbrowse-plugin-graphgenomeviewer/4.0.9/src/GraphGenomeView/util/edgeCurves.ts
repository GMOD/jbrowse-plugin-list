import { bypassedPoints } from '../deletionEdges'
import { computeEdgeCurves } from './geometry'

import type { Graph, NodeSegment } from '../types'
import type { AxisScale, BezierCurve } from './geometry'

// Every edge's curve as it is DRAWN, at offset zero, derived once for a layout
// at a zoom.
//
// `computeEdgeCurves` already says why there must be one derivation of this
// rather than several: the drawing, the hit index and the label that rides an
// arc all have to agree on where the curve is, and a second derivation is a
// second thing to keep in step. That was true of the CODE and not of the WORK —
// the geometry builder and the edge hit index called it with identical
// arguments, per edge, and each paid in full. The index's whole build was 14 ms
// on a 12k-edge cut and most of it was this, redone.
//
// So the answer is the same shape as the argument: one function, and everyone
// who wants the offset-zero curve of edge `ei` asks it. A path ribbon is that
// curve rebuilt at its own offset, which is the one variant that is not shared.
//
// Cached the way hit detection caches its indexes, and for the same reasons: a
// WeakMap on the positions object so two graph views cannot evict each other and
// an entry dies with the layout it describes, plus a check of everything the
// curves actually depend on. `deletions` is in that list because it decides
// which edges bow and around what; `version` is, because a node drag mutates the
// positions in place and their identity cannot report it.
export type EdgeCurves = Map<number, BezierCurve[]>

const cache = new WeakMap<
  Record<string, NodeSegment[]>,
  {
    graph: Graph
    scaleX: number
    scaleY: number
    deletions: Map<number, string[]> | undefined
    version: number
    curves: EdgeCurves
  }
>()

export function baseEdgeCurves(
  nodePositions: Record<string, NodeSegment[]>,
  graph: Graph,
  axis: AxisScale,
  // bypassed backbone ids per deletion edge, i.e. `deletionEdges()` keyed by
  // edge index. An edge named here bows around the run it skips.
  deletions: Map<number, string[]> | undefined,
  version: number,
): EdgeCurves {
  const { scaleX, scaleY } = axis
  const cached = cache.get(nodePositions)
  if (
    cached?.graph === graph &&
    cached.scaleX === scaleX &&
    cached.scaleY === scaleY &&
    cached.deletions === deletions &&
    cached.version === version
  ) {
    return cached.curves
  }
  const curves: EdgeCurves = new Map()
  for (let ei = 0; ei < graph.edges.length; ei++) {
    const edge = graph.edges[ei]!
    const from = nodePositions[edge.from]
    const to = nodePositions[edge.to]
    // An edge whose endpoints the layout did not place has no curve, and its
    // absence here is the same "skip it" every consumer already applies.
    if (from?.length && to?.length) {
      const bypassed = deletions?.get(ei)
      curves.set(
        ei,
        computeEdgeCurves(
          from,
          to,
          edge.from === edge.to,
          0,
          0,
          axis,
          bypassed ? bypassedPoints(nodePositions, bypassed) : [],
        ),
      )
    }
  }
  cache.set(nodePositions, {
    graph,
    scaleX,
    scaleY,
    deletions,
    version,
    curves,
  })
  return curves
}
