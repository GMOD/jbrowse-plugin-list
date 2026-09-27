import { ROW_HEIGHT_PX } from '../layout/rowSpacing'

import type { NodeSegment } from '../types'

// An SVG path along a polyline, rounded to two decimals.
export function svgPath(points: NodeSegment[]) {
  const round = (v: number) => Math.round(v * 100) / 100
  return points
    .map((p, i) => `${i ? 'L' : 'M'}${round(p.x)},${round(p.y)}`)
    .join('')
}

export function projectLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  distance: number,
): [number, number] {
  const d = Math.hypot(y2 - y1, x2 - x1)
  if (d === 0) {
    return [x2, y2]
  }
  const vx = (x2 - x1) / d
  const vy = (y2 - y1) / d
  return [x2 + distance * vx, y2 + distance * vy]
}

export interface BezierCurve {
  x0: number
  y0: number
  cx0: number
  cy0: number
  cx1: number
  cy1: number
  x1: number
  y1: number
}

// The cubic's own point at t, by de Casteljau. Used to place a label ON a curve
// rather than at a position derived from what the curve was supposed to be: an
// apex recomputed from the bulge and the endpoints agrees with the drawing only
// as long as both derive it the same way, and they did not.
export function curvePointAt(c: BezierCurve, t: number) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const d = 3 * u * t * t
  const e = t * t * t
  return {
    x: a * c.x0 + b * c.cx0 + d * c.cx1 + e * c.x1,
    y: a * c.y0 + b * c.cy0 + d * c.cy1 + e * c.y1,
  }
}

// Halfway along a run of curves, measured in curves rather than in arc length: a
// run is one cubic for every edge this is used on (computeEdgeCurves returns a
// single curve except for self-loops), so the two agree where it matters and the
// cheap version cannot be wrong by more than a curve.
export function curveMidpoint(curves: BezierCurve[]) {
  const mid = curves[Math.floor(curves.length / 2)]
  return mid ? curvePointAt(mid, 0.5) : undefined
}

// Control-polygon bounds, which contain the curve. Used to ask how big a drawn
// edge is on screen, where the answer has to hold under any layout: a bulge
// alone is in whatever units the layout works in.
export function curveBounds(curves: BezierCurve[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const c of curves) {
    minX = Math.min(minX, c.x0, c.cx0, c.cx1, c.x1)
    maxX = Math.max(maxX, c.x0, c.cx0, c.cx1, c.x1)
    minY = Math.min(minY, c.y0, c.cy0, c.cy1, c.y1)
    maxY = Math.max(maxY, c.y0, c.cy0, c.cy1, c.y1)
  }
  return { minX, minY, maxX, maxY }
}

// The sub-curve over [t0, t1], exact rather than sampled: de Casteljau twice,
// which is what keeps a dashed curve on the same path as the solid one.
function subCurve(c: BezierCurve, t0: number, t1: number): BezierCurve {
  const p0 = curvePointAt(c, t0)
  const p1 = curvePointAt(c, t1)
  // The Hermite tangents of the whole cubic at t0/t1, scaled by the sub-span,
  // are the sub-curve's control-point offsets.
  const dt = (t1 - t0) / 3
  const d0 = curveTangentAt(c, t0)
  const d1 = curveTangentAt(c, t1)
  return {
    x0: p0.x,
    y0: p0.y,
    cx0: p0.x + d0.x * dt,
    cy0: p0.y + d0.y * dt,
    cx1: p1.x - d1.x * dt,
    cy1: p1.y - d1.y * dt,
    x1: p1.x,
    y1: p1.y,
  }
}

function curveTangentAt(c: BezierCurve, t: number) {
  const u = 1 - t
  const a = 3 * u * u
  const b = 6 * u * t
  const d = 3 * t * t
  return {
    x: a * (c.cx0 - c.x0) + b * (c.cx1 - c.cx0) + d * (c.x1 - c.cx1),
    y: a * (c.cy0 - c.y0) + b * (c.cy1 - c.cy0) + d * (c.y1 - c.cy1),
  }
}

