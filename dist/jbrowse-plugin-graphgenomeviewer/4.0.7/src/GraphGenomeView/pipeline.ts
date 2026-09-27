import { isBackbone } from './anchoredNodes'
import { spreadFor } from './bubbleSpreads'
import { convertGFAToGraph } from './gfa/gfaConverter'
import { drawnNodeLength, layoutScaling } from './layout/drawnScale'
import { mergeRuns, splitRuns } from './layout/mergeRuns'
import { orientToReference } from './layout/orientToReference'
import { seededNodes } from './layout/referenceSeeds'
import { anchorGraph } from './pathAnchoring'
import { parseGFA } from '../gfa-core/index'

import type { BubbleSpread } from './bubbleSpreads'
import type { LayoutScaling } from './layout/drawnScale'
import type { LayoutNode } from './layout/referenceSeeds'
import type { Graph, LayoutResult, NodeSegment } from './types'

// The graph a view draws, from GFA text to layouts, with no host in it: the
// GraphGenomeView model and a standalone page both drive this.

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

// A general GFA states its coordinates only in its P/W lines, so the walk that
// recovers them happens before anything reads `stable`; otherwise the anchored
// layouts see an unanchored graph and hand off to force. `maxNodes` is checked
// here because it is upstream of everything that scales with the node count.
export function loadGraph(
  text: string,
  name: string,
  opts: { referencePath?: string; maxNodes?: number } = {},
) {
  const graph = anchorGraph(
    convertGFAToGraph(parseGFA(text), name),
    opts.referencePath,
  )
  if (graph.nodes.length === 0) {
    throw new Error(`No graph segments in ${name}`)
  }
  if (opts.maxNodes !== undefined && graph.nodes.length > opts.maxNodes) {
    throw new Error(
      `Graph too large to draw: ${graph.nodes.length.toLocaleString()} nodes (limit ${opts.maxNodes.toLocaleString()}). Zoom in to a smaller region, or raise maxGraphNodes on this view.`,
    )
  }
  return graph
}

// What the Bandage engine is handed. A node may carry an `x`/`y` seed, which
// the engine reads as where its chain starts (referenceSeeds.ts).
export interface EngineRequest {
  graph: { nodes: LayoutNode[]; edges: Graph['edges'] }
  options: Record<string, unknown>
}

export type LayoutEngine = (
  request: EngineRequest,
) => Promise<{ result: LayoutResult; duration: number }>

export interface EngineSettings {
  quality: number
  linearLayout: boolean
  bubbleSpread: BubbleSpread
}

// `scaling.nodes` rather than the graph's own: under a compressing drawn-length
// law a node's `length` crosses this boundary as a drawn length, which is all
// the engine ever reads it as. An anchored graph also carries a seed per node,
// the backbone along x, and asks the engine not to rotate components: FMMM
// then keeps the reference's coarse shape instead of curling it into a C
// (docs/layout-experiments.md, experiment 2).
export function engineRequest(
  graph: Graph,
  scaling: LayoutScaling,
  settings: EngineSettings,
): EngineRequest {
  const anchored = graph.nodes.some(isBackbone)
  return {
    graph: {
      nodes: anchored ? seededNodes(graph, scaling) : scaling.nodes,
      edges: graph.edges,
    },
    options: {
      quality: settings.quality,
      linearLayout: settings.linearLayout,
      ...scaling.opts,
      ...(anchored ? { rotateComponents: false } : {}),
    },
  }
}

// The engine lays out the runs, not the nodes: a base-level cut is thousands
// of nodes in unbranching chains, and one chain per run is the same drawing at
// a third of the time. Members take their share of the run's polyline by drawn
// length, so the picture is per node again before anything else sees it, and
// it is turned so the reference reads left to right.
export async function forceLayout(
  graph: Graph,
  settings: EngineSettings,
  engine: LayoutEngine,
) {
  const spread = spreadFor(settings.bubbleSpread)
  const merged = mergeRuns(graph)
  const { result, duration } = await engine(
    engineRequest(merged.graph, layoutScaling(merged.graph, spread), settings),
  )
  const scaling = layoutScaling(graph, spread)
  const drawn = new Map(
    scaling.nodes.map(n => [n.id, drawnNodeLength(scaling.opts, n.length)]),
  )
  const positions = splitRuns(
    result.nodePositions,
    merged.runs,
    id => drawn.get(id) ?? 0,
  )
  return {
    result: {
      ...result,
      nodePositions: graph.nodes.some(isBackbone)
        ? orientToReference(graph, positions)
        : positions,
    },
    duration,
  }
}

