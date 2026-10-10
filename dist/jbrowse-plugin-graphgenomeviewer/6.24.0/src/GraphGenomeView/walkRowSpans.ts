import {
  GAP_PX,
  coalesceRuns,
  runPaint,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { spanMark } from '@jbrowse/render-core/marks'

import type { WalkRow, WalkRun } from '@jbrowse/bandage-core/layout/walkRows'
import type { MarkContext2D, SpanChannels } from '@jbrowse/render-core/marks'

type Rgb = [number, number, number]

function hslRgb(h: number, s: number, l: number): Rgb {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
  }
  return [f(0), f(8), f(4)]
}

// The colours runPaint writes: `#rrggbb`, `rgb(r, g, b)` and
// `hsl(h, s%, l%)`
export function cssRgb(css: string): Rgb {
  if (css.startsWith('#')) {
    const v = Number.parseInt(css.slice(1), 16)
    return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]
  }
  const [a = 0, b = 0, c = 0] = css.match(/[\d.]+/g)!.map(Number)
  return css.startsWith('hsl') ? hslRgb(a, b / 100, c / 100) : [a, b, c]
}

const abgr = ([r, g, b]: Rgb) =>
  ((0xff << 24) |
    (Math.round(b) << 16) |
    (Math.round(g) << 8) |
    Math.round(r)) >>>
  0

const cssAbgr = new Map<string, number>()
function packCss(css: string) {
  let v = cssAbgr.get(css)
  if (v === undefined) {
    v = abgr(cssRgb(css))
    cssAbgr.set(css, v)
  }
  return v
}

/**
 * A run as the pieces it paints in, each `[start, end, abgr]` in bp along
 * the row: one for a solid fill, and for a gradient one per pixel or per
 * degree of hue, whichever is fewer, coloured as the SVG gradient through
 * the same stops colours its middle
 */
export function runPieces(
  run: WalkRun,
  ramp: { start: number; end: number } | undefined,
  pxPerBp: number,
): [number, number, number][] {
  const end = run.start + run.bp
  const paint = runPaint(run, ramp)
  if ('fill' in paint) {
    return [[run.start, end, packCss(paint.fill)]]
  }
  const stops = paint.stops.map(cssRgb)
  const hues = paint.stops.map(css => Number(/[\d.]+/.exec(css)![0]))
  const hueSpan = Math.abs(hues.at(-1)! - hues[0]!)
  const n = Math.max(
    1,
    Math.min(Math.ceil(run.bp * pxPerBp), Math.ceil(hueSpan), run.bp),
  )
  const pieces: [number, number, number][] = []
  for (let k = 0; k < n; k++) {
    const t = ((k + 0.5) / n) * (stops.length - 1)
    const i = Math.min(Math.floor(t), stops.length - 2)
    const a = stops[i]!
    const b = stops[i + 1]!
    const f = t - i
    pieces.push([
      Math.round(run.start + (run.bp * k) / n),
      Math.round(run.start + (run.bp * (k + 1)) / n),
      abgr([0, 1, 2].map(j => a[j]! + (b[j]! - a[j]!) * f) as Rgb),
    ])
  }
  return pieces
}

export interface WalkRowSpans {
  bars: SpanChannels & { color: Uint32Array }
  gaps: SpanChannels & { color: Uint32Array }
  // where each drawn row's spans start in `bars` and `gaps`
  barRows: Uint32Array
  gapRows: Uint32Array
}

function channels(capacity: number) {
  return {
    x: new Uint32Array(capacity),
    x2: new Uint32Array(capacity),
    row: new Uint32Array(capacity),
    color: new Uint32Array(capacity),
    count: 0,
  }
}

function trim(c: ReturnType<typeof channels>) {
  const n = c.count
  return {
    x: c.x.subarray(0, n),
    x2: c.x2.subarray(0, n),
    row: c.row.subarray(0, n),
    color: c.color.subarray(0, n),
    count: n,
  }
}

