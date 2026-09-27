// Every label drawn over the graph claims a box in screen px from one
// occupancy, so a label that would land on one already placed, or off the pane,
// is dropped whichever overlay it belongs to. Callers take in priority order.
// A chip is drawn whole or not at all.

export interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}

export const LABEL_PX = 11
export const LABEL_CHAR_PX = 6.2
export const LABEL_PAD = 4

export interface LabelCandidate<T> {
  item: T
  x: number
  y: number
  text: string
  // how many rows down to try when the spot is taken, for a label that is
  // worth a column beside its neighbours rather than dropping
  stack?: number
}

export interface PlacedLabel<T> extends LabelCandidate<T> {
  w: number
}

export type TakeBox = (box: Box) => boolean

export function labelWidth(text: string) {
  return text.length * LABEL_CHAR_PX + LABEL_PAD * 2
}

export function overlaps(a: Box, b: Box) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0
}

interface Frame {
  width: number
  height: number
}

function offFrame(box: Box, frame: Frame) {
  return (
    box.x1 <= 0 ||
    box.x0 >= frame.width ||
    box.y1 <= 0 ||
    box.y0 >= frame.height
  )
}

function insideFrame(box: Box, frame: Frame) {
  return (
    box.x0 >= 0 &&
    box.x1 <= frame.width &&
    box.y0 >= 0 &&
    box.y1 <= frame.height
  )
}

export function occupancy(frame: Frame, reserved: Box[] = []): TakeBox {
  const placed = [...reserved]
  return box => {
    if (offFrame(box, frame) || placed.some(p => overlaps(p, box))) {
      return false
    }
    placed.push(box)
    return true
  }
}

export function placeLabels<T>(
  candidates: LabelCandidate<T>[],
  frame: Frame,
  take: TakeBox,
): PlacedLabel<T>[] {
  const out: PlacedLabel<T>[] = []
  const row = LABEL_PX + LABEL_PAD * 2
  for (const c of candidates) {
    const w = labelWidth(c.text)
    // a stack grows away from the nearer edge of the pane
    const direction = c.y > frame.height / 2 ? -1 : 1
    for (let tries = 0; tries <= (c.stack ?? 0); tries++) {
      const y = c.y + direction * tries * row
      const box = {
        x0: c.x - w / 2,
        x1: c.x + w / 2,
        y0: y - LABEL_PX - LABEL_PAD,
        y1: y + LABEL_PAD,
      }
      if (offFrame(box, frame)) {
        break
      }
      if (insideFrame(box, frame) && take(box)) {
        out.push({ ...c, y, w })
        break
      }
    }
  }
  return out
}
