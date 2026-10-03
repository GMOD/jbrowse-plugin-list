import {
  DENSITY_PX,
  binAt,
  cellLabel,
  densityCounts,
  drawOverview,
  overviewLayout,
  rowAt,
  rowTop,
} from './draw'

import type { HaplotypeOverviewData } from '../GetHaplotypeOverview'

// rows 0-3 are haplotypes, 4 the reference; 2 is the track's lane
function overview(): HaplotypeOverviewData {
  const rows = ['A.1', 'B.1', 'C.1', 'D.1', 'GRCh38#0']
  const bins = [0, 1, 2].map(b => ({
    start: b * 100,
    end: (b + 1) * 100,
    classes: [0, 0, 0, 0] as [number, number, number, number],
    excursions: 0,
    variants: 0,
    longestExcursion: 0,
  }))
  // bin 0: reference-like but D absent; bin 1: A variant with 16+ marks, B
  // partial; bin 2 (after a gap at 300) everyone reference-like
  const cells = new Uint8Array(
    [
      [1, 1, 1, 0, 1],
      [3 | (3 << 2), 2, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ].flat(),
  )
  bins[2]!.start = 400
  bins[2]!.end = 500
  return { level: 0, bin: 100, rows, pinned: [2], reference: [4], bins, cells }
}

test('the lane comes first at a readable height, then every other haplotype, never the reference', () => {
  const layout = overviewLayout(overview(), true, 400)
  expect(layout.rows).toEqual([2, 0, 1, 3])
  expect(layout.pinnedHeight).toBe(14)
  expect(layout.rowsTop).toBeGreaterThan(DENSITY_PX)
  expect(layout.restTop).toBeGreaterThan(layout.rowsTop + 14)
  expect(rowTop(layout, 3) + layout.restHeight).toBeCloseTo(400)
})

test('with only the lanes asked for, the lane alone fills the rows', () => {
  const layout = overviewLayout(overview(), false, 400)
  expect(layout.rows).toEqual([2])
  expect(layout.restHeight).toBe(0)
})

test('a point maps to the haplotype row under it, and to none over the density row', () => {
  const layout = overviewLayout(overview(), true, 400)
  expect(rowAt(layout, 1)).toBeUndefined()
  expect(rowAt(layout, layout.rowsTop + 1)).toBe(2)
  expect(rowAt(layout, layout.restTop + 1)).toBe(0)
  expect(rowAt(layout, 399)).toBe(3)
})

test('a bp maps to its bin, and to none between fragments or past the end', () => {
  const data = overview()
  expect(binAt(data, 0)).toBe(0)
  expect(binAt(data, 150)).toBe(1)
  expect(binAt(data, 350)).toBeUndefined()
  expect(binAt(data, 499)).toBe(2)
  expect(binAt(data, 500)).toBeUndefined()
})

test('the density counts leave the reference out and split variants by their marks', () => {
  expect(densityCounts(overview())).toEqual([
    [1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0],
  ])
})

test('a cell names its class, and a variant cell its marks', () => {
  expect(cellLabel(1)).toBe('reference-like')
  expect(cellLabel(3 | (1 << 2))).toBe('diverges ≥50 bp, 2–3 excursions')
  expect(cellLabel(0)).toMatch(/^absent/)
})

function recordingContext() {
  const calls: string[] = []
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push(
        `${name}(${args.map(a => (typeof a === 'number' ? Math.round(a) : '_')).join(',')})`,
      )
    }
  const ctx = {
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    drawImage: record('drawImage'),
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    scale: record('scale'),
    fillText: record('fillText'),
    measureText: () => ({ width: 10 }),
  } as unknown as CanvasRenderingContext2D
  return { ctx, calls }
}

test('a reversed block draws its rows mirrored over the same screen span', () => {
  const data = overview()
  const layout = overviewLayout(data, true, 200)
  const images = [
    { image: { height: 4 } as HTMLCanvasElement, top: 50, height: 100 },
  ]
  const frame = (scale: number, translateX: number) => ({
    xOf: (bp: number) => bp * scale + translateX,
    width: 500,
    height: 200,
    dpr: 1,
  })
  const forward = recordingContext()
  drawOverview(forward.ctx, data, undefined, layout, images, frame(1, 0))
  const reversed = recordingContext()
  drawOverview(reversed.ctx, data, undefined, layout, images, frame(-1, 500))
  const blits = (calls: string[]) =>
    calls.filter(c => c.startsWith('drawImage'))
  expect(blits(forward.calls)).toEqual([
    'drawImage(_,0,0,2,4,0,50,200,100)',
    'drawImage(_,2,0,1,4,400,50,100,100)',
  ])
  expect(blits(reversed.calls)).toEqual([
    'drawImage(_,0,0,2,4,300,50,200,100)',
    'drawImage(_,2,0,1,4,0,50,100,100)',
  ])
  expect(reversed.calls).toContain('scale(-1,1)')
  expect(forward.calls).not.toContain('scale(-1,1)')
})
