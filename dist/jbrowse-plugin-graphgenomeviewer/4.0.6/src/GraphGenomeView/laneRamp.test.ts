import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { getSnapshot, onPatch } from '@jbrowse/mobx-state-tree'
import { describe, expect, it } from 'vitest'

import {
  paintSourceLane,
  referencePositionColor,
  sourceLaneDisplay,
} from './laneRamp'

const displaySchema = ConfigurationSchema('LaneDisplay', {
  color: {
    type: 'color',
    defaultValue: 'goldenrod',
    contextVariable: ['feature'],
  },
})

// The channel shape a 5.0.0-beta.9 host keeps `color` in: an object whose
// `value` is the expression, with a bare string routed into it.
const channelSchema = ConfigurationSchema('ChannelLaneDisplay', {
  color: ConfigurationSchema(
    'ColorChannel',
    {
      value: {
        type: 'string',
        defaultValue: '',
        contextVariable: ['feature'],
      },
    },
    {
      preProcessSnapshot: snap =>
        typeof snap === 'string' ? { value: snap } : snap,
    },
  ),
})

function display(schema = displaySchema) {
  return { type: 'LinearBasicDisplay', configuration: schema.create({}) }
}

function view(id: string, trackId: string, d = display()) {
  return { id, tracks: [{ configuration: { trackId }, displays: [d] }] }
}

describe('referencePositionColor', () => {
  it('ramps hue over the domain and sends off-reference segments to charcoal', () => {
    expect(referencePositionColor({ start: 1000, end: 3000 })).toBe(
      "jexl:get(feature,'rank')>0 ? 'rgb(60,65,72)' : 'hsl(' + min(300, max(0, ((get(feature,'start')+get(feature,'end'))/2 - 1000) / 2000 * 300)) + ',70%,50%)'",
    )
  })
})

describe('sourceLaneDisplay', () => {
  it('finds the track in the paired view only', () => {
    const paired = display()
    const other = display()
    const views = [view('v1', 't', other), view('v2', 't', paired)]
    expect(sourceLaneDisplay(views, 'v2', 't')).toBe(paired)
    expect(sourceLaneDisplay(views, 'v3', 't')).toBeUndefined()
  })

  it('takes any view holding the track when the graph was never paired', () => {
    const d = display()
    const views = [{ id: 'graph' }, view('v1', 'other'), view('v2', 't', d)]
    expect(sourceLaneDisplay(views, undefined, 't')).toBe(d)
  })
})

describe('paintSourceLane', () => {
  it('writes the color once and leaves an unchanged one alone', () => {
    const d = display()
    const patches: unknown[] = []
    onPatch(d.configuration, patch => patches.push(patch))
    const color = referencePositionColor({ start: 0, end: 10 })
    paintSourceLane(d, color)
    expect(getSnapshot(d.configuration)).toMatchObject({ color })
    expect(patches).toHaveLength(1)
    paintSourceLane(d, color)
    expect(patches).toHaveLength(1)
  })

  it('reads a channel-shaped color back as painted', () => {
    const d = display(channelSchema)
    const patches: unknown[] = []
    onPatch(d.configuration, patch => patches.push(patch))
    const color = referencePositionColor({ start: 0, end: 10 })
    paintSourceLane(d, color)
    expect(getSnapshot(d.configuration)).toMatchObject({
      color: { value: color },
    })
    const written = patches.length
    expect(written).toBeGreaterThan(0)
    paintSourceLane(d, color)
    expect(patches).toHaveLength(written)
  })
})
