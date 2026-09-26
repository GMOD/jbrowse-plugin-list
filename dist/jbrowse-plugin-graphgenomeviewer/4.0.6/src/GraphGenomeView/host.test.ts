import { cutHolds, hostCut } from './host'

import type { HostWindow } from './host'

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