// A curve chopped into dashes, each its own run so a renderer strokes them as
// separate paths. Dashing is geometry here rather than a stroke style because
// the two backends do not share one: Canvas2D has setLineDash, a GPU backend
// tessellating these curves does not, and a dash pattern that only exists in one
// of them is a figure that changes with the renderer.
//
// `dashWorld` is the period in layout units, so a caller passing screen px over
// the current scale gets dashes of a constant on-screen size.
export function dashCurves(
  curves: BezierCurve[],
  dashWorld: number,
): BezierCurve[][] {
  const out: BezierCurve[][] = []
  for (const c of curves) {
    // Control-polygon length overestimates the arc, which errs toward more
    // dashes rather than toward a curve that reads as solid.
    const polyLen =
      Math.hypot(c.cx0 - c.x0, c.cy0 - c.y0) +
      Math.hypot(c.cx1 - c.cx0, c.cy1 - c.cy0) +
      Math.hypot(c.x1 - c.cx1, c.y1 - c.cy1)
    // Odd, so a dash sits at each end of the curve and the arc reads as
    // attached to both nodes rather than floating between them.
    const spans = Math.max(3, Math.round(polyLen / dashWorld) | 1)
    for (let i = 0; i < spans; i += 2) {
      out.push([subCurve(c, i / spans, (i + 1) / spans)])
    }
  }
  return out
}

export function translateCurves(
  curves: BezierCurve[],
  dx: number,
  dy: number,
): BezierCurve[] {
  const out: BezierCurve[] = new Array(curves.length)
  for (let i = 0; i < curves.length; i++) {
    const c = curves[i]!
    out[i] = {
      x0: c.x0 + dx,
      y0: c.y0 + dy,
      cx0: c.cx0 + dx,
      cy0: c.cy0 + dy,
      cx1: c.cx1 + dx,
      cy1: c.cy1 + dy,
      x1: c.x1 + dx,
      y1: c.y1 + dy,
    }
  }
  return out
}

type Side = 'start' | 'end'

// The attachment point, and the point just inside the node from it — which is
// what gives the outward tangent, so a curve leaves along the node it leaves
// rather than straight at its partner.
function attachment(segments: NodeSegment[], side: Side) {
  const last = segments.length - 1
  return side === 'end'
    ? { at: segments[last]!, inward: segments[last - 1] }
    : { at: segments[0]!, inward: segments[1] }
}

// Ceilings on how far a control point runs along its own node's direction: a
// fraction of the separation the curve has to cover, so endpoints that nearly
// touch cannot fold the cubic back over itself, and an absolute cap so a
// graph-wide edge does not sprout a huge hook.
const TANGENT_SPAN_FACTOR = 0.5
const MAX_TANGENT = 80

// Which drawn end of each node the edge joins.
//
// A link states the orientation it reads each segment in, but a node is drawn
// in whatever direction its layout placed it — reference-forward on the
// anchored rows, run-sweep order off them, arbitrary under FMMM — and nothing
// records that direction, so the strands cannot be turned into drawn ends. What
// the drawing itself says is which ends face each other, so that is what is
// read: each node attaches at whichever of its two ends is nearer the OTHER
// node's drawn span, with the forward reading (leave the from-node's end, enter
// the to-node's start) winning a tie.
//
// Nearer to the span, not to the other attachment point. A bubble's two nodes
// usually overlap in x, and there the distances to a point differ by a hair
// that says nothing — enough to hang a node's entry and exit edges off the same
// end, which draws them crossed. Overlapping spans give both ends distance 0,
// i.e. a tie, and the tie is what keeps such a bubble forward. What survives is
// the case the rule is for: `L s381 - s2087 +` then `L s2087 + s378 -` is
// NCTC86 crossing its locus right to left, and joining last-point to
// first-point regardless drew the second link 7 kb backwards across the segment
// it rejoins — the long X in pangenome/rgfa_subgraph_launch. There the spans do
// not overlap and the far end loses by 7 kb. Pinned by bubbleCrossing.test.ts.
function spanOf(segments: NodeSegment[]) {
  let min = Infinity
  let max = -Infinity
  for (const s of segments) {
    min = Math.min(min, s.x)
    max = Math.max(max, s.x)
  }
  return { min, max }
}

