import {
  GAP_PX,
  MISSING_PX,
  coalesceRuns,
  gapStyle,
  runPaint,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import {
  NOT_LOADED_RIM_PX,
  hslToRgb,
} from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { packAbgr } from '@jbrowse/bandage-core/renderer/colorBits'
import { makeAbgrFill, spanMark } from '@jbrowse/render-core/marks'

import type { WalkRow, WalkRun } from '@jbrowse/bandage-core/layout/walkRows'
import type {
  InkRect,
  MarkContext2D,
  SpanChannels,
} from '@jbrowse/render-core/marks'

type Rgb = [number, number, number]

type SpanKind = 'bars' | 'hollows' | 'gaps' | 'hairlines'

const SPAN_KINDS: SpanKind[] = ['bars', 'hollows', 'gaps', 'hairlines']

// the numbers in a CSS colour, `1e-7` among them, as `${hue}` may print one
const cssNumbers = (css: string) =>
  (css.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number)

// The colours runPaint writes: `#rrggbb`, `rgb(r, g, b)` and
// `hsl(h, s%, l%)`
export function cssRgb(css: string): Rgb {
  if (css.startsWith('#')) {
    const v = Number.parseInt(css.slice(1), 16)
    return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]
  }
  const [a = 0, b = 0, c = 0] = cssNumbers(css)
  return css.startsWith('hsl')
    ? (hslToRgb(a, b / 100, c / 100).map(v => v * 255) as Rgb)
    : [a, b, c]
}

const abgr = ([r, g, b]: Rgb) =>
  packAbgr(Math.round(r), Math.round(g), Math.round(b), 255)

const packCss = (css: string) => abgr(cssRgb(css))

// packCss remembering each colour it packed, for one cut's runs
function cssPacker() {
  const packed = new Map<string, number>()
  return (css: string) => {
    let v = packed.get(css)
    if (v === undefined) {
      v = packCss(css)
      packed.set(css, v)
    }
    return v
  }
}

/**
 * A run as the pieces it paints in, each `[start, end, abgr]` in bp along
 * the row: one for a solid fill, in its rim's colour where it has one, and
 * for a gradient one per pixel or per degree of hue, whichever is fewer,
 * coloured as the SVG gradient through the same stops colours its middle
 */
