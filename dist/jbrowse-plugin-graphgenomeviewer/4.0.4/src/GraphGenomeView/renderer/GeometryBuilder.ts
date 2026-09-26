import { packAbgr } from '@jbrowse/core/util/colorBits'

import { fadeAbgr } from './colorBits'
import { meanDepth, nodeWidthPx } from '../nodeWidths'
import {
  PATH_LIGHTNESS,
  PATH_SATURATION,
  nameHue,
  pathHueAt,
} from '../pathColors'
import { referenceMidpoints } from '../referenceSpan'
import { baseEdgeCurves } from '../util/edgeCurves'
import {
  dashCurves,
  pathRibbonOffsets,
  translateCurves,
  yToXOf,
} from '../util/geometry'

import type { ResolvedColorScheme } from '../colorSchemes'
import type { NodeWidth } from '../nodeWidths'
import type { Graph, GraphNode, NodeSegment } from '../types'
import type { WalkHighlight } from '../walkHighlight'
import type {
  Arrowhead,
  EdgeCurveBatch,
  NodeStroke,
  RenderBatch,
  Run,
} from './types'
import type { AxisScale, BezierCurve } from '../util/geometry'

// Colors flow through the geometry builder as ABGR-in-u32 (see colorBits.ts),
// so a brighten or fade is integer arithmetic and a batch of a hundred thousand
// strokes carries its colours in one number each.
const EDGE_DEFAULT_COLOR = packAbgr(119, 119, 119, 217) // rgb(119,119,119) ~ 0.467, alpha 0.85
const EDGE_PATH_FALLBACK_COLOR = packAbgr(136, 136, 136, 217) // ~0.533, alpha 0.85
// An edge that skips reference sequence: the graph's own statement that some
// haplotype does not carry what the backbone does. Drawn thicker than a plain
// link, and unconditionally rather than under a colour scheme, because a
// deletion has no node to colour — nothing else in the drawing can carry it, so
// there is no scheme it could disagree with. See deletionEdges.ts.
//
// NEAR-BLACK, not red. The reference-position ramp runs hue 0 to 300 at 70%/50%,
// and its hue-0 end is rgb(217,38,38) — the old rgb(214,39,40) was that colour
// to within three points, so at the start of any region the deletion arc and the
// backbone under it were the same red (review: "the 'red' coloring is too close
// to the rainbow"). Nothing else in the drawing is near-black: nodes are ramp
// hues or the off-reference charcoal, plain links are mid grey. Weight and
// darkness carry it instead of a hue, which is what keeps hue meaning reference
// position and only that.
const EDGE_DELETION_COLOR = packAbgr(24, 24, 28, 240)
const DELETION_THICKNESS_FACTOR = 2.2
// A highlighted walk's links: darker than a plain link and heavier, so the
// route reads as one stroke through the faded rest. The alpha the rest fades
// to keeps every colour scheme's hues, only dimmer, on any background.
const EDGE_WALK_COLOR = packAbgr(30, 30, 36, 245)
const WALK_EDGE_THICKNESS_FACTOR = 1.8
const FADED_ALPHA = 0.18
// Dash period in screen px, so a dashed arc looks the same at any zoom. Dashes
// are geometry rather than a stroke style, because only one of the two backends
// has one; see dashCurves.
const DELETION_DASH_PX = 11

// A node drawn under `drawPaths` is split into one lengthwise stripe per path in
// the graph, in the legend's own order, and a path that does not visit the node
// leaves its slot empty. The slot is what makes carriage readable: an absence
// lands in the same place on every node, so "which sample skips this segment"
// is a gap at a fixed height rather than something to be counted.
//
// Only the edges used to carry this, and how many of a graph's paths resolved
// there was a function of how long the edge happened to be DRAWN: a kilobase
// deletion is one long edge and separates all five strokes, while a 1 bp SNP
// bubble is an edge a few px long and shows a speck (review: "only deletion
// really shows paths clearly, the edges between nodes are too small to see the
// paths ... even coloring the length of the nodes using the per-sample colors").
// A node is drawn at its own length, which is the one thing in the drawing that
// does not shrink to a joint.
//
// How many paths is too many to colour at all is not decided here — it is one
// rule over the stripes, the ribbons and the key, so the model resolves it and
// hands down the answer as `drawPaths`. See MAX_PATH_COLORS.
//
// A stripe below this many screen px is not a color, it is aliasing between
// neighbouring stripes. Under it the node keeps its own scheme colour.
// `contigThickness` is itself in screen px, so this bites on the path COUNT
// rather than on the zoom.
const MIN_PATH_STRIPE_PX = 1.2
// Guards the screen-px-to-world division below against a degenerate transform.
const MIN_SCALE_FOR_OFFSET = 1e-6