function distanceToSpan(x: number, span: { min: number; max: number }) {
  return Math.max(0, span.min - x, x - span.max)
}

function facingSide(
  segments: NodeSegment[],
  other: { min: number; max: number },
  tieBreak: Side,
): Side {
  const startGap = distanceToSpan(segments[0]!.x, other)
  const endGap = distanceToSpan(segments[segments.length - 1]!.x, other)
  return startGap === endGap ? tieBreak : startGap < endGap ? 'start' : 'end'
}

function facingSides(fromSegments: NodeSegment[], toSegments: NodeSegment[]) {
  return {
    from: facingSide(fromSegments, spanOf(toSegments), 'end'),
    to: facingSide(toSegments, spanOf(fromSegments), 'start'),
  }
}

// A cubic whose two control points both sit `b` off the chord reaches 3b/4 at
// its midpoint: (P0 + 3C0 + 3C1 + P1)/8 with the endpoints on the chord.
const APEX_FRACTION = 0.75
// How far past the run the apex goes, so the arc reads as passing AROUND the
// reference it skips rather than through it.
const BOW_CLEARANCE = 1.15

// How far, and which way, to bow an arc so that it encloses the run of nodes it
// bypasses -- the deletion case. Both come from where that run actually lies
// relative to this edge's own chord, which is the only thing that can answer
// either question.
//
// It used to be a magnitude alone, `0.35 * the summed drawn length of the
// bypassed nodes`, bowed to a hardcoded side. Both halves were wrong, and the
// amylase 94.2 kb arc showed each: summed path length is not spatial reach, so a
// chain that snakes (as an FMMM chain does) sizes an arc far past where its own
// nodes are; and the fixed sign is a coin flip on which side those nodes fell.
// Measured on that figure, the bypassed run reached 739 units to one side of a
// 16-unit chord while the arc bowed 719 units to the other -- a balloon in empty
// space, enclosing nothing, beside the run it was supposed to name. The two arcs
// in the same figure that read correctly were the two whose runs happened to
// fall on the hardcoded side.
//
// Sign comes from the FARTHEST point rather than the mean, because the arc has
// to clear the whole run, not most of it.
//
// The magnitude needs two terms, and the perpendicular one alone is not enough:
// in an anchored layout the backbone is a straight line, so a bypassed run lies
// exactly ON the chord, reaches nowhere off it, and an arc sized by clearance
// alone collapses back into the stub at a joint this exists to prevent. That is
// every anchored figure, and it is what the unit tests caught. So the run's
// extent ALONG the chord carries the collinear case, at the same 0.35 the old
// rule used, which is what keeps those figures where they are; clearance takes
// over exactly when the run has gone somewhere the arc would otherwise miss.
const ALONG_FRACTION = 0.35
// The most bow a deletion gets in a ROW layout, in screen px, which is what y
// already is there.
//
// A cap rather than a smaller fraction, because the fraction is the part that is
// wrong: `span * ALONG_FRACTION` scales the bow with the amount of reference
// skipped, and in a row layout the arc's own SPAN states that exactly — its two
// feet are the deletion's two coordinates on the backbone — while the label
// prints it in bp. So the bow carries no information there, and letting it grow
// with the event turns a big deletion into a loop enclosing a dozen unrelated
// nodes and edges while a small one stays the flat tie under the backbone that
// reads correctly. Reported as "the dashed lines frankly look weird for the
// 'deletion'" on `pangenome/hprc_cfhr_deletion`, whose 84.7 kb arc dived 5.5
// rows into the rank rows while its 28.6 kb and 11.2 kb neighbours sat just
// under the reference row: four deletions in one frame, drawn as four different
// kinds of mark.
//
// Three rows: enough to clear the reference row's own tube and to read as an arc
// across several hundred px of backbone, not enough to reach the second rank
// row. The isotropic layout is NOT capped — there the run the arc bows around is
// scattered rather than collinear, so the bow is what makes the bubble's two
// arms comparable, which is the clearance term's whole job.
const MAX_ROW_BOW_PX = 3 * ROW_HEIGHT_PX

