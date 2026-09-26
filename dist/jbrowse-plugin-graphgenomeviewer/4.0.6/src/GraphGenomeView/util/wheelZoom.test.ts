import { wheelZoomFactor } from './wheelZoom'

const wheel = (deltaY: number, deltaMode = 0, ctrlKey = false) =>
  wheelZoomFactor({ deltaY, deltaMode, ctrlKey })

test('a mouse notch zooms by the step it always has, in either direction', () => {
  expect(wheel(-100)).toBeCloseTo(1.1)
  expect(wheel(100)).toBeCloseTo(1 / 1.1)
})

test('a second of trackpad scrolling zooms about as far as it scrolled', () => {
  let zoom = 1
  for (let i = 0; i < 60; i++) {
    zoom *= wheel(-4)
  }
  // 240 px in all, so 2.4 notches; a step per event made this 1.1 ** 60 = 304
  expect(zoom).toBeCloseTo(1.1 ** 2.4)
})

test('the same distance zooms the same however many events carry it', () => {
  expect(wheel(-25) ** 4).toBeCloseTo(wheel(-100))
})

test('line and page deltas are read in px', () => {
  expect(wheel(-1, 1)).toBeCloseTo(wheel(-40))
  expect(wheel(-1, 2)).toBeCloseTo(wheel(-800))
})

test('a pinch is ten times as sensitive as a scroll', () => {
  expect(wheel(-5, 0, true)).toBeCloseTo(wheel(-50))
})

test('one event moves at most two notches', () => {
  expect(wheel(-5000)).toBeCloseTo(1.1 ** 2)
  expect(wheel(5000)).toBeCloseTo(1.1 ** -2)
})

test('no movement is no zoom', () => {
  expect(wheel(0)).toBe(1)
})
