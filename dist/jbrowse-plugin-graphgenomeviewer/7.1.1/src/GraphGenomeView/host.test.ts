import { cutHolds, hostCut, hostFrame } from './host'

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