export function bowAround(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  toward: NodeSegment[],
  // Ceiling on the returned magnitude, in the units this function is working in.
  // Undefined leaves the bow uncapped; see MAX_ROW_BOW_PX.
  maxBow?: number,
) {
  const chord = Math.hypot(p2x - p1x, p2y - p1y)
  const ux = chord === 0 ? 1 : (p2x - p1x) / chord
  const uy = chord === 0 ? 0 : (p2y - p1y) / chord
  let reach = 0
  let minAlong = Infinity
  let maxAlong = -Infinity
  for (const p of toward) {
    const dx = p.x - p1x
    const dy = p.y - p1y
    const perp = dx * -uy + dy * ux
    if (Math.abs(perp) > Math.abs(reach)) {
      reach = perp
    }
    const along = dx * ux + dy * uy
    minAlong = Math.min(minAlong, along)
    maxAlong = Math.max(maxAlong, along)
  }
  const span = toward.length ? maxAlong - minAlong : 0
  const uncapped = Math.max(
    (Math.abs(reach) * BOW_CLEARANCE) / APEX_FRACTION,
    span * ALONG_FRACTION,
  )
  const size = maxBow === undefined ? uncapped : Math.min(uncapped, maxBow)
  // A run that sits on the chord has no side of its own; the arc keeps the one
  // it has always taken there, so a collinear layout draws exactly as before.
  return reach < 0 ? -size : size
}

// How the drawing maps layout units to screen pixels, both axes together.
//
// **One object rather than two arguments, and that is the point of it.** Every
// measurement in this file — a chord length, a tangent projection, a bow — mixes
// x and y in one `hypot`, so it needs both. On a row layout they differ: x is
// reference bp and y is a row pitch in screen px (LayoutResult.pixelRows), and
// the same drop of 20 is a fifth of a pane one way and twenty bases the other.
// Passing them separately meant a caller could pass one and default the other,
// which compiles, draws a wrong picture, and reports nothing. Three callers
// build these curves — the drawing, the hit index, and the label that rides them
// — and they have to agree; a pair that cannot be half-passed is what makes that
// structural instead of remembered.
//
// The two numbers are the model's own `scaleX`/`scaleY`, handed over unchanged
// rather than pre-divided, so nothing downstream can combine an x scale from one
// moment with a y scale from another.
export interface AxisScale {
  scaleX: number
  scaleY: number
  // Whether the layout's y is already SCREEN PIXELS — true for the two row
  // layouts, false for the isotropic simulation (see rowSpacing.ts and the
  // model's axisScaleOf). It rides here rather than being threaded to each
  // caller because the three functions that build a deletion's curve — the
  // drawing, the hit index and the label that rides it — all take an `axis` and
  // all three have to agree about the bow; a fourth parameter only some of them
  // passed is how a label and its arc end up in different corners of the
  // drawing, which has happened here before.
  //
  // NOT derivable as `scaleY !== scaleX`: on a row layout scaleY is pinned to 1
  // and scaleX is the zoom, so the two coincide at one zoom level and anything
  // keyed on the difference would silently stop applying there.
  pixelRows?: boolean
}

