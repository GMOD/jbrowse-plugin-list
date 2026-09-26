import { EdgeSpatialIndex, SpatialIndex } from './SpatialIndex'
import { pathRibbonOffsets, translateCurves, yToXOf } from './geometry'

import type { Graph, NodeSegment } from '../types'
import type { AxisScale, BezierCurve } from './geometry'

export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) {
    return Math.hypot(px - x1, py - y1)
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

export function distanceToCubicBezier(
  px: number,
  py: number,
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
) {
  // To the chords between samples, not to the samples: on a long curve they
  // are tens of px apart, and a cursor on the curve between two of them
  // measured as far off it as half that gap.
  let minDist = Infinity
  const samples = 20
  let lastX = x1
  let lastY = y1
  for (let i = 1; i <= samples; i++) {
    const t = i / samples
    const u = 1 - t
    const bx =
      u * u * u * x1 +
      3 * u * u * t * cx1 +
      3 * u * t * t * cx2 +
      t * t * t * x2
    const by =
      u * u * u * y1 +
      3 * u * u * t * cy1 +
      3 * u * t * t * cy2 +
      t * t * t * y2
    minDist = Math.min(minDist, distanceToSegment(px, py, lastX, lastY, bx, by))
    lastX = bx
    lastY = by
  }
  return minDist
}

function distanceToBezierCurve(px: number, py: number, c: BezierCurve) {
  return distanceToCubicBezier(
    px,
    py,
    c.x0,
    c.y0,
    c.cx0,
    c.cy0,
    c.cx1,
    c.cy1,
    c.x1,
    c.y1,
  )
}

function distanceToEdgeCurves(
  px: number,
  py: number,
  curves: BezierCurve[],
  yToX = 1,
) {
  let minDist = Infinity
  for (const c of curves) {
    const d = distanceToBezierCurve(
      px,
      py,
      yToX === 1
        ? c
        : {
            x0: c.x0,
            y0: c.y0 * yToX,
            cx0: c.cx0,
            cy0: c.cy0 * yToX,
            cx1: c.cx1,
            cy1: c.cy1 * yToX,
            x1: c.x1,
            y1: c.y1 * yToX,
          },
    )
    if (d < minDist) {
      minDist = d
    }
  }
  return minDist
}

// Indexes are cached against the layout they were built from, in a WeakMap
// rather than a module-level slot. A single slot meant two graph views in one
// session evicted each other's index on alternating mousemoves, and held the last
// graph's positions alive for as long as the tab lived. Keyed this way each view
// keeps its own, and an entry becomes collectable when its layout is replaced.
//
// `version` still has to be compared: a node drag mutates the position objects in
// place, so the identity of `nodePositions` cannot report that it changed.
const nodeCache = new WeakMap<
  Record<string, NodeSegment[]>,
  { version: number; index: SpatialIndex }
>()

function getSpatialIndex(
  nodePositions: Record<string, NodeSegment[]>,
  version: number,
) {
  const cached = nodeCache.get(nodePositions)
  if (cached?.version === version) {
    return cached.index
  }
  const index = new SpatialIndex(nodePositions)
  nodeCache.set(nodePositions, { version, index })
  return index
}

const edgeCache = new WeakMap<
  Record<string, NodeSegment[]>,
  {
    graph: Graph
    drawPaths: boolean
    // compared by VALUE, not by the AxisScale's identity: the model rebuilds
    // that object whenever either scale changes, so identity would miss a cache
    // hit on every mousemove
    scaleX: number
    scaleY: number
    version: number
    index: EdgeSpatialIndex
    deletions?: Map<number, string[]>
  }
>()

function getEdgeSpatialIndex(
  nodePositions: Record<string, NodeSegment[]>,
  graph: Graph,
  drawPaths: boolean,
  axis: AxisScale,
  version: number,
  deletions?: Map<number, string[]>,
) {
  const cached = edgeCache.get(nodePositions)
  if (
    cached?.graph === graph &&
    cached.drawPaths === drawPaths &&
    cached.scaleX === axis.scaleX &&
    cached.scaleY === axis.scaleY &&
    cached.version === version &&
    cached.deletions === deletions
  ) {
    return cached.index
  }
  const index = new EdgeSpatialIndex(
    nodePositions,
    graph,
    drawPaths,
    axis,
    undefined,
    deletions,
    version,
  )
  edgeCache.set(nodePositions, {
    graph,
    drawPaths,
    scaleX: axis.scaleX,
    scaleY: axis.scaleY,
    version,
    index,
    deletions,
  })
  return index
}

// Every distance below is measured with y converted into x units by `yToX` (the
// model's scaleY / scaleX), because on a row layout the two axes are bp and
// screen px and a raw hypot over them is not a distance at all — 5 bp of x and
// 5 px of y are nothing alike. The thresholds stay screen px over the x scale,
// which is what they always were; on an isotropic layout yToX is 1 and this is
// the arithmetic it has always done.
//
// `ink` is how far from its centreline each node is drawn, in screen px, and
// the most any node is. A node drawn thick by its depth is 18 px across at the
// defaults, and a fixed tolerance missed the pointer on its outer ink, where
// the link beside it took the hover instead. MIN_NODE_REACH_PX keeps a thin
// node catchable.
const MIN_NODE_REACH_PX = 5

export interface NodeInk {
  halfWidthPx: (nodeId: string) => number
  maxHalfWidthPx: number
}

export function findHoveredNode(
  nodePositions: Record<string, NodeSegment[]>,
  graphX: number,
  graphY: number,
  axis: AxisScale,
  version = 0,
  ink?: NodeInk,
) {
  const yToX = yToXOf(axis)
  const index = getSpatialIndex(nodePositions, version)
  const reach = (px: number) => Math.max(MIN_NODE_REACH_PX, px) / axis.scaleX
  // the query has to cover the thickest node there could be
  const queryReach = reach(ink?.maxHalfWidthPx ?? 0)
  const candidates = index.query(graphX, graphY, queryReach, queryReach / yToX)

  // The nearest candidate, not the first one inside its reach. The reach is in
  // world units, so when zoomed out it covers several nodes at once and "first"
  // meant whichever the grid happened to visit first — the cursor could sit on
  // one node and highlight its neighbour.
  let hovered: string | null = null
  let best = Infinity
  for (const { nodeId, segmentIdx } of candidates) {
    const segments = nodePositions[nodeId]!
    const dist = distanceToSegment(
      graphX,
      graphY * yToX,
      segments[segmentIdx]!.x,
      segments[segmentIdx]!.y * yToX,
      segments[segmentIdx + 1]!.x,
      segments[segmentIdx + 1]!.y * yToX,
    )
    if (dist < best && dist < reach(ink?.halfWidthPx(nodeId) ?? 0)) {
      best = dist
      hovered = nodeId
    }
  }
  return hovered
}

export function findHoveredEdge(
  nodePositions: Record<string, NodeSegment[]>,
  graph: Graph,
  graphX: number,
  graphY: number,
  axis: AxisScale,
  drawPaths: boolean,
  version = 0,
  deletions?: Map<number, string[]>,
  hiddenEdges?: ReadonlySet<number>,
) {
  const yToX = yToXOf(axis)
  const edgeThreshold = 10 / axis.scaleX
  const edgeIndex = getEdgeSpatialIndex(
    nodePositions,
    graph,
    drawPaths,
    axis,
    version,
    deletions,
  )
  const candidates = edgeIndex.query(
    graphX,
    graphY,
    edgeThreshold,
    edgeThreshold / yToX,
  )

  // Nearest, not first — same reason as findHoveredNode.
  let hovered: number | null = null
  let best = edgeThreshold
  for (const edgeIdx of candidates) {
    const edge = graph.edges[edgeIdx]!
    const fromSegments = nodePositions[edge.from]
    const toSegments = nodePositions[edge.to]
    if (
      !fromSegments?.length ||
      !toSegments?.length ||
      hiddenEdges?.has(edgeIdx)
    ) {
      continue
    }

    const numPaths = edge.pathIds?.length ?? 0
    const baseCurves = edgeIndex.getCurves(edgeIdx)
    if (!baseCurves) {
      continue
    }
    let dist: number

    if (!drawPaths || numPaths === 0) {
      dist = distanceToEdgeCurves(graphX, graphY * yToX, baseCurves, yToX)
    } else {
      // The same offsets GeometryBuilder drew the ribbons at, from the one
      // function that decides them, so a ribbon is hoverable where it is drawn.
      let minDist = Infinity
      for (const offset of pathRibbonOffsets(
        fromSegments,
        toSegments,
        numPaths,
        axis,
      )) {
        const curves =
          offset.x === 0 && offset.y === 0
            ? baseCurves
            : translateCurves(baseCurves, offset.x, offset.y)
        const d = distanceToEdgeCurves(graphX, graphY * yToX, curves, yToX)
        if (d < minDist) {
          minDist = d
        }
      }
      dist = minDist
    }

    if (dist < best) {
      best = dist
      hovered = edgeIdx
    }
  }
  return hovered
}
