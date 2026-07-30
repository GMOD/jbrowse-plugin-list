import { describe, expect, it } from 'vitest'

import { largeJumpScrollTarget, offScreenCenterTarget } from './autoScroll'

describe('largeJumpScrollTarget', () => {
  const view = { scrollLeft: 1000, clientWidth: 800 }

  it('stays put for a column already visible', () => {
    expect(largeJumpScrollTarget({ x: 1400, ...view })).toBeUndefined()
  })

  it('stays put for a small overshoot off either edge', () => {
    expect(largeJumpScrollTarget({ x: 1850, ...view })).toBeUndefined()
    expect(largeJumpScrollTarget({ x: 900, ...view })).toBeUndefined()
  })

  it('centers on a large jump past the right edge', () => {
    // gap = 3000 - 1800 = 1200 > 800
    expect(largeJumpScrollTarget({ x: 3000, ...view })).toBe(3000 - 400)
  })

  it('centers on a large jump past the left edge', () => {
    // gap = 1000 - (-200) = 1200 > 800
    expect(largeJumpScrollTarget({ x: -200, ...view })).toBe(-200 - 400)
  })
})

describe('offScreenCenterTarget', () => {
  const view = { scrollLeft: 1000, clientWidth: 800 }

  it('stays put when the range is fully visible', () => {
    expect(offScreenCenterTarget({ start: 1200, end: 1500, ...view })).toBeUndefined()
  })

  it('stays put when the range is partially visible', () => {
    expect(offScreenCenterTarget({ start: 900, end: 1100, ...view })).toBeUndefined()
    expect(offScreenCenterTarget({ start: 1700, end: 2000, ...view })).toBeUndefined()
  })

  it('centers a range that is entirely off-screen to the right', () => {
    expect(offScreenCenterTarget({ start: 3000, end: 3200, ...view })).toBe(3100 - 400)
  })

  it('centers a range that is entirely off-screen to the left', () => {
    expect(offScreenCenterTarget({ start: 100, end: 300, ...view })).toBe(200 - 400)
  })
})
