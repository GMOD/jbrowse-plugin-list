// How much of the drawing a pan or zoom leaves on screen in each axis, or
// all of it when it is smaller
export const KEEP_IN_VIEW_PX = 48

// The shift that brings a span starting at `lo`, `size` px long, back to
// overlapping [0, extent] by `margin` px
function shiftIntoView(lo: number, size: number, extent: number) {
  const margin = Math.min(KEEP_IN_VIEW_PX, size, extent)
  return Math.max(0, margin - (lo + size)) - Math.max(0, lo - (extent - margin))
}

interface DrawingBox {
  minX: number
  minY: number
  w: number
  h: number
}

interface Placement {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
}

export function keepInView(
  bounds: DrawingBox,
  t: Placement,
  view: { width: number; height: number },
) {
  return {
    translateX:
      t.translateX +
      shiftIntoView(
        bounds.minX * t.scaleX + t.translateX,
        bounds.w * t.scaleX,
        view.width,
      ),
    translateY:
      t.translateY +
      shiftIntoView(
        bounds.minY * t.scaleY + t.translateY,
        bounds.h * t.scaleY,
        view.height,
      ),
  }
}

export function onScreen(
  bounds: DrawingBox,
  t: Placement,
  view: { width: number; height: number },
) {
  const left = bounds.minX * t.scaleX + t.translateX
  const top = bounds.minY * t.scaleY + t.translateY
  return (
    left < view.width &&
    left + bounds.w * t.scaleX > 0 &&
    top < view.height &&
    top + bounds.h * t.scaleY > 0
  )
}