export function layoutExtent(
  nodePositions: Record<string, NodeSegment[]>,
): Bounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const segments of Object.values(nodePositions)) {
    for (const seg of segments) {
      minX = Math.min(minX, seg.x)
      minY = Math.min(minY, seg.y)
      maxX = Math.max(maxX, seg.x)
      maxY = Math.max(maxY, seg.y)
    }
  }
  return { minX, minY, maxX, maxY }
}

// Gap between the drawing and the edge of the pane, on all four sides.
export const FIT_PADDING = 40

// The floor keeps a scale positive and finite, and has to clear the smallest
// scale a real layout asks for: fitting a chromosome-scale rGFA (250 Mbp) into
// ~720 px needs ~3e-6.
const MIN_ZOOM = 1e-6
const MAX_ZOOM = 100

export function clampZoom(zoom: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
}

// Centre the leftover, but only when there IS leftover. A row layout fits on x
// alone, so its drawing is routinely taller than the pane, and centring an
// overflow would push the top row, the reference backbone, off the top.
export function fittedTranslateY(
  bounds: { minY: number; h: number },
  usableHeight: number,
  yScale: number,
) {
  const leftoverY = usableHeight - bounds.h * yScale
  return FIT_PADDING - bounds.minY * yScale + Math.max(0, leftoverY) / 2
}

// The transform that fits `bounds` in the pane, or undefined when there is
// nothing to fit or nothing to fit into. Each axis constrains the scale only
// when it has extent, since an anchored window holding only backbone puts every
// node on row 0. A row layout (`pixelRows`) fits on x alone and keeps y in
// screen px; an isotropic one fits on whichever axis binds.
export function fitTransform(
  bounds: { minX: number; minY: number; w: number; h: number },
  paneWidth: number,
  paneHeight: number,
  pixelRows: boolean,
) {
  const usableWidth = paneWidth - FIT_PADDING * 2
  const usableHeight = paneHeight - FIT_PADDING * 2
  if (
    usableWidth <= 0 ||
    usableHeight <= 0 ||
    !(bounds.w > 0 || (!pixelRows && bounds.h > 0))
  ) {
    return undefined
  }
  const fitX = bounds.w > 0 ? usableWidth / bounds.w : Infinity
  const fitY = bounds.h > 0 ? usableHeight / bounds.h : Infinity
  const scale = clampZoom(pixelRows ? fitX : Math.min(fitX, fitY))
  return {
    scale,
    translateX:
      FIT_PADDING - bounds.minX * scale + (usableWidth - bounds.w * scale) / 2,
    translateY: fittedTranslateY(bounds, usableHeight, pixelRows ? 1 : scale),
  }
}

// Extent of the drawing in layout units, which the fit and the pane height
// read. On a reference-bp layout x is the cut window rather than how far the
// drawing reaches: an allele anchored far outside it is a fact about the
// graph, not a reason to draw the window at 6% of the frame. `extent` stands
// in for the layout's own when an overlay's rows reach further (walk rows).
export function drawingBounds(
  layout: LayoutResult,
  opts: {
    region?: { start: number; end: number }
    extent?: { maxX: number; maxY: number }
  } = {},
) {
  const { minY, ...reach } = layoutExtent(layout.nodePositions)
  let { minX, maxX, maxY } = reach
  const { region } = opts
  if (layout.referenceAxis && region && region.end > region.start) {
    minX = region.start
    maxX = region.end
  }
  const extent = opts.extent ?? layout.extent
  if (extent) {
    maxX = Math.max(maxX, extent.maxX)
    maxY = Math.max(maxY, extent.maxY)
  }
  return { minX, minY, w: maxX - minX, h: maxY - minY }
}
