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
