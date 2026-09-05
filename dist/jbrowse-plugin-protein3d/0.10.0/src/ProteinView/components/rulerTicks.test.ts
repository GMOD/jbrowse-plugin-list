import { expect, test } from 'vitest'

import { rulerTicks } from './AlignmentRuler'

test('labels every tenth residue and ticks every fifth, in alignment columns', () => {
  // a gap at column 3 shifts structure positions right by one
  const map: Record<number, number> = {}
  for (let col = 0; col < 25; col++) {
    if (col !== 3) {
      map[col] = col < 3 ? col : col - 1
    }
  }
  expect(rulerTicks(map, 25)).toEqual([
    { col: 5 }, // residue 5 sits at column 5 after the gap
    { col: 10, label: '10' },
    { col: 15 },
    { col: 20, label: '20' },
  ])
})

test('no alignment gives no ticks', () => {
  expect(rulerTicks(undefined, 10)).toEqual([])
})
