import { expect, test } from 'vitest'

import { matchRuns } from './SplitString'

test('empty', () => {
  expect(matchRuns([])).toEqual([])
})

test('collapses a contiguous block to one run', () => {
  expect(matchRuns([0, 1, 2, 3])).toEqual([{ start: 0, end: 4 }])
})

test('splits on gaps and sorts unordered input', () => {
  expect(matchRuns([5, 1, 0, 6, 2])).toEqual([
    { start: 0, end: 3 },
    { start: 5, end: 7 },
  ])
})

test('isolated columns each become their own single-wide run', () => {
  expect(matchRuns([0, 2, 4])).toEqual([
    { start: 0, end: 1 },
    { start: 2, end: 3 },
    { start: 4, end: 5 },
  ])
})