// Half-extent of an arrowhead, in SCREEN px: the renderer expands it after the
// transform (see TransformUniform), so an arrowhead is the same size at every
// zoom.
const ARROWHEAD_SIZE = 12
const MIN_ARROW_SCALE = 0.45

// Per-point unit normals of a polyline, mitred at the interior joints so a
// stripe slid along them keeps a constant distance from the node's own outline
// where it bends.
//
// `yToX` puts the two axes in comparable units first (see computeEdgeCurves), so
// the normal is perpendicular to the polyline AS DRAWN rather than to its
// coordinates. It is 1 on an isotropic layout, where the two are the same thing.
function pointNormalsOf(rawPoints: { x: number; y: number }[], yToX = 1) {
  const points =
    yToX === 1 ? rawPoints : rawPoints.map(p => ({ x: p.x, y: p.y * yToX }))
  const pointNormals: { nx: number; ny: number }[] = []
  for (let i = 0; i < points.length; i++) {
    let nx = 0
    let ny = 0

    if (i === 0) {
      const dx = points[1]!.x - points[0]!.x
      const dy = points[1]!.y - points[0]!.y
      const len = Math.hypot(dx, dy)
      if (len > 0) {
        nx = -dy / len
        ny = dx / len
      }
    } else if (i === points.length - 1) {
      const dx = points[i]!.x - points[i - 1]!.x
      const dy = points[i]!.y - points[i - 1]!.y
      const len = Math.hypot(dx, dy)
      if (len > 0) {
        nx = -dy / len
        ny = dx / len
      }
    } else {
      const dx1 = points[i]!.x - points[i - 1]!.x
      const dy1 = points[i]!.y - points[i - 1]!.y
      const len1 = Math.hypot(dx1, dy1)
      const dx2 = points[i + 1]!.x - points[i]!.x
      const dy2 = points[i + 1]!.y - points[i]!.y
      const len2 = Math.hypot(dx2, dy2)

      if (len1 > 0 && len2 > 0) {
        const nx1 = -dy1 / len1
        const ny1 = dx1 / len1
        const nx2 = -dy2 / len2
        const ny2 = dx2 / len2
        nx = (nx1 + nx2) / 2
        ny = (ny1 + ny2) / 2
        const dot = nx1 * nx + ny1 * ny
        if (dot > 0.1) {
          nx /= dot
          ny /= dot
        }
      } else if (len1 > 0) {
        nx = -dy1 / len1
        ny = dx1 / len1
      } else if (len2 > 0) {
        nx = -dy2 / len2
        ny = dx2 / len2
      }
    }
    pointNormals.push({ nx, ny })
  }
  return pointNormals
}

// The polyline shifted `distance` world units along its own normals, which is
// the node equivalent of the constant perpendicular offset the edge path
// strokes already take. `distance` is in x units and the normal is the drawn
// one (pointNormalsOf), so the y component comes back out of x units here.
function offsetPolyline(
  points: { x: number; y: number }[],
  normals: { nx: number; ny: number }[],
  distance: number,
  yToX = 1,
) {
  return points.map((p, i) => ({
    x: p.x + normals[i]!.nx * distance,
    y: p.y + (normals[i]!.ny * distance) / yToX,
  }))
}

function packNorm(r: number, g: number, b: number, a: number) {
  return packAbgr(
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
    Math.round(a * 255),
  )
}