export function runPieces(
  run: WalkRun,
  ramp: { start: number; end: number } | undefined,
  pxPerBp: number,
  marked = false,
  pack = packCss,
): [number, number, number][] {
  const end = run.start + run.bp
  const paint = runPaint(run, ramp, marked)
  if ('fill' in paint) {
    return [[run.start, end, pack(paint.rim ?? paint.fill)]]
  }
  const stops = paint.stops.map(cssRgb)
  const hues = paint.stops.map(css => cssNumbers(css)[0]!)
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

// a hollow span's `color` is its rim and `inner` its fill
type ColoredSpans = SpanChannels & { color: Uint32Array; inner: Uint32Array }

export interface WalkRowSpans {
  bars: ColoredSpans
  // runs the cut did not load, which draw hollow
  hollows: ColoredSpans
  gaps: ColoredSpans
  // gaps of bases the graph lacks, which draw as a hairline
  hairlines: ColoredSpans
  // where each drawn row's spans start in `bars`, `hollows`, `gaps` and
  // `hairlines`
  barRows: Uint32Array
  hollowRows: Uint32Array
  gapRows: Uint32Array
  hairlineRows: Uint32Array
  // the furthest any span reaches along its row, in bp, and at least 1
  longest: number
}

function channels(capacity: number) {
  return {
    x: new Uint32Array(capacity),
    x2: new Uint32Array(capacity),
    row: new Uint32Array(capacity),
    color: new Uint32Array(capacity),
    inner: new Uint32Array(capacity),
    count: 0,
  }
}

function slice(c: ColoredSpans, a: number, b: number) {
  return {
    x: c.x.subarray(a, b),
    x2: c.x2.subarray(a, b),
    row: c.row.subarray(a, b),
    color: c.color.subarray(a, b),
    inner: c.inner.subarray(a, b),
    count: b - a,
  }
}

// the fill inside a run's rim, for a run that has one
function innerOf(
  run: WalkRun,
  ramp: { start: number; end: number } | undefined,
  marked: boolean,
  pack: (css: string) => number,
) {
  const paint = runPaint(run, ramp, marked)
  return 'fill' in paint && paint.rim !== undefined
    ? pack(paint.fill)
    : undefined
}

const kindOf = (run: WalkRun, inner: number | undefined): SpanKind =>
  !run.gap
    ? inner === undefined
      ? 'bars'
      : 'hollows'
    : gapStyle(run.cause).px === MISSING_PX
      ? 'hairlines'
      : 'gaps'

/**
 * Each row's runs as `walkRowsTree` coalesces and colours them at
 * `pxPerBp`, `marked` as it is under a node layout, as span channels: `x`/`x2`
 * in bp along the row, `row` its index among `rows`. Runs with a rim, which
 * only `marked` gives, go apart, since they draw hollow, gaps apart,
 * since they draw thinner, and gaps of bases the graph lacks apart again, as
 * a hairline.
 */
export function walkRowSpans(
  rows: WalkRow[],
  pxPerBp: number,
  ramp?: { start: number; end: number },
  marked = false,
): WalkRowSpans {
  const pack = cssPacker()
  const pieces = rows.map(r =>
    coalesceRuns(r.runs, pxPerBp, marked).map(run => {
      const inner = innerOf(run, ramp, marked, pack)
      return {
        kind: kindOf(run, inner),
        inner: inner ?? 0,
        pieces: runPieces(run, ramp, pxPerBp, marked, pack),
      }
    }),
  )
  const totals = { bars: 0, hollows: 0, gaps: 0, hairlines: 0 }
  for (const runs of pieces) {
    for (const run of runs) {
      totals[run.kind] += run.pieces.length
    }
  }
  const spans = {
    bars: channels(totals.bars),
    hollows: channels(totals.hollows),
    gaps: channels(totals.gaps),
    hairlines: channels(totals.hairlines),
  }
  const starts = {
    bars: new Uint32Array(rows.length + 1),
    hollows: new Uint32Array(rows.length + 1),
    gaps: new Uint32Array(rows.length + 1),
    hairlines: new Uint32Array(rows.length + 1),
  }
  let longest = 1
  pieces.forEach((runs, row) => {
    for (const run of runs) {
      const c = spans[run.kind]
      for (const [x, x2, color] of run.pieces) {
        const i = c.count++
        c.x[i] = x
        c.x2[i] = x2
        c.row[i] = row
        c.color[i] = color
        c.inner[i] = run.inner
        longest = Math.max(longest, x2)
      }
    }
    for (const kind of SPAN_KINDS) {
      starts[kind][row + 1] = spans[kind].count
    }
  })
  return {
    ...spans,
    barRows: starts.bars,
    hollowRows: starts.hollows,
    gapRows: starts.gaps,
    hairlineRows: starts.hairlines,
    longest,
  }
}

// each hollow span's fill inside its rim, on the box its rim painted
function paintInsides(
  ctx: MarkContext2D,
  spans: ColoredSpans,
  boxOf: (i: number) => InkRect | undefined,
) {
  const rim = NOT_LOADED_RIM_PX
  const setFill = makeAbgrFill(ctx)
  for (let i = 0; i < spans.count; i++) {
    const box = boxOf(i)
    if (box && box.width > 2 * rim && box.height > 2 * rim) {
      setFill(spans.inner[i]!)
      ctx.fillRect(
        box.left + rim,
        box.top + rim,
        box.width - 2 * rim,
        box.height - 2 * rim,
      )
    }
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
 * its x at `origin + bp` through the pane's transform. A hollow span paints
 * its rim's colour over the whole bar and its fill inside the rim, as
 * `walkRowsTree` strokes it, or the rim's colour alone where the bar is too
 * narrow to hold both.
 */
export function paintWalkRowSpans(
  ctx: MarkContext2D,
  spans: WalkRowSpans,
  f: WalkRowSpanFrame,
) {
  const { longest } = spans
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
      [spans.hollows, spans.hollowRows, f.barPx],
      [spans.gaps, spans.gapRows, Math.min(GAP_PX, f.barPx)],
      [spans.hairlines, spans.hairlineRows, Math.min(MISSING_PX, f.barPx)],
    ] as const) {
      const painted = slice(c, starts[first]!, starts[first + count]!)
      const params = {
        rowHeight,
        rowProportion: barPx / rowHeight,
        minWidthPx: 1,
        seamPx: 0,
        scrollTop,
      }
      spanMark.paintBlock(ctx, painted, block, frame, params)
      if (c === spans.hollows) {
        paintInsides(ctx, painted, (i: number) =>
          spanMark.ink?.(painted, block, frame, params, i),
        )
      }
    }
  }
}
