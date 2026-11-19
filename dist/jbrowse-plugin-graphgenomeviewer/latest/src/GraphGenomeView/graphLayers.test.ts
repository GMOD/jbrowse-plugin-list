import { LABEL_DEFAULTS } from '@jbrowse/bandage-core/graphLabels'

import { layersOf, withLayer } from './graphLayers'

test('unset draws the default layers, and a stated one overrides its own', () => {
  expect([...layersOf(undefined)]).toEqual([
    'deletions',
    'genes',
    'referenceStrip',
  ])
  expect([...layersOf({ bubbles: true, genes: false })]).toEqual([
    'bubbles',
    'deletions',
    'referenceStrip',
  ])
})

test('a toggle states only what differs from the defaults', () => {
  expect(withLayer(undefined, 'bubbles', true)).toEqual({ bubbles: true })
  expect(withLayer({ bubbles: true }, 'bubbles', false)).toEqual({})
  expect(withLayer({}, 'genes', false)).toEqual({ genes: false })
})

test("node lengths are off unless turned on, as core's label defaults have them", () => {
  expect(LABEL_DEFAULTS.nodeLengths).toBe(false)
  expect(layersOf(undefined).has('lengths')).toBe(false)
  expect(layersOf({ lengths: true }).has('lengths')).toBe(true)
  expect(withLayer(undefined, 'lengths', true)).toEqual({ lengths: true })
})
