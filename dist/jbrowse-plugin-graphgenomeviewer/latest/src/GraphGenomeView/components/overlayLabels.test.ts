import { placeLabels } from './overlayLabels'

const frame = { width: 400, height: 300 }

test('a label that lands on a placed one, or off the pane, is dropped', () => {
  const placed = placeLabels(
    [
      { item: 'a', x: 100, y: 50, text: 'first' },
      { item: 'b', x: 110, y: 52, text: 'second' },
      { item: 'c', x: 300, y: 50, text: 'third' },
      { item: 'd', x: 900, y: 50, text: 'off' },
    ],
    frame,
  )
  expect(placed.map(p => p.item)).toEqual(['a', 'c'])
  expect(placed[0]!.w).toBeGreaterThan(0)
})

test('a reserved box keeps labels out of a corner', () => {
  const placed = placeLabels(
    [{ item: 'a', x: 380, y: 20, text: 'legend' }],
    frame,
    [{ x0: 300, x1: 400, y0: 0, y1: 60 }],
  )
  expect(placed).toEqual([])
})

test('a stacking label steps down past a taken spot', () => {
  const placed = placeLabels(
    [
      { item: 'a', x: 100, y: 50, text: 'first' },
      { item: 'b', x: 100, y: 50, text: 'second', stack: 3 },
      { item: 'c', x: 100, y: 50, text: 'third', stack: 3 },
    ],
    frame,
  )
  expect(placed.map(p => [p.item, p.y])).toEqual([
    ['a', 50],
    ['b', 69],
    ['c', 88],
  ])
})

test('a stack near the bottom edge grows upward', () => {
  const placed = placeLabels(
    [
      { item: 'a', x: 100, y: 280, text: 'first' },
      { item: 'b', x: 100, y: 280, text: 'second', stack: 3 },
    ],
    frame,
  )
  expect(placed.map(p => [p.item, p.y])).toEqual([
    ['a', 280],
    ['b', 261],
  ])
})