// y in x units: what makes the two axes comparable. 1 on an isotropic layout
// (FMMM), where every number below is exactly what it was.
export function yToXOf({ scaleX, scaleY }: AxisScale) {
  return scaleY / scaleX
}

// How far apart two adjacent path ribbons run, in world x units.
export const PATH_RIBBON_SPACING = 3

// A polyline's overall direction in DRAWN space, or undefined when it has none.
function drawnDirection(
  a: { x: number; y: number },
  b: { x: number; y: number },
  yToX: number,
) {
  const dx = b.x - a.x
  const dy = (b.y - a.y) * yToX
  const len = Math.hypot(dx, dy)
  return len === 0 ? undefined : { x: dx / len, y: dy / len }
}

// Where each of an edge's path ribbons is drawn, as an offset from the edge
// itself, in world units — the one derivation of it, because three callers need
// the same answer: the geometry that draws the ribbons, the spatial index that
// bounds them and the hit test that measures against them. Two of those already
// held their own copy of these four lines.
//
// The fan runs perpendicular to the edge, and the perpendicular is taken in
// DRAWN space: on a row layout x is bp and y is screen px, so a perpendicular
// taken from the raw coordinates is perpendicular to nothing on screen. `yToX`
// converts before the direction is measured and the y component is converted
// back, the same round trip `pointNormalsOf` makes for a node's own outline. On
// an isotropic layout `yToX` is 1 and this is the arithmetic it always did.
//
// **Two abutting nodes have no chord to be perpendicular to, and in an anchored
// layout that is every backbone link rather than a corner case**: consecutive
// segments meet at exactly one point, so the chord is zero-length. Both callers
// used to give up there, which left the whole backbone chain with no edge
// geometry at all whenever `drawPaths` was on — no curve, no arrowhead, nothing
// to hover — and the abutting nodes hid it. A node's own drawn direction answers
// what the chord cannot, and for a backbone running along x it fans the ribbons
// across the row, which is where they belong.
export function pathRibbonOffsets(
  fromSegments: NodeSegment[],
  toSegments: NodeSegment[],
  count: number,
  axis: AxisScale,
  spacing = PATH_RIBBON_SPACING,
) {
  const yToX = yToXOf(axis)
  const dir = drawnDirection(
    fromSegments[fromSegments.length - 1]!,
    toSegments[0]!,
    yToX,
  ) ??
    drawnDirection(fromSegments[0]!, fromSegments.at(-1)!, yToX) ??
    drawnDirection(toSegments[0]!, toSegments.at(-1)!, yToX) ?? { x: 1, y: 0 }
  const offsets: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const distance = (i - (count - 1) / 2) * spacing
    offsets.push({ x: -dir.y * distance, y: (dir.x * distance) / yToX })
  }
  return offsets
}

function scaleYOf(points: NodeSegment[], yToX: number) {
  return points.map(p => ({ x: p.x, y: p.y * yToX }))
}

function unscaleYOf(curves: BezierCurve[], yToX: number) {
  for (const c of curves) {
    c.y0 /= yToX
    c.cy0 /= yToX
    c.cy1 /= yToX
    c.y1 /= yToX
  }
  return curves
}

