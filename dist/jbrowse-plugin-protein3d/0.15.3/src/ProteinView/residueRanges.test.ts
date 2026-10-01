import { makeCoordinateMapper } from 'p2s_mapper'
import { expect, test } from 'vitest'

import {
  positionRangeRuns,
  positionRuns,
  rangeList,
  residueRuns,
  transcriptRuns,
} from './residueRanges'

test('positionRuns of nothing is empty', () => {
  expect(positionRuns([])).toEqual([])
})

test('positionRuns collapses a contiguous block to one run', () => {
  expect(positionRuns([0, 1, 2, 3])).toEqual([{ start: 0, end: 4 }])
})

test('positionRuns splits on gaps, sorts, and ignores repeats', () => {
  expect(positionRuns([5, 1, 0, 6, 2, 1])).toEqual([
    { start: 0, end: 3 },
    { start: 5, end: 7 },
  ])
})

test('rangeList takes the single-range form saved sessions carry', () => {
  expect(rangeList({ start: 1, end: 2 })).toEqual([{ start: 1, end: 2 }])
  expect(rangeList([{ start: 1, end: 2 }])).toEqual([{ start: 1, end: 2 }])
  expect(rangeList(undefined)).toEqual([])
})

test('positionRangeRuns merges overlapping and touching ranges', () => {
  expect(
    positionRangeRuns([
      { start: 8, end: 10 },
      { start: 0, end: 3 },
      { start: 2, end: 5 },
      { start: 5, end: 6 },
    ]),
  ).toEqual([
    { start: 0, end: 6 },
    { start: 8, end: 10 },
  ])
})

// 2RH1: the receptor numbered 1..230 and 263.., with T4 lysozyme spliced into
// the loop between and numbered 1002.. by its depositors
const fusion = {
  entityId: '1',
  seq: 'RRRLLLRRR',
  seqIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  authSeqIds: [228, 229, 230, 1002, 1003, 1004, 263, 264, 265],
  chains: ['A'],
}

test('residueRuns selects either side of a fusion partner, not the partner', () => {
  expect(residueRuns(fusion, { start: 229, end: 264 })).toEqual([
    { start: 1, end: 3 },
    { start: 6, end: 8 },
  ])
})

test('residueRuns takes several ranges, and a typo selects nothing', () => {
  expect(
    residueRuns(fusion, [
      { start: 228, end: 228 },
      { start: 265, end: 265 },
    ]),
  ).toEqual([
    { start: 0, end: 1 },
    { start: 8, end: 9 },
  ])
  expect(residueRuns(fusion, { start: 500, end: 600 })).toEqual([])
  expect(residueRuns(undefined, { start: 228, end: 265 })).toEqual([])
})

test('transcriptRuns selects what the transcript pairs with, split where the structure has an insert', () => {
  // transcript ACDEFG; the structure carries a two-residue tag between D and E
  const mapper = makeCoordinateMapper({
    consensus: '|||  |||',
    alns: [
      { id: 'transcript', seq: 'ACD--EFG' },
      { id: 'structure', seq: 'ACDXXEFG' },
    ],
  })
  expect(transcriptRuns(mapper, { start: 2, end: 5 })).toEqual([
    { start: 1, end: 3 },
    { start: 5, end: 7 },
  ])
  expect(
    transcriptRuns(mapper, [
      { start: 1, end: 1 },
      { start: 6, end: 6 },
    ]),
  ).toEqual([
    { start: 0, end: 1 },
    { start: 7, end: 8 },
  ])
})
