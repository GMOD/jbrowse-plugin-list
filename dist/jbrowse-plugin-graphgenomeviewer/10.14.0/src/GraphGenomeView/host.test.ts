import {
  cutHolds,
  cutRuleOf,
  hostCut,
  hostFrame,
  sameCut,
  snapLevel,
  snappedCut,
} from './host'

import type { HostWindow, LinearHost } from './host'

const window: HostWindow = {
  refName: 'chr1',
  assemblyName: 'hg38',
  start: 1_000_000.4,
  end: 1_060_000.4,
  bpPerPx: 60,
  span: 60_000,
  regionStart: 0,
  regionEnd: 10_000_000,
}

test('a cut with margins is the window plus a window-width each side, under the cap', () => {
  expect(hostCut(window, Infinity)).toEqual({
    refName: 'chr1',
    assemblyName: 'hg38',
    start: 940_000,
    end: 1_120_001,
  })
  const capped = hostCut(window, 66_000)
  expect(capped.end - capped.start).toBeLessThanOrEqual(66_000)
  expect(cutHolds(capped, window)).toBe(true)
})

test('a cut without margins is the window alone, and holds for that window only', () => {
  const cut = hostCut(window, Infinity, false)
  expect(cut).toMatchObject({ start: 1_000_000, end: 1_060_001 })
  expect(cutHolds(cut, window, false)).toBe(true)
  expect(
    cutHolds(cut, { ...window, start: 1_010_000, end: 1_070_000 }, false),
  ).toBe(false)
})

test('a cut trimmed to a cap the window fills still holds that window', () => {
  const cut = hostCut(window, 60_000)
  expect(cut.end - cut.start).toBeLessThanOrEqual(60_000)
  expect(cutHolds(cut, window)).toBe(true)
})

test('a reversed block runs bp right to left from the same screen edge', () => {
  const block = {
    refName: 'chr1',
    assemblyName: 'hg38',
    start: 1000,
    end: 2000,
    offsetPx: 500,
  }
  const view = (reversed: boolean) =>
    ({
      initialized: true,
      bpPerPx: 2,
      offsetPx: 400,
      dynamicBlocks: { contentBlocks: [{ ...block, reversed }] },
    }) as unknown as LinearHost
  const region = { refName: 'chr1', assemblyName: 'hg38', start: 0, end: 1 }
  const at = (reversed: boolean, bp: number) => {
    const frame = hostFrame(view(reversed), region)!
    return bp * frame.scale + frame.translateX
  }
  expect([at(false, 1000), at(false, 2000)]).toEqual([100, 600])
  expect([at(true, 2000), at(true, 1000)]).toEqual([100, 600])
})

const shifted = (bp: number) => ({
  ...window,
  start: window.start + bp,
  end: window.end + bp,
})

test('a snapped cut is one cut for every window of its cell, and the next cell is half a level on', () => {
  const cut = snappedCut(window)
  expect(cut).toEqual({
    refName: 'chr1',
    assemblyName: 'hg38',
    start: 966_656,
    end: 1_064_960,
  })
  expect(sameCut(cut, snappedCut(shifted(2_000)))).toBe(true)
  expect(sameCut(cut, snappedCut(shifted(-20_000)))).toBe(true)
  expect(snappedCut(shifted(10_000))).toMatchObject({
    start: 966_656 + 32_768,
    end: 1_064_960 + 32_768,
  })
})

test('a snapped cut depends on the window alone, whichever window came before', () => {
  const there = snappedCut(shifted(500_000))
  expect(snappedCut(window)).toEqual(snappedCut(shifted(0)))
  expect(snappedCut(shifted(500_000))).toEqual(there)
})

test('every window lies inside its snapped cut, which is at most 2.2 windows wide', () => {
  for (let k = 0; k < 400; k++) {
    const span = 1_000 * 1.02 ** k
    const start = 5_000_000 + ((k * 7919) % 100_000) * 3.7
    const seen = { ...window, start, end: start + span, span }
    const cut = snappedCut(seen)
    expect(cut.start).toBeLessThanOrEqual(seen.start + 1)
    expect(cut.end).toBeGreaterThanOrEqual(seen.end - 1)
    expect(cut.end - cut.start).toBeLessThanOrEqual(2.2 * span + 2)
  }
})

test('snap levels are a square root of two apart, the smallest holding the span', () => {
  expect(snapLevel(65_536)).toBe(65_536)
  expect(snapLevel(65_537)).toBeCloseTo(65_536 * Math.SQRT2, 6)
  expect(snapLevel(60_000)).toBe(65_536)
  expect(snapLevel(46_000)).toBeCloseTo(32_768 * Math.SQRT2, 6)
})

test('a span a rounding error past a level, as bp per px times the width can come out, stays on that level', () => {
  expect(snapLevel(65_536 * (1 + 1e-12))).toBe(65_536)
  expect(snapLevel(2 ** 15.5 * (1 + 1e-12))).toBe(2 ** 15.5)
})

test('a snapped cut stops at the ends of the displayed region', () => {
  const cut = snappedCut({ ...window, start: 1_000, end: 61_000 })
  expect(cut.start).toBe(0)
  expect(cut.end).toBeGreaterThan(61_000)
})

test('only the force layout snaps its cut; the others cut with margins or the window alone', () => {
  expect(cutRuleOf('force')).toBe('snapped')
  expect(cutRuleOf('auto')).toBe('margins')
  expect(cutRuleOf('tubemapref')).toBe('margins')
  expect(cutRuleOf('ordered')).toBe('window')
  expect(cutRuleOf('walkrows')).toBe('window')
  expect(cutRuleOf('tubemap')).toBe('window')
})
