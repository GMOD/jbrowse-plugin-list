import { walkRowsTree } from '@jbrowse/bandage-core/layout/walkRowDraw'

import {
  cssRgb,
  paintWalkRowSpans,
  runPieces,
  walkRowSpans,
} from './walkRowSpans'

import type { El } from '@jbrowse/bandage-core/el'
import type { WalkRow, WalkRows } from '@jbrowse/bandage-core/layout/walkRows'

function row(name: string, runs: WalkRow['runs']): WalkRow {
  const bp = runs.reduce((sum, r) => sum + r.bp, 0)
  return {
    name,
    label: name,
    sample: name,
    bp,
    offReferenceBp: 0,
    gapBp: 0,
    complete: true,
    runs,
  }
}

// runs under a pixel at 0.01 px/bp coalesce, a gap draws thinner
const bars: WalkRows = {
  origin: 1000,
  reference: row('GRCh38', [
    { start: 0, bp: 3000, onReference: true, referenceStart: 1000 },
  ]),
  rows: [
    row('A', [
      { start: 0, bp: 900, onReference: true, referenceStart: 1000 },
      { start: 900, bp: 40, onReference: false },
      { start: 940, bp: 30, onReference: true, referenceStart: 1900 },
      { start: 970, bp: 50, onReference: false },
      { start: 1020, bp: 500, onReference: false, gap: true },
      { start: 1520, bp: 1980, onReference: true, referenceStart: 2000 },
    ]),
    row('B', [{ start: 0, bp: 2500, onReference: true, referenceStart: 1500 }]),
  ],
}

const frame = {
  scaleX: 0.01,
  scaleY: 1,
  translateX: 30,
  translateY: 20,
  width: 400,
  height: 200,
  rowPx: 12,
  barPx: 10,
}

const key = (x: number, y: number, w: number, h: number, fill: string) =>
  `${[x, y, w, h].map(v => v.toFixed(3)).join(',')} ${fill}`

function treeRects(e: El, out: string[] = []) {
  if (e.tag === 'rect' && typeof e.attrs.fill === 'string') {
    const { x, y, width, height, fill } = e.attrs as Record<string, number>
    out.push(key(x!, y!, width!, height!, String(fill)))
  }
  for (const c of e.children) {
    if (c && typeof c === 'object') {
      treeRects(c, out)
    }
  }
  return out
}

function paintedRects(ramp?: { start: number; end: number }) {
  const out: string[] = []
  let style = ''
  const ctx = {
    set fillStyle(css: string) {
      const hex = cssRgb(css).map(c => c.toString(16).padStart(2, '0'))
      style = `#${hex.join('')}`
    },
    get fillStyle() {
      return style
    },
    fillRect(x: number, y: number, w: number, h: number) {
      out.push(key(x, y, w, h, style))
    },
  }
  const all = [bars.reference, ...bars.rows]
  paintWalkRowSpans(ctx as never, walkRowSpans(all, frame.scaleX, ramp), {
    ...frame,
    origin: bars.origin,
    blocks: [{ first: 0, count: all.length, rowY: 0 }],
  })
  return out
}

test('the spans paint the rects walkRowsTree draws the runs as', () => {
  const rects = paintedRects()
  expect(rects.length).toBeGreaterThan(3)
  expect(rects.sort()).toEqual(treeRects(walkRowsTree(bars, frame)).sort())
})

test('a run the ramp gives a gradient paints a piece per pixel, through its stops', () => {
  const ramp = { start: 1000, end: 4000 }
  const run = bars.reference.runs[0]!
  const pieces = runPieces(run, ramp, frame.scaleX)
  expect(pieces).toHaveLength(30)
  expect(pieces[0]![0]).toBe(run.start)
  expect(pieces.at(-1)![1]).toBe(run.start + run.bp)
  pieces.slice(1).forEach(([start], i) => {
    expect(start).toBe(pieces[i]![1])
  })
  const red = pieces[0]![2] & 0xff
  const blue = (pieces.at(-1)![2] >>> 16) & 0xff
  expect(red).toBeGreaterThan(200)
  expect(blue).toBeGreaterThan(200)
})

test('a solid run under the ramp is one piece in its own hue', () => {
  const ramp = { start: 1000, end: 4000 }
  const off = bars.rows[0]!.runs[1]!
  expect(runPieces(off, ramp, frame.scaleX)).toHaveLength(1)
})
