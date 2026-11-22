import { LABEL_DEFAULTS } from '@jbrowse/bandage-core/graphLabels'

import { layersOf, withLayer } from './graphLayers'

test('unset draws the default layers, and a stated one overrides its own', () => {
  expect([...layersOf({ lengths: false })]).toEqual([
    'deletions',
    'genes',
    'referenceStrip',
  ])
  expect([...layersOf({ bubbles: true, genes: false, lengths: true })]).toEqual(
    ['bubbles', 'deletions', 'lengths', 'referenceStrip'],
  )
})

test('a toggle states only what differs from the defaults', () => {
  expect(withLayer(undefined, 'bubbles', true)).toEqual({ bubbles: true })
  expect(withLayer({ bubbles: true }, 'bubbles', false)).toEqual({})
  expect(withLayer({}, 'genes', false)).toEqual({ genes: false })
})

test("node lengths follow core's label default unless stated", () => {
  const byDefault = LABEL_DEFAULTS.nodeLengths
  expect(layersOf(undefined).has('lengths')).toBe(byDefault)
  expect(layersOf({ lengths: !byDefault }).has('lengths')).toBe(!byDefault)
  expect(withLayer(undefined, 'lengths', byDefault)).toEqual({})
  expect(withLayer(undefined, 'lengths', !byDefault)).toEqual({
    lengths: !byDefault,
  })
})