export interface BuildOptions {
  nodePositions: Record<string, NodeSegment[]>
  graph: Graph
  nodeById: Map<string, GraphNode>
  colorScheme: ResolvedColorScheme
  contigThickness: number
  connectorThickness: number
  // Whether to paint per path — the RESOLVED answer, not the raw view prop.
  // Past MAX_PATH_COLORS a graph's paths are not drawable as colours at all and
  // the model hands over `false`, which is the one place that decides it for
  // the stripes, the ribbons and the key together. Same contract as
  // `colorScheme` above, which arrives with 'auto' already resolved.
  drawPaths: boolean
  // thicker by depth, or every node at `contigThickness`; see nodeWidths.ts
  nodeWidth?: NodeWidth
  // one walk lifted out: its nodes keep their colour and its links draw dark
  // and heavy, everything else fades to a fraction of its alpha
  highlight?: WalkHighlight
  // Both scales together, and required. Every screen-metric constant here (dash
  // period, stripe width, arrowhead angle) divides by scaleX, and everything
  // that mixes the axes needs their ratio; taking them as one value is what
  // keeps a caller from supplying an x scale and defaulting y, which draws a
  // wrong picture and reports nothing. See AxisScale.
  axis: AxisScale
  linearLayout?: boolean
  viewportBounds?: { minX: number; minY: number; maxX: number; maxY: number }
  // What the 'reference-position' scheme paints from: each node's midpoint on
  // the reference, and the interval the hue spans. Unused by every other
  // scheme, and passed in rather than derived here for the reason `deletions`
  // below is — it costs a neighbour walk per node, it is a fact about the
  // graph, and this function runs on every pan. `computeReferenceRamp` is what
  // builds one.
  referenceRamp?: ReferenceRamp
  // links that skip reference sequence (deletionEdges()), keyed by their index
  // into graph.edges and carrying the backbone node ids they bypass. Passed in
  // rather than derived here because the model can hold it against the graph,
  // and because the same set names the hover text.
  deletions?: Map<number, string[]>
  hiddenEdges?: ReadonlySet<number>
  // Bumped when a drag moves the positions in place, which their identity
  // cannot report. Only the shared curve cache reads it; see baseEdgeCurves.
  version?: number
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  return [r + m, g + m, b + m]
}

// Evenly-spaced RGB gradient stops (0-255 per channel).
const DEPTH_GRADIENT = [
  [68, 1, 84],
  [59, 82, 139],
  [33, 145, 140],
  [94, 201, 98],
  [253, 231, 37],
] as const

// ranks >= 1, i.e. everything off the reference backbone
const STABLE_RANK_GRADIENT = [
  [237, 137, 44],
  [158, 42, 122],
] as const

const NODE_LENGTH_GRADIENT = [
  [220, 50, 50],
  [50, 120, 220],
] as const

