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
  expect(rulerTicks(map, 25, pos => pos + 1)).toEqual([
    { col: 5 }, // residue 5 sits at column 5 after the gap
    { col: 10, label: '10' },
    { col: 15 },
    { col: 20, label: '20' },
  ])
})

test('ticks follow the author numbering, not the position', () => {
  // 1TUP's p53 chain: position 0 is residue 94, so the first round number the
  // ruler can label is 100, at position 6
  const map: Record<number, number> = {}
  for (let col = 0; col < 12; col++) {
    map[col] = col
  }
  expect(rulerTicks(map, 12, pos => pos + 94)).toEqual([
    { col: 1 }, // 95
    { col: 6, label: '100' },
    { col: 11 }, // 105
  ])
})

test('no alignment gives no ticks', () => {
  expect(rulerTicks(undefined, 10, pos => pos + 1)).toEqual([])
})
