import { nodeSizeOf, sizeOfNodeWidth } from './nodeSize'

test('a number is a uniform thickness, an object scales by its field', () => {
  expect(nodeSizeOf(9)).toEqual({ width: 'uniform', px: 9 })
  expect(nodeSizeOf({ field: 'depth', value: 4 })).toEqual({
    width: 'depth',
    px: 4,
  })
  expect(nodeSizeOf(undefined)).toEqual({ width: 'depth', px: 6 })
})

test.each(['depth', 'uniform'] as const)('%s survives the trip', width => {
  expect(nodeSizeOf(sizeOfNodeWidth(width, 5))).toEqual({ width, px: 5 })
})