// Sample a piecewise-linear RGB gradient; t is clamped to [0,1].
function sampleGradient(
  stops: readonly (readonly [number, number, number])[],
  t: number,
) {
  const pos = Math.max(0, Math.min(1, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(pos))
  const f = pos - i
  const a = stops[i]!
  const b = stops[i + 1]!
  return packAbgr(
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
    255,
  )
}

// Deterministic color from a string (djb2-style hash → HSL hue), for the
// `random` node scheme. The path ribbons do NOT use this — see pathHueAt.
function hashColor(str: string, alpha: number) {
  const [r, g, b] = hslToRgb(nameHue(str), PATH_SATURATION, PATH_LIGHTNESS)
  return packNorm(r, g, b, alpha)
}

// A hue ramp over reference coordinates, which is the one colouring a linear
// track can reproduce exactly: it is a function of two stated numbers and a
// node's reference midpoint, so `hsl(min(300,max(0,(mid-start)/span*300)),70%,50%)`
// in a track's `color` slot paints a segment the colour the graph paints its
// node. Stops at 300 rather than wrapping to 360, so the two ends of the window
// are red and magenta rather than both red.
export const REFERENCE_RAMP_MAX_HUE = 300
const REFERENCE_RAMP_SATURATION = 0.7
const REFERENCE_RAMP_LIGHTNESS = 0.5
// Off-reference segments come off the ramp entirely and paint one flat charcoal.
//
// They used to keep the hue of the reference they replace, paler and softer, on
// the argument that the correspondence is the whole scheme. Two rounds of docs
// review say otherwise: a pale hue is still a hue on the ramp, so an alternative
// allele reads as reference sequence at that position rather than as sequence
// the reference does not have — "non-backbone parts of the bandage graph could
// be coloured in a non-spectrum colouring". Nothing is lost by dropping the hue,
// because in both anchored layouts an allele's x already states which reference
// position it attaches to, and in the force layout its position states nothing
// to begin with.
//
// Distinct from the light grey a node with no reference coordinates at all gets:
// this one is anchored and off-reference, that one is unplaceable.
const REFERENCE_RAMP_ALT_COLOR = packAbgr(60, 65, 72, 255)

export interface ReferenceRamp {
  start: number
  span: number
  midpoints: Map<string, number>
}

export interface ColorSchemeRange {
  minDepth: number
  maxDepth: number
  minLength: number
  maxLength: number
  maxRank: number
  nodeCount: number
  referenceRamp?: ReferenceRamp
}

// The domain is stated by the caller — the region the subgraph was cut from —
// rather than measured off the nodes, because a linear view has no way to know
// what the cut reached: segments overrun the region at both edges, so a
// measured domain would shift the hue of every node by an amount the other
// panel cannot compute. With no region (a whole-file import) the drawn extent
// is all there is, and the ramp is then only comparable to itself.
export function computeReferenceRamp(
  graph: Graph,
  domain: { start: number; end: number } | undefined,
): ReferenceRamp {
  const midpoints = referenceMidpoints(graph)
  if (domain && domain.end > domain.start) {
    return {
      start: domain.start,
      span: domain.end - domain.start,
      midpoints,
    }
  }
  let min = Infinity
  let max = -Infinity
  for (const mid of midpoints.values()) {
    min = Math.min(min, mid)
    max = Math.max(max, mid)
  }
  return {
    start: min === Infinity ? 0 : min,
    span: max > min ? max - min : 1,
    midpoints,
  }
}

export function computeColorSchemeRange(graph: Graph) {
  let minDepth = Infinity
  let maxDepth = -Infinity
  let minLength = Infinity
  let maxLength = -Infinity
  let maxRank = 0
  for (const n of graph.nodes) {
    if (n.stable !== undefined && n.stable.rank > maxRank) {
      maxRank = n.stable.rank
    }
    if (n.depth < minDepth) {
      minDepth = n.depth
    }
    if (n.depth > maxDepth) {
      maxDepth = n.depth
    }
    if (n.length < minLength) {
      minLength = n.length
    }
    if (n.length > maxLength) {
      maxLength = n.length
    }
  }
  return {
    minDepth,
    maxDepth,
    minLength,
    maxLength,
    maxRank,
    nodeCount: graph.nodes.length,
  } satisfies ColorSchemeRange
}

export function getNodeColor(
  node: GraphNode,
  nodeIndex: number,
  colorScheme: ResolvedColorScheme,
  range: ColorSchemeRange,
) {
  switch (colorScheme) {
    case 'random':
      return hashColor(node.id, 1)

    case 'depth':
      return sampleGradient(
        DEPTH_GRADIENT,
        range.maxDepth > range.minDepth
          ? (node.depth - range.minDepth) / (range.maxDepth - range.minDepth)
          : 0.5,
      )

    case 'node-length':
      return sampleGradient(
        NODE_LENGTH_GRADIENT,
        range.maxLength > range.minLength
          ? (node.length - range.minLength) /
              (range.maxLength - range.minLength)
          : 0.5,
      )

    // rGFA states the backbone rather than leaving it to be inferred: rank 0 is
    // the reference, higher ranks are the sequence that diverges from it. A
    // graph with no SR tags draws every node as unranked.
    case 'stable-rank':
      return node.stable === undefined
        ? packAbgr(160, 160, 160, 255)
        : node.stable.rank === 0
          ? packAbgr(52, 152, 219, 255)
          : sampleGradient(
              STABLE_RANK_GRADIENT,
              range.maxRank > 1
                ? (node.stable.rank - 1) / (range.maxRank - 1)
                : 0,
            )

    // Position on the reference, the one quantity both panels of a
    // graph-over-linear figure can state. A node with no reference position at
    // all — nothing anchored, or an allele whose flanks fell outside the cut —
    // is grey rather than a hue it has not earned.
    case 'reference-position': {
      const ramp = range.referenceRamp
      const mid = ramp?.midpoints.get(node.id)
      if (ramp === undefined || mid === undefined) {
        return packAbgr(160, 160, 160, 255)
      }
      if (node.stable !== undefined && node.stable.rank > 0) {
        return REFERENCE_RAMP_ALT_COLOR
      }
      const frac = Math.max(0, Math.min(1, (mid - ramp.start) / ramp.span))
      const [r, g, b] = hslToRgb(
        frac * REFERENCE_RAMP_MAX_HUE,
        REFERENCE_RAMP_SATURATION,
        REFERENCE_RAMP_LIGHTNESS,
      )
      return packNorm(r, g, b, 1)
    }

    case 'grey':
      return packAbgr(160, 160, 160, 255)

    case 'rainbow': {
      const hue = range.nodeCount > 1 ? (nodeIndex / range.nodeCount) * 360 : 0
      const [r, g, b] = hslToRgb(hue, 0.75, 0.5)
      return packNorm(r, g, b, 1)
    }

    default:
      return packAbgr(52, 152, 219, 255)
  }
}

// A cubic's tangent at t=1 runs from its last control point to its endpoint, so
// an arrowhead's angle needs no tessellation. A control point sitting exactly on
// the endpoint states no direction there; the chord is the only thing left.
//
// Exported for the test that checks it against a numerically differentiated
// curve: arrow angles previously came from the last two tessellated points, and
// this has to reproduce that direction to keep arrowheads pointing along the edge.
// The angle an arrowhead points, which is a SCREEN angle: the head is expanded
// from a screen-px size (addArrowhead offsets by `normal * size` after the
// transform), so its direction has to be the drawn one too. `yToX` is what puts
// the y difference in the same units as the x one; on an isotropic layout it is
// 1 and the ratio inside atan2 is unchanged.
export function endTangent(c: BezierCurve, yToX = 1) {
  const dx = c.x1 - c.cx1
  const dy = (c.y1 - c.cy1) * yToX
  return Math.hypot(dx, dy) > 0
    ? Math.atan2(dy, dx)
    : Math.atan2((c.y1 - c.y0) * yToX, c.x1 - c.x0)
}

// Whether any part of a node's polyline falls inside the viewport. Testing the
// *segments* rather than their endpoints is what makes a node wider than the
// window visible: in the reference-anchored layouts x is in bp, so a backbone
// segment routinely spans the whole viewport with both ends outside it, and
// point containment culled exactly the segment the view exists to show.
//
// Segment bounding boxes, not exact line-rect intersection: culling only has to
// avoid dropping something visible, and a diagonal kept by its bbox costs one
// polyline.
function isPolylineInBounds(
  segments: NodeSegment[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
) {
  let hit = false
  for (let i = 0; i < segments.length - 1 && !hit; i++) {
    const a = segments[i]!
    const b = segments[i + 1]!
    hit =
      Math.max(a.x, b.x) >= bounds.minX &&
      Math.min(a.x, b.x) <= bounds.maxX &&
      Math.max(a.y, b.y) >= bounds.minY &&
      Math.min(a.y, b.y) <= bounds.maxY
  }
  return hit
}

function isBezierInBounds(
  curves: BezierCurve[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
) {
  for (const c of curves) {
    const cMinX = Math.min(c.x0, c.cx0, c.cx1, c.x1)
    const cMaxX = Math.max(c.x0, c.cx0, c.cx1, c.x1)
    const cMinY = Math.min(c.y0, c.cy0, c.cy1, c.y1)
    const cMaxY = Math.max(c.y0, c.cy0, c.cy1, c.y1)
    if (
      cMaxX >= bounds.minX &&
      cMinX <= bounds.maxX &&
      cMaxY >= bounds.minY &&
      cMinY <= bounds.maxY
    ) {
      return true
    }
  }
  return false
}

// Per-graph derivations, cached on the graph: this function runs on every
// debounced pan and zoom, and a walk over every path's every step is a fact
// about the graph rather than about the frame.

// By position in the path list, matching pathLegend's swatches exactly, so the
// key beside the drawing names the strokes in it.
//
// One array plus a name lookup, rather than an array and a Map of the same
// colours: two paths that share a name then draw the same colour on their
// edges and on their nodes, instead of the Map keeping the last one written
// while the array kept the first. `gfaConverter` no longer produces such a
// pair, and this is what makes the drawing merely wrong rather than
// inconsistent if anything ever does again.
const paletteCache = new WeakMap<
  Graph,
  { pathColorByIndex: number[]; pathIndexByName: Map<string, number> }
>()

function pathPaletteOf(graph: Graph) {
  let palette = paletteCache.get(graph)
  if (!palette) {
    const pathColorByIndex: number[] = []
    const pathIndexByName = new Map<string, number>()
    const paths = graph.paths ?? []
    for (let i = 0; i < paths.length; i++) {
      const [r, g, b] = hslToRgb(
        pathHueAt(i, paths.length),
        PATH_SATURATION,
        PATH_LIGHTNESS,
      )
      pathColorByIndex.push(packNorm(r, g, b, 0.85))
      if (!pathIndexByName.has(paths[i]!.name)) {
        pathIndexByName.set(paths[i]!.name, i)
      }
    }
    palette = { pathColorByIndex, pathIndexByName }
    paletteCache.set(graph, palette)
  }
  return palette
}

// nodeId -> the indices of the paths that visit it, i.e. which stripe slots
// this node fills. Built from the paths themselves rather than read off the
// node, because `GraphNode.samples` collapses a sample's haplotypes together
// and the legend does not.
const slotsCache = new WeakMap<Graph, Map<string, number[]>>()
const NO_SLOTS: ReadonlyMap<string, number[]> = new Map()

function pathSlotsOf(graph: Graph): ReadonlyMap<string, number[]> {
  let slots = slotsCache.get(graph)
  if (!slots) {
    slots = new Map()
    for (const [pathIdx, path] of (graph.paths ?? []).entries()) {
      for (const nodeId of new Set(path.nodeIds)) {
        const visits = slots.get(nodeId)
        if (visits) {
          visits.push(pathIdx)
        } else {
          slots.set(nodeId, [pathIdx])
        }
      }
    }
    slotsCache.set(graph, slots)
  }
  return slots
}

export function buildGeometry(options: BuildOptions): RenderBatch {
  const {
    nodePositions,
    graph,
    nodeById,
    colorScheme,
    contigThickness,
    connectorThickness,
    drawPaths,
    nodeWidth = 'uniform',
    highlight,
    axis,
    linearLayout,
    viewportBounds,
    referenceRamp,
    deletions,
    hiddenEdges,
    version = 0,
  } = options
  const depthNorm = nodeWidth === 'depth' ? meanDepth(graph) : 0
  const scale = axis.scaleX
  const yToX = yToXOf(axis)
  // The offset-zero curve of every edge, from the one place that derives it —
  // shared with the hit index, which draws its boxes from the same objects.
  const sharedCurves = baseEdgeCurves(
    nodePositions,
    graph,
    axis,
    deletions,
    version,
  )

  const nodeStrokes: NodeStroke[] = []
  const nodeStrokeRuns = new Map<string, Run>()
  const arrows: Arrowhead[] = []
  const arrowRuns = new Map<number, Run>()
  const edgeCurves: EdgeCurveBatch[] = []
  const edgeCurveRuns = new Map<number, Run>()

  const colorRange = { ...computeColorSchemeRange(graph), referenceRamp }

  const nodeIndexMap = new Map<string, number>()
  if (colorScheme === 'rainbow') {
    for (let i = 0; i < graph.nodes.length; i++) {
      nodeIndexMap.set(graph.nodes[i]!.id, i)
    }
  }

  const pathCount = graph.paths?.length ?? 0
  const { pathColorByIndex, pathIndexByName } = pathPaletteOf(graph)
  const pathColorByName = (name: string) =>
    pathColorByIndex[pathIndexByName.get(name) ?? -1] ??
    EDGE_PATH_FALLBACK_COLOR
  const nodePathSlots =
    drawPaths && pathCount > 1 ? pathSlotsOf(graph) : NO_SLOTS

  // An arrowhead at every joint of a few hundred short nodes is a serration
  // along the whole drawing, so heads wait for a zoom where a node is longer
  // than its head.
  const showArrows = scale > (linearLayout ? 1 : MIN_ARROW_SCALE)

  for (let ei = 0; ei < graph.edges.length; ei++) {
    const edge = graph.edges[ei]!
    const fromSegments = nodePositions[edge.from]
    const toSegments = nodePositions[edge.to]
    const baseCurves = sharedCurves.get(ei)
    if (
      !fromSegments?.length ||
      !toSegments?.length ||
      !baseCurves ||
      hiddenEdges?.has(ei)
    ) {
      continue
    }

    const numPaths = edge.pathIds?.length ?? 0
    const bypassed = deletions?.get(ei)
    const isDeletion = bypassed !== undefined
    const onWalk = highlight?.edgeIndexes.has(ei) ?? false
    const edgeThickness =
      (connectorThickness / 2) *
      (isDeletion ? DELETION_THICKNESS_FACTOR : 1) *
      (onWalk ? WALK_EDGE_THICKNESS_FACTOR : 1)
    // One stroke per path crossing the edge, fanned off it: the shared curve
    // slid sideways, which is also what the hit index tests against. Rebuilding
    // the curve at each offset was 40% of a striped build and differed from a
    // translation only in a deletion's bow, by the offset's few px.
    const ribbons = drawPaths && numPaths > 0

    // An arrowhead states which way a LINK is read, which is a property of the
    // edge and not of each path crossing it. Drawn per ribbon it says one thing
    // once per haplotype: five stacked heads at a joint, in five colours, for a
    // single fact about a single link. That is the "coloured confetti at each
    // joint" that made `drawPaths` unusable on a force layout, and it reached
    // the anchored layouts too the moment their abutting edges started drawing
    // again. Measured on `ecoli_pggb_subgraph.gfa`: 72 arrowheads plain, 155
    // with ribbons, over 72 links.
    //
    // So one head per edge, in the edge's own colour rather than a ribbon's,
    // since choosing a ribbon's would privilege one haplotype for a fact that
    // belongs to none of them. `undefined` means this call draws no head.
    const plainEdgeColor = isDeletion ? EDGE_DELETION_COLOR : EDGE_DEFAULT_COLOR
    const edgeColor = !highlight
      ? plainEdgeColor
      : onWalk
        ? EDGE_WALK_COLOR
        : fadeAbgr(plainEdgeColor, FADED_ALPHA)
    const buildSingleEdge = (
      offsetX: number,
      offsetY: number,
      color: number,
      arrowColor: number | undefined,
    ) => {
      const curves =
        offsetX === 0 && offsetY === 0
          ? baseCurves
          : translateCurves(baseCurves, offsetX, offsetY)

      if (viewportBounds && !isBezierInBounds(curves, viewportBounds)) {
        return
      }

      // A deletion is drawn dashed, and that is the only thing in the drawing
      // that is. Weight and darkness were carrying it alone, and they could not:
      // an off-reference node is charcoal rgb(60,65,72) and the arc is near-black
      // rgb(24,24,28), which is ~25 points a channel apart, so in a figure the
      // two dark strokes read as the same ink and the arc is the rarer of them
      // (measured on `pangenome/hprc_lpa_kiv2`: 7,411 px of charcoal node against
      // ~5,000 px of arc). Hue cannot separate them either, since hue means
      // reference position and charcoal means having none. A broken line is
      // available, unused, and says what it draws: sequence that is not there.
      if (isDeletion) {
        for (const dash of dashCurves(curves, DELETION_DASH_PX / scale)) {
          edgeCurves.push({ curves: dash, thickness: edgeThickness, color })
        }
      } else {
        edgeCurves.push({ curves, thickness: edgeThickness, color })
      }

      if (showArrows && arrowColor !== undefined) {
        const last = curves[curves.length - 1]!
        arrows.push({
          x: last.x1,
          y: last.y1,
          angle: endTangent(last, yToX),
          size: ARROWHEAD_SIZE,
          color: arrowColor,
        })
      }
    }

    const edgeCurveStart = edgeCurves.length
    const arrowStart = arrows.length

    if (!ribbons) {
      buildSingleEdge(0, 0, edgeColor, edgeColor)
    } else {
      const offsets = pathRibbonOffsets(
        fromSegments,
        toSegments,
        numPaths,
        axis,
      )
      // The middle ribbon carries the head, which at an odd path count is the
      // one drawn at offset 0, i.e. on the edge's own line. At an even count it
      // is half a spacing off, which beats a sixth `computeEdgeCurves` call to
      // rebuild a curve the fan is already centred on.
      const arrowRibbon = Math.floor((numPaths - 1) / 2)
      for (let pathIdx = 0; pathIdx < numPaths; pathIdx++) {
        const offset = offsets[pathIdx]!
        const ribbonColor = pathColorByName(edge.pathIds![pathIdx]!)
        buildSingleEdge(
          offset.x,
          offset.y,
          highlight && edge.pathIds![pathIdx] !== highlight.name
            ? fadeAbgr(ribbonColor, FADED_ALPHA)
            : ribbonColor,
          pathIdx === arrowRibbon ? edgeColor : undefined,
        )
      }
    }

    const edgeCurveCount = edgeCurves.length - edgeCurveStart
    if (edgeCurveCount > 0) {
      edgeCurveRuns.set(ei, { start: edgeCurveStart, count: edgeCurveCount })
    }
    const arrowCount = arrows.length - arrowStart
    if (arrowCount > 0) {
      arrowRuns.set(ei, { start: arrowStart, count: arrowCount })
    }
  }

  for (const [nodeId, segments] of Object.entries(nodePositions)) {
    const node = nodeById.get(nodeId)
    if (!node) {
      continue
    }

    if (viewportBounds && !isPolylineInBounds(segments, viewportBounds)) {
      continue
    }

    const own = getNodeColor(
      node,
      nodeIndexMap.get(nodeId) ?? 0,
      colorScheme,
      colorRange,
    )
    const faded = highlight !== undefined && !highlight.nodeIds.has(nodeId)
    const color = faded ? fadeAbgr(own, FADED_ALPHA) : own
    const width = nodeWidthPx(node, contigThickness, nodeWidth, depthNorm)
    const nodeThickness = width / 2

    const start = nodeStrokes.length
    // The node's drawn width is the same either way: the stripes divide it
    // rather than inflate it, so turning paths on does not re-weight the
    // drawing against the edges and the layout underneath it.
    //
    // A thickness is SCREEN px and a point is world units. So the slot width is
    // screen px and the sideways shift that places a stripe has to be taken
    // back into world units, or the stripes fan apart as you zoom in and
    // collapse into one as you zoom out.
    const slots = nodePathSlots.get(nodeId)
    const slotWidth = width / pathCount
    const drawable = segments.length >= 2
    if (drawable && slots?.length && slotWidth >= MIN_PATH_STRIPE_PX) {
      const normals = pointNormalsOf(segments, yToX)
      const worldPerScreenPx = 1 / Math.max(scale, MIN_SCALE_FOR_OFFSET)
      for (const slot of slots) {
        const offset =
          (slot - (pathCount - 1) / 2) * slotWidth * worldPerScreenPx
        const stripe = pathColorByIndex[slot] ?? EDGE_PATH_FALLBACK_COLOR
        nodeStrokes.push({
          points: offsetPolyline(segments, normals, offset, yToX),
          thickness: slotWidth / 2,
          // a node off the lifted walk fades whichever way it is painted
          color: faded ? fadeAbgr(stripe, FADED_ALPHA) : stripe,
        })
      }
    } else if (drawable) {
      nodeStrokes.push({ points: segments, thickness: nodeThickness, color })
    }
    const count = nodeStrokes.length - start
    if (count > 0) {
      nodeStrokeRuns.set(nodeId, { start, count })
    }
  }

  return {
    nodeStrokes,
    nodeStrokeRuns,
    arrows,
    arrowRuns,
    edgeCurves,
    edgeCurveRuns,
  }
}
