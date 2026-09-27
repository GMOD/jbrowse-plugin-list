const ZOOM_PER_NOTCH = 1.1
const NOTCH_PX = 100
const LINE_PX = 40
const PAGE_PX = 800
const PINCH_GAIN = 10
const MAX_NOTCHES_PER_EVENT = 2

// Zoom by how far the wheel moved rather than by one step per event. A mouse
// sends one event of about NOTCH_PX per notch and still zooms ZOOM_PER_NOTCH;
// a trackpad sends sixty small ones a second, which at a step each compounded
// to hundreds of times per second. A pinch arrives as ctrl+wheel with deltas a
// tenth the size. The delta is normalized here rather than with core's
// normalizeWheelDelta, which a released host may not export.
export function wheelZoomFactor(e: {
  deltaY: number
  deltaMode: number
  ctrlKey: boolean
}) {
  const px =
    e.deltaY * (e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? PAGE_PX : 1)
  const notches = ((e.ctrlKey ? PINCH_GAIN : 1) * px) / NOTCH_PX
  return (
    ZOOM_PER_NOTCH **
    -Math.max(-MAX_NOTCHES_PER_EVENT, Math.min(MAX_NOTCHES_PER_EVENT, notches))
  )
}