/**
 * Each row's runs as `walkRowsTree` coalesces and colours them at
 * `pxPerBp`, as span channels: `x`/`x2` in bp along the row, `row` its index
 * among `rows`. Gaps go apart, since they draw thinner.
 */
export function walkRowSpans(
  rows: WalkRow[],
  pxPerBp: number,
  ramp?: { start: number; end: number },
): WalkRowSpans {
  const pieces = rows.map(r =>
    coalesceRuns(r.runs, pxPerBp).map(run => ({
      gap: run.gap,
      pieces: runPieces(run, ramp, pxPerBp),
    })),
  )
  let total = 0
  for (const runs of pieces) {
    for (const run of runs) {
      total += run.pieces.length
    }
  }
  const bars = channels(total)
  const gaps = channels(total)
  const barRows = new Uint32Array(rows.length + 1)
  const gapRows = new Uint32Array(rows.length + 1)
  pieces.forEach((runs, row) => {
    for (const run of runs) {
      const c = run.gap ? gaps : bars
      for (const [x, x2, color] of run.pieces) {
        const i = c.count++
        c.x[i] = x
        c.x2[i] = x2
        c.row[i] = row
        c.color[i] = color
      }
    }
    barRows[row + 1] = bars.count
    gapRows[row + 1] = gaps.count
  })
  return { bars: trim(bars), gaps: trim(gaps), barRows, gapRows }
}

function slice<T extends SpanChannels & { color: Uint32Array }>(
  c: T,
  a: number,
  b: number,
) {
  return {
    x: c.x.subarray(a, b),
    x2: c.x2.subarray(a, b),
    row: c.row.subarray(a, b),
    color: c.color.subarray(a, b),
    count: b - a,
  }
}

export interface WalkRowSpanFrame {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
  width: number
  height: number
  rowPx: number
  barPx: number
  origin: number
  // runs of rows whose y is `rowY(first)` plus a row pitch each, as the
  // reference row and each grouped section are
  blocks: { first: number; count: number; rowY: number }[]
}

/**
 * Paints the spans through render-core's span mark, a block of rows at a
 * time: row i's bar centred where `walkRowsTree` centres it, `barPx` tall,
 * its x at `origin + bp` through the pane's transform.
 */
export function paintWalkRowSpans(
  ctx: MarkContext2D,
  spans: WalkRowSpans,
  f: WalkRowSpanFrame,
) {
  let longest = 1
  for (const c of [spans.bars, spans.gaps]) {
    for (const x2 of c.x2) {
      longest = Math.max(longest, x2)
    }
  }
  const block = {
    start: 0,
    end: longest,
    screenStartPx: f.origin * f.scaleX + f.translateX,
    screenEndPx: (f.origin + longest) * f.scaleX + f.translateX,
    reversed: false,
    displayedRegionIndex: 0,
  }
  const frame = { canvasWidth: f.width, canvasHeight: f.height }
  const rowHeight = f.rowPx * f.scaleY
  for (const { first, count, rowY } of f.blocks) {
    // slot `row` centres at (rowY + (row - first) * rowPx) * scaleY + translateY
    const scrollTop =
      rowHeight / 2 - f.translateY - (rowY - first * f.rowPx) * f.scaleY
    const top = (rowY - f.rowPx / 2) * f.scaleY + f.translateY
    if (top > f.height || top + count * rowHeight < 0) {
      continue
    }
    for (const [c, starts, barPx] of [
      [spans.bars, spans.barRows, f.barPx],
      [spans.gaps, spans.gapRows, Math.min(GAP_PX, f.barPx)],
    ] as const) {
      spanMark.paintBlock(
        ctx,
        slice(c, starts[first]!, starts[first + count]!),
        block,
        frame,
        {
          rowHeight,
          rowProportion: barPx / rowHeight,
          minWidthPx: 1,
          seamPx: 0,
          scrollTop,
        },
      )
    }
  }
}