export function computeEdgeCurves(
  fromSegments: NodeSegment[],
  toSegments: NodeSegment[],
  isSelfLoop: boolean,
  offsetX: number,
  offsetY: number,
  axis: AxisScale,
  // The nodes this edge bypasses, for a deletion; empty for every other edge.
  // Given them, the curve bows around them.
  //
  // Topologically a deletion is a bubble whose reference arm is a run of long
  // nodes and whose own arm is a bare link, so at the engine's 5-unit edge
  // length it collapses into a stub at a joint and the one event a graph shows
  // better than a linear view is invisible. Bowing it around that run is what
  // makes the two arms comparable, which is what a reader has to see to read it
  // as an alternative route.
  //
  // Taken as nodes rather than as a precomputed number because the chord is
  // needed to turn them into one, and only this function knows the chord -- it
  // picks the attachment ends. Three callers build this curve (the drawing, the
  // hit index and the label that rides it) and a second derivation of it is a
  // second thing to keep in step; that is exactly how the label and the arc once
  // came out in different corners of the drawing.
  bypassed: NodeSegment[] = [],
  // Only the recursion below passes this: the cap belongs to the layout, so it
  // is read off `axis` at the top level and handed down already converted into
  // the isotropic body's units.
  maxBowIn?: number,
): BezierCurve[] {
  const scale = axis.scaleX
  const yToX = yToXOf(axis)
  const maxBow = maxBowIn ?? (axis.pixelRows ? MAX_ROW_BOW_PX : undefined)
  if (yToX !== 1) {
    // Recur once with y already in x units, then put the answer back. The
    // isotropic body below is the only implementation, so an anisotropic
    // drawing cannot drift from the one every force-directed figure uses.
    //
    // It costs three small arrays per edge, which was worth measuring before
    // being clever about: over 8,000 deletion-bearing edges — the top of the
    // range this view draws at all — the whole pass is 1.9 ms isotropic against
    // 2.8 ms here, once per debounced rebuild, against the ~9 ms of geometry the
    // toolbar already reports. Inlining the conversion would buy 0.9 ms and cost
    // the single implementation, so it is not done.
    return unscaleYOf(
      computeEdgeCurves(
        scaleYOf(fromSegments, yToX),
        scaleYOf(toSegments, yToX),
        isSelfLoop,
        offsetX,
        offsetY * yToX,
        { scaleX: scale, scaleY: scale },
        scaleYOf(bypassed, yToX),
        // the cap is a y measure and the body works in x units, so it converts
        // with everything else that crosses this boundary
        maxBow === undefined ? undefined : maxBow * yToX,
      ),
      yToX,
    )
  }
  const sides = isSelfLoop
    ? { from: 'end' as Side, to: 'start' as Side }
    : facingSides(fromSegments, toSegments)
  const fromAttach = attachment(fromSegments, sides.from)
  const toAttach = attachment(toSegments, sides.to)
  const fromEnd = fromAttach.at
  const toStart = toAttach.at

  const p1x = fromEnd.x + offsetX
  const p1y = fromEnd.y + offsetY
  const p2x = toStart.x + offsetX
  const p2y = toStart.y + offsetY

  if (isSelfLoop) {
    let segDirX = 1
    let segDirY = 0
    if (fromAttach.inward) {
      const dx = fromEnd.x - fromAttach.inward.x
      const dy = fromEnd.y - fromAttach.inward.y
      const len = Math.hypot(dx, dy)
      if (len > 0) {
        segDirX = dx / len
        segDirY = dy / len
      }
    }

    const ext = Math.min(50, 50 * scale)
    const perpX = -segDirY
    const perpY = segDirX
    const midX = (fromEnd.x + toStart.x) / 2 + offsetX + perpX * ext
    const midY = (fromEnd.y + toStart.y) / 2 + offsetY + perpY * ext
    const cp1x = p1x + segDirX * ext
    const cp1y = p1y + segDirY * ext
    const cp2x = p2x - segDirX * ext
    const cp2y = p2y - segDirY * ext

    return [
      {
        x0: p1x,
        y0: p1y,
        cx0: cp1x,
        cy0: cp1y,
        cx1: cp1x + perpX * ext,
        cy1: cp1y + perpY * ext,
        x1: midX,
        y1: midY,
      },
      {
        x0: midX,
        y0: midY,
        cx0: cp2x + perpX * ext,
        cy0: cp2y + perpY * ext,
        cx1: cp2x,
        cy1: cp2y,
        x1: p2x,
        y1: p2y,
      },
    ]
  } else {
    // The point just inside each node from where the edge attaches, so
    // projectLine extends OUTWARD from the node. A node drawn as a single point
    // has no direction of its own; mirroring the chord through the attachment
    // leaves it pointing at its partner, i.e. a straight leader.
    const fromPrev = fromAttach.inward ?? {
      x: fromEnd.x - (toStart.x - fromEnd.x),
      y: fromEnd.y - (toStart.y - fromEnd.y),
    }
    const toNext = toAttach.inward ?? {
      x: toStart.x - (fromEnd.x - toStart.x),
      y: toStart.y - (fromEnd.y - toStart.y),
    }

    const dist = Math.hypot(p2x - p1x, p2y - p1y)
    // Each control point leaves along its OWN node's direction, so the tangent
    // extension may only run as far as the other endpoint actually lies in that
    // direction. Sizing it by the whole separation instead cannot work on an
    // anchored layout, where the separation is mostly the row drop: both edges
    // of a bubble then leave sideways and come back, and the pair draws as a
    // crossed bowtie rather than as a bubble (pinned by bubbleCrossing.test.ts,
    // which fails on 17 of the pggb subgraph's alleles under a flat
    // `dist * 0.35`). Projecting the separation onto the tangent is rotation
    // invariant, so a force-directed layout, whose edges do run along their
    // nodes, is unchanged; and it is clamped at 0, so an edge that doubles back
    // gets a straight leader instead of a loop.
    const tangentProj = (
      prev: { x: number; y: number },
      at: { x: number; y: number },
      towardX: number,
      towardY: number,
    ) => {
      const dx = at.x - prev.x
      const dy = at.y - prev.y
      const len = Math.hypot(dx, dy)
      const along = len === 0 ? 0 : (towardX * dx + towardY * dy) / len
      return Math.max(
        0,
        Math.min(dist * TANGENT_SPAN_FACTOR, MAX_TANGENT, along * 0.5),
      )
    }
    const towardToX = toStart.x - fromEnd.x
    const towardToY = toStart.y - fromEnd.y
    const [cx1, cy1] = projectLine(
      fromPrev.x,
      fromPrev.y,
      fromEnd.x,
      fromEnd.y,
      tangentProj(fromPrev, fromEnd, towardToX, towardToY),
    )
    const [cx2, cy2] = projectLine(
      toNext.x,
      toNext.y,
      toStart.x,
      toStart.y,
      tangentProj(toNext, toStart, -towardToX, -towardToY),
    )

    // Perpendicular to the chord, so the bow is symmetric about it, and spread
    // the two control points APART along it. Perpendicular alone draws a hairpin
    // whenever the bulge exceeds the chord — which is the normal case for a
    // deletion, whose endpoints the simulation leaves adjacent however much
    // reference it skips — and a hairpin reads as a stray line rather than as a
    // route. The along-chord spread opens it into an arch.
    //
    // The spread takes the MAGNITUDE, not the signed bulge: it decides how open
    // the arch is, not which way it faces, and letting it flip swaps the two
    // control points past each other and folds the cubic into a cusp.
    const bulge = bypassed.length
      ? bowAround(p1x, p1y, p2x, p2y, bypassed, maxBow)
      : 0
    const chordLen = dist === 0 ? 1 : dist
    const ux = (p2x - p1x) / chordLen
    const uy = (p2y - p1y) / chordLen
    const bulgeX = -uy * bulge
    const bulgeY = ux * bulge
    const spreadX = ux * Math.abs(bulge)
    const spreadY = uy * Math.abs(bulge)

    return [
      {
        x0: p1x,
        y0: p1y,
        cx0: cx1 + offsetX + bulgeX - spreadX,
        cy0: cy1 + offsetY + bulgeY - spreadY,
        cx1: cx2 + offsetX + bulgeX + spreadX,
        cy1: cy2 + offsetY + bulgeY + spreadY,
        x1: p2x,
        y1: p2y,
      },
    ]
  }
}
