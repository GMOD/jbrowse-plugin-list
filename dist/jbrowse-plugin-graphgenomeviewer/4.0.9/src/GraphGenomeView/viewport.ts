import { clampZoom } from './pipeline'

import type { Bounds } from './pipeline'
import type { AxisScale } from './util/geometry'

// The pan and zoom arithmetic a pane runs, in layout units, with no host in it.

export interface PaneTransform {
  scale: number
  translateX: number
  translateY: number
}

// The zoom as a pair of axis scales. `pixelRows` rides along rather than being
// derived downstream: the deletion bow is capped in a row layout and not in
// the isotropic one, and `scaleY !== scaleX` coincides at one zoom level.
export function axisScaleOf(scale: number, pixelRows: boolean): AxisScale {
  return { scaleX: scale, scaleY: pixelRows ? 1 : scale, pixelRows }
}

// What a pane of `width` x `height` css px shows, in layout units.
export function viewportOf(
  t: { translateX: number; translateY: number },
  axis: AxisScale,
  width: number,
  height: number,
): Bounds {
  return {
    minX: -t.translateX / axis.scaleX,
    minY: -t.translateY / axis.scaleY,
    maxX: (width - t.translateX) / axis.scaleX,
    maxY: (height - t.translateY) / axis.scaleY,
  }
}

// The window a geometry build covers: the pane plus `panes` whole panes on
// every side, so an ordinary pan never blanks its margins for the debounce and
// never rebuilds at all.
export function padded(v: Bounds, panes: number): Bounds {
  const w = (v.maxX - v.minX) * panes
  const h = (v.maxY - v.minY) * panes
  return {
    minX: v.minX - w,
    minY: v.minY - h,
    maxX: v.maxX + w,
    maxY: v.maxY + h,
  }
}

export function contains(outer: Bounds, inner: Bounds) {
  return (
    inner.minX >= outer.minX &&
    inner.maxX <= outer.maxX &&
    inner.minY >= outer.minY &&
    inner.maxY <= outer.maxY
  )
}

// Zoom by `factor` about a screen point. y only follows when it is on the same
// scale: a row layout's y is screen px, so moving it by the ratio would slide
// the rows off under the cursor while their pitch stayed put.
export function zoomAbout(
  t: PaneTransform,
  factor: number,
  centerX: number,
  centerY: number,
  pixelRows: boolean,
): PaneTransform {
  const scale = clampZoom(t.scale * factor)
  const ratio = scale / t.scale
  return {
    scale,
    translateX: centerX - (centerX - t.translateX) * ratio,
    translateY: pixelRows
      ? t.translateY
      : centerY - (centerY - t.translateY) * ratio,
  }
}

// Where a screen point falls in layout units.
export function screenToLayout(
  x: number,
  y: number,
  t: { translateX: number; translateY: number },
  axis: AxisScale,
) {
  return {
    x: (x - t.translateX) / axis.scaleX,
    y: (y - t.translateY) / axis.scaleY,
  }
}
