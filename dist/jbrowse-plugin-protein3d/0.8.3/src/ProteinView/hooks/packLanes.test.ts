import { describe, expect, it } from 'vitest'

import { packLanes } from './useProteinFeatureTrackData'

import type { FeatureLayout } from './useProteinFeatureTrackData'

function layout(alignmentStart: number, alignmentEnd: number): FeatureLayout {
  return {
    feature: {
      type: 'Region',
      start: alignmentStart + 1,
      end: alignmentEnd + 1,
      description: '',
      uniqueId: `${alignmentStart}-${alignmentEnd}`,
    },
    alignmentStart,
    alignmentEnd,
    left: 0,
    width: 0,
    lane: -1,
  }
}

describe('packLanes', () => {
  it('keeps non-overlapping features on a single lane', () => {
    const layouts = [layout(0, 4), layout(5, 9), layout(10, 14)]
    expect(packLanes(layouts)).toBe(1)
    expect(layouts.map(l => l.lane)).toEqual([0, 0, 0])
  })

  it('stacks overlapping features onto separate lanes', () => {
    const a = layout(0, 10)
    const b = layout(5, 15)
    const c = layout(8, 20)
    const count = packLanes([a, b, c])
    expect(count).toBe(3)
    expect([a.lane, b.lane, c.lane]).toEqual([0, 1, 2])
  })

  it('treats shared boundary columns as overlapping', () => {
    const a = layout(0, 5)
    const b = layout(5, 10)
    expect(packLanes([a, b])).toBe(2)
  })

  it('reuses a lane once its previous feature has ended', () => {
    const a = layout(0, 4)
    const b = layout(2, 6)
    const c = layout(8, 12)
    packLanes([a, b, c])
    expect([a.lane, b.lane, c.lane]).toEqual([0, 1, 0])
  })

  it('returns at least one lane for an empty group', () => {
    expect(packLanes([])).toBe(1)
  })
})
