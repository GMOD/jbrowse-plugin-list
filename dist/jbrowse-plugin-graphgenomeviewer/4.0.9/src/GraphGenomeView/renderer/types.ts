import type { BezierCurve } from '../util/geometry'

// Everything the renderer draws is a stroke or a triangle stated in layout
// units plus a screen-px weight, and the renderer projects it at draw time.
// Nodes used to arrive as a triangle mesh with per-vertex normals, built for a
// GPU backend that was never wired; stroking the polyline instead is 20-40x
// faster on Canvas2D and needs no mesh at all (agent-docs/GRAPH_SCALE_AND_LOD.md).

// One stroke per edge, or one per path crossing it when drawPaths is on.
export interface EdgeCurveBatch {
  curves: BezierCurve[]
  // half-width in css px
  thickness: number
  color: number
}

// A node's polyline, or one lengthwise stripe of it under drawPaths.
export interface NodeStroke {
  points: { x: number; y: number }[]
  // half-width in css px
  thickness: number
  color: number
}

// One head per edge, at the edge's end, pointing along its tangent. `size` is
// its half-extent in css px, so a head is the same size at every zoom.
export interface Arrowhead {
  x: number
  y: number
  angle: number
  size: number
  color: number
}

// A contiguous run of one batch array.
export interface Run {
  start: number
  count: number
}

export interface RenderBatch {
  nodeStrokes: NodeStroke[]
  // node id -> its run of `nodeStrokes`
  nodeStrokeRuns: Map<string, Run>
  arrows: Arrowhead[]
  // graph edge index -> its run of `arrows`
  arrowRuns: Map<number, Run>
  edgeCurves: EdgeCurveBatch[]
  // graph edge index -> its run of `edgeCurves`, so a renderer can find the
  // strokes belonging to one edge without re-deriving the path fan-out
  edgeCurveRuns: Map<number, Run>
}

export interface TransformUniform {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
  // Backing-store pixels per css pixel, from render-core's `getDpr()`. Every
  // other field here is already multiplied by it, because a position goes
  // through the transform; a THICKNESS does not, so the renderer applies the
  // ratio to every stroke weight itself. render-core's own marks carry the
  // same quantity as a `devicePixelRatio` shader uniform, for the same reason.
  //
  // Required rather than defaulted: a caller that omits it draws a picture that
  // is right on one class of display and wrong on the other, and reports
  // nothing either way. Every screen-metric constant in the geometry builder is
  // quoted in css px — the dash period, the path-stripe floor, the arrowhead,
  // both thicknesses.
  dpr: number
}

export interface Renderer {
  resize(width: number, height: number): void
  uploadGeometry(batch: RenderBatch): void
  // Highlights are draw-time colour overrides, absolute rather than
  // incremental: each call states the whole set, so nothing has to be restored
  // and nothing goes stale when a rebuild renumbers the batch.
  setNodeHighlights(factors: ReadonlyMap<string, number>): void
  setEdgeHighlight(edgeIndex: number | null, factor: number): void
  updateTransform(transform: TransformUniform): void
  render(clearColor: [number, number, number, number]): void
  dispose(): void
}
