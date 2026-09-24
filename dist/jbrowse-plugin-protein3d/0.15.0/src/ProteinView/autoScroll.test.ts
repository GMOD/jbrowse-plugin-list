import { observable, runInAction } from 'mobx'
import { describe, expect, it } from 'vitest'

import {
  followHover,
  followHoverTarget,
  offScreenCenterTarget,
} from './autoScroll'

describe('followHoverTarget', () => {
  const view = { width: 6, scrollLeft: 1000, clientWidth: 800 }

  it('stays put for a column already visible', () => {
    expect(followHoverTarget({ x: 1000, ...view })).toBeUndefined()
    expect(followHoverTarget({ x: 1794, ...view })).toBeUndefined()
  })

  it('centres a column that has just crossed either edge', () => {
    expect(followHoverTarget({ x: 1797, ...view })).toBe(1800 - 400)
    expect(followHoverTarget({ x: 996, ...view })).toBe(999 - 400)
  })

  it('centres a column far off screen', () => {
    expect(followHoverTarget({ x: 3000, ...view })).toBe(3003 - 400)
  })
})

describe('followHover', () => {
  function setup(initial: {
    alignmentHoverPos?: number
    autoScrollAlignment?: boolean
    isMouseInAlignment?: boolean
  }) {
    const model = observable({
      alignmentHoverPos: undefined as number | undefined,
      autoScrollAlignment: true,
      isMouseInAlignment: false,
      ...initial,
    })
    const container = { scrollLeft: 0, clientWidth: 600 }
    const dispose = followHover(model, () => container)
    return { model, container, dispose }
  }

  it('centres a hover from elsewhere that lands off screen', () => {
    const { model, container, dispose } = setup({})
    runInAction(() => {
      model.alignmentHoverPos = 200
    })
    expect(container.scrollLeft).toBe(1203 - 300)
    dispose()
  })

  it('leaves the panel alone when the pointer exits past a clipped edge column', () => {
    const { model, container, dispose } = setup({
      alignmentHoverPos: 100,
      isMouseInAlignment: true,
    })
    container.scrollLeft = 3
    runInAction(() => {
      model.isMouseInAlignment = false
    })
    runInAction(() => {
      model.alignmentHoverPos = undefined
    })
    expect(container.scrollLeft).toBe(3)
    dispose()
  })

  it('does not jump to a stale hover when auto-scroll is switched on', () => {
    const { model, container, dispose } = setup({
      alignmentHoverPos: 300,
      autoScrollAlignment: false,
    })
    runInAction(() => {
      model.autoScrollAlignment = true
    })
    expect(container.scrollLeft).toBe(0)
    dispose()
  })
})

describe('offScreenCenterTarget', () => {
  const view = { scrollLeft: 1000, clientWidth: 800 }

  it('stays put when the range is fully visible', () => {
    expect(
      offScreenCenterTarget({ start: 1200, end: 1500, ...view }),
    ).toBeUndefined()
  })

  it('stays put when the range is partially visible', () => {
    expect(
      offScreenCenterTarget({ start: 900, end: 1100, ...view }),
    ).toBeUndefined()
    expect(
      offScreenCenterTarget({ start: 1700, end: 2000, ...view }),
    ).toBeUndefined()
  })

  it('centers a range that is entirely off-screen to the right', () => {
    expect(offScreenCenterTarget({ start: 3000, end: 3200, ...view })).toBe(
      3100 - 400,
    )
  })

  it('centers a range that is entirely off-screen to the left', () => {
    expect(offScreenCenterTarget({ start: 100, end: 300, ...view })).toBe(
      200 - 400,
    )
  })
})
