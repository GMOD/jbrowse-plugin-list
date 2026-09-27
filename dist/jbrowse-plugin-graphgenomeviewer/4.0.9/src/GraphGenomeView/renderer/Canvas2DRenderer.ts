import {
  abgrToCssRgba,
  normalizedRgbToCssRgba,
} from '@jbrowse/core/util/colorBits'
import { syncCanvasSize } from '@jbrowse/render-core/canvas2dUtils'
import { Canvas2DRenderingBackendBase } from '@jbrowse/render-core/renderingBackendBase'

import { brightenAbgr } from './colorBits'

import type { RenderBatch, Renderer, TransformUniform } from './types'

// Everything is drawn as a handful of paths, one per distinct (colour, weight),
// rather than one path per thing. A drawing is mostly runs of one colour, and
// Canvas2D's cost is per path verb and per fill or stroke, not per pixel: the
// same 15k-node graph took 414 ms a frame as one fill per mesh triangle and 11
// ms as batched strokes (agent-docs/GRAPH_SCALE_AND_LOD.md). Highlighted things
// are drawn last, in their own paths, so they sit on top of what they brighten.
//
// Extends the shared Canvas2D base rather than standing alone, which is how
// `setErrorHandler` arrives — `useRenderingBackend` requires it. The base's
// no-op implementation is the correct one here: Canvas2D allocates no GPU
// resources, so there is no OOM channel to forward.
export class Canvas2DRenderer
  extends Canvas2DRenderingBackendBase
  implements Renderer
{
  private transform: TransformUniform | null = null
  private batch: RenderBatch | null = null
  private nodeHighlights: ReadonlyMap<string, number> = new Map()
  private highlightedEdge: number | null = null
  private highlightFactor = 1

  // render-core's, not a local `width * devicePixelRatio`: it clamps the
  // backing store at MAX_CANVAS_DIM_PX, reads the ratio through `getDpr()` so
  // this agrees with the transform the model builds, and writes the css size
  // independently of the backing size.
  resize(width: number, height: number) {
    syncCanvasSize(this.ctx.canvas, width, height)
  }

  uploadGeometry(batch: RenderBatch) {
    this.batch = batch
    // A rebuild renumbers the strokes, so the old edge no longer addresses the
    // same run; the model re-applies the current hover against the new batch.
    this.highlightedEdge = null
  }

  setNodeHighlights(factors: ReadonlyMap<string, number>) {
    this.nodeHighlights = factors
  }

  setEdgeHighlight(edgeIndex: number | null, factor: number) {
    this.highlightedEdge = edgeIndex
    this.highlightFactor = factor
  }

  updateTransform(transform: TransformUniform) {
    this.transform = transform
  }

  render(clearColor: [number, number, number, number]) {
    const t = this.transform
    if (!t) {
      return
    }
    const ctx = this.ctx
    const { width, height } = ctx.canvas

    ctx.fillStyle = normalizedRgbToCssRgba(
      [clearColor[0], clearColor[1], clearColor[2]],
      clearColor[3],
    )
    ctx.fillRect(0, 0, width, height)

    const batch = this.batch
    if (!batch) {
      return
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    this.renderEdges(batch)
    this.renderNodes(batch)
    this.renderArrows(batch)
  }

  private renderEdges(batch: RenderBatch) {
    const t = this.transform!
    const ctx = this.ctx
    const hl =
      this.highlightedEdge === null
        ? undefined
        : batch.edgeCurveRuns.get(this.highlightedEdge)
    for (const { color, items } of groupByPaint(batch.edgeCurves, (e, i) => ({
      color: inRun(hl, i)
        ? brightenAbgr(e.color, this.highlightFactor)
        : e.color,
      weight: e.thickness,
      last: inRun(hl, i),
    }))) {
      ctx.strokeStyle = abgrToCssRgba(color)
      // thickness is the half-width in css px, so the stroke is twice it at
      // the device ratio the transform already carries
      ctx.lineWidth = items[0]!.thickness * 2 * t.dpr
      ctx.beginPath()
      for (const e of items) {
        const first = e.curves[0]!
        ctx.moveTo(
          first.x0 * t.scaleX + t.translateX,
          first.y0 * t.scaleY + t.translateY,
        )
        for (const c of e.curves) {
          ctx.bezierCurveTo(
            c.cx0 * t.scaleX + t.translateX,
            c.cy0 * t.scaleY + t.translateY,
            c.cx1 * t.scaleX + t.translateX,
            c.cy1 * t.scaleY + t.translateY,
            c.x1 * t.scaleX + t.translateX,
            c.y1 * t.scaleY + t.translateY,
          )
        }
      }
      ctx.stroke()
    }
  }

  private renderNodes(batch: RenderBatch) {
    const t = this.transform!
    const ctx = this.ctx
    // stroke index -> brighten factor, for the nodes the model lifted
    const lifted = new Map<number, number>()
    for (const [nodeId, factor] of this.nodeHighlights) {
      const run = batch.nodeStrokeRuns.get(nodeId)
      if (run) {
        for (let i = run.start; i < run.start + run.count; i++) {
          lifted.set(i, factor)
        }
      }
    }
    for (const { color, items } of groupByPaint(batch.nodeStrokes, (s, i) => {
      const factor = lifted.get(i)
      return {
        color: factor === undefined ? s.color : brightenAbgr(s.color, factor),
        weight: s.thickness,
        last: factor !== undefined,
      }
    })) {
      ctx.strokeStyle = abgrToCssRgba(color)
      ctx.lineWidth = items[0]!.thickness * 2 * t.dpr
      ctx.beginPath()
      for (const s of items) {
        const p0 = s.points[0]!
        ctx.moveTo(
          p0.x * t.scaleX + t.translateX,
          p0.y * t.scaleY + t.translateY,
        )
        for (let i = 1, l = s.points.length; i < l; i++) {
          const p = s.points[i]!
          ctx.lineTo(
            p.x * t.scaleX + t.translateX,
            p.y * t.scaleY + t.translateY,
          )
        }
      }
      ctx.stroke()
    }
  }

  private renderArrows(batch: RenderBatch) {
    const t = this.transform!
    const ctx = this.ctx
    const hl =
      this.highlightedEdge === null
        ? undefined
        : batch.arrowRuns.get(this.highlightedEdge)
    for (const { color, items } of groupByPaint(batch.arrows, (a, i) => ({
      color: inRun(hl, i)
        ? brightenAbgr(a.color, this.highlightFactor)
        : a.color,
      weight: 0,
      last: inRun(hl, i),
    }))) {
      ctx.fillStyle = abgrToCssRgba(color)
      ctx.beginPath()
      for (const a of items) {
        // The tip sits on the edge's end; the two barbs are `size` css px back
        // along either side of the tangent, expanded after the transform so
        // the head is the same size at every zoom.
        const tipX = a.x * t.scaleX + t.translateX
        const tipY = a.y * t.scaleY + t.translateY
        const reach = a.size * t.dpr
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(
          tipX - Math.cos(a.angle - 0.5) * reach,
          tipY - Math.sin(a.angle - 0.5) * reach,
        )
        ctx.lineTo(
          tipX - Math.cos(a.angle + 0.5) * reach,
          tipY - Math.sin(a.angle + 0.5) * reach,
        )
        ctx.closePath()
      }
      ctx.fill()
    }
  }

  override dispose() {
    super.dispose()
    this.batch = null
    this.nodeHighlights = new Map()
    this.highlightedEdge = null
  }
}

function inRun(run: { start: number; count: number } | undefined, i: number) {
  return run !== undefined && i >= run.start && i < run.start + run.count
}

interface Paint {
  color: number
  weight: number
  // drawn after everything else, so a highlight lands on top of its neighbours
  last: boolean
}

// Items bucketed by what they are painted with, in first-seen order, with the
// `last` ones after the rest.
function groupByPaint<T>(
  items: T[],
  paintOf: (item: T, index: number) => Paint,
) {
  const groups = new Map<string, { color: number; items: T[] }>()
  const deferred = new Map<string, { color: number; items: T[] }>()
  for (let i = 0, l = items.length; i < l; i++) {
    const item = items[i]!
    const { color, weight, last } = paintOf(item, i)
    const into = last ? deferred : groups
    const key = `${color}:${weight}`
    const group = into.get(key)
    if (group) {
      group.items.push(item)
    } else {
      into.set(key, { color, items: [item] })
    }
  }
  return [...groups.values(), ...deferred.values()]
}
