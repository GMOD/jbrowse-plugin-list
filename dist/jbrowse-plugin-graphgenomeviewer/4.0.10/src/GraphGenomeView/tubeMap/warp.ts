import type { TubeMapColumn } from '../layout/tubeMapLayout'

// Tube x to screen x under the reference axis. A column covers the screen span
// of the reference bp its backbone node covers, which puts the tubes under the
// linear view's other tracks. But the tube map changes lanes BETWEEN columns,
// and adjacent reference nodes abut in bp, so the curves would have no width
// at all. At each boundary the gap the tube map drew (its curves, and any
// columns of inserted sequence, which cover no reference) gets its tube px
// back, up to MAX_GAP_PX, where there is room: first from reference no
// column covers, then from up to half of each neighbouring column. Zoomed in that is a
// few px off a wide node; zoomed out the columns are thin, the gap gets what
// they can spare and the curves steepen.
//
// Piecewise linear, so a curve's bezier, which lies inside one gap, maps
// exactly by mapping its control points.

export interface Knot {
  tx: number
  sx: number
}

// The most screen a boundary claims. The tube map spaces its columns to keep
// the lane changes shallow, which with many haplotypes is hundreds of px a
// gap; on the reference axis the curves steepen instead.
const MAX_GAP_PX = 24

const isReal = (c: TubeMapColumn) => c.bp1 > c.bp0

export function referenceKnots(
  columns: readonly TubeMapColumn[],
  bpToScreen: (bp: number) => number,
): Knot[] {
  const real = columns.filter(isReal)
  if (real.length === 0) {
    const first = columns[0]
    return first ? [{ tx: first.x0, sx: bpToScreen(first.bp0) }] : []
  }
  const screen = real.map(c => ({
    c,
    s0: bpToScreen(c.bp0),
    s1: bpToScreen(c.bp1),
    trimLeft: 0,
    trimRight: 0,
  }))
  for (let i = 0; i + 1 < screen.length; i++) {
    const left = screen[i]!
    const right = screen[i + 1]!
    const demand = Math.min(right.c.x0 - left.c.x1, MAX_GAP_PX)
    const short = demand - (right.s0 - left.s1)
    if (short > 0) {
      const capLeft = (left.s1 - left.s0) / 2
      const capRight = (right.s1 - right.s0) / 2
      let fromLeft = Math.min(short / 2, capLeft)
      const fromRight = Math.min(short - fromLeft, capRight)
      fromLeft = Math.min(short - fromRight, capLeft)
      left.trimRight = fromLeft
      right.trimLeft = fromRight
    }
  }
  const knots: Knot[] = []
  for (const { c, s0, s1, trimLeft, trimRight } of screen) {
    knots.push(
      { tx: c.x0, sx: s0 + trimLeft },
      { tx: c.x1, sx: s1 - trimRight },
    )
  }
  return knots
}

// Beyond the first and last knot the drawing continues at one screen px per
// tube px, which is where the track stubs past the end nodes go.
export function warpX(knots: readonly Knot[], tx: number) {
  const n = knots.length
  if (n === 0) {
    return tx
  }
  const first = knots[0]!
  const last = knots[n - 1]!
  if (tx <= first.tx) {
    return first.sx + (tx - first.tx)
  }
  if (tx >= last.tx) {
    return last.sx + (tx - last.tx)
  }
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (knots[mid]!.tx <= tx) {
      lo = mid
    } else {
      hi = mid
    }
  }
  const a = knots[lo]!
  const b = knots[hi]!
  const span = b.tx - a.tx
  return span > 0 ? a.sx + ((tx - a.tx) / span) * (b.sx - a.sx) : a.sx
}
