import { nodeSizeOf, sizeOf } from './nodeSize'

test('a number is a uniform thickness, an object scales by its field', () => {
  expect(nodeSizeOf(9)).toEqual({ width: 'uniform', px: 9, links: 'uniform' })
  expect(nodeSizeOf({ field: 'depth', value: 4 })).toEqual({
    width: 'depth',
    px: 4,
    links: 'uniform',
  })
  expect(nodeSizeOf(undefined)).toEqual({
    width: 'depth',
    px: 6,
    links: 'uniform',
  })
  expect(nodeSizeOf({ value: 5, links: 'walks' })).toEqual({
    width: 'uniform',
    px: 5,
    links: 'walks',
  })
})

test.each([
  ['depth', 'uniform'],
  ['uniform', 'uniform'],
  ['depth', 'walks'],
  ['uniform', 'walks'],
] as const)('nodes %s, links %s survive the trip', (width, links) => {
  const size = { width, px: 5, links }
  expect(nodeSizeOf(sizeOf(size))).toEqual(size)
})
