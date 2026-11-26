import { expect, test } from 'vitest'

import { parseCuts, thresholdRange } from './thresholdPalette'

test('a range has one color per interval, red lowest', () => {
  for (const n of [1, 2, 3, 4, 5, 7]) {
    expect(thresholdRange(n)).toHaveLength(n)
  }
  expect(thresholdRange(3)[0]).toBe('#d7191c')
  expect(thresholdRange(6)[0]).toBe('rgb(215, 25, 28)')
  expect(thresholdRange(6).at(-1)).toBe('rgb(44, 123, 182)')
})

test('cuts are numbers, each above the last', () => {
  expect(parseCuts('-1.328, -0.748')).toEqual([-1.328, -0.748])
  expect(parseCuts('1 2;3')).toEqual([1, 2, 3])
  expect(parseCuts('2, 1')).toBeUndefined()
  expect(parseCuts('1, a')).toBeUndefined()
  expect(parseCuts('')).toBeUndefined()
})
