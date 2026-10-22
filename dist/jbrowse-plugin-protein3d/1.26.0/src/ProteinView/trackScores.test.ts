import { expect, test } from 'vitest'

import { scoreByBase, scoreByResidue } from './trackScores'

const p2gCodon = { 0: [100, 101, 102], 1: [103, 104, 105], 2: [106, 107, 108] }
const bases = Object.values(p2gCodon).flat()

test('scores the coding bases an interval covers, and no others', () => {
  const scores = scoreByBase([{ start: 99, end: 104, score: 2 }], bases)
  expect([...scores.keys()].sort()).toEqual([100, 101, 102, 103])
})

test('a base under overlapping intervals takes the highest score, in any order', () => {
  const low = { start: 100, end: 103, score: 1 }
  const high = { start: 101, end: 102, score: 5 }
  expect(scoreByBase([low, high], bases)).toEqual(
    scoreByBase([high, low], bases),
  )
  expect(scoreByBase([low, high], bases).get(101)).toBe(5)
})

test('ignores an interval with no finite score', () => {
  expect(
    scoreByBase([{ start: 100, end: 110, score: Number.NaN }], bases).size,
  ).toBe(0)
})

test('reduces the three bases of a codon by the stat', () => {
  const baseScores = new Map([
    [100, 1],
    [101, 4],
    [102, 1],
  ])
  expect(scoreByResidue(p2gCodon, baseScores, 'mean').get(0)).toBe(2)
  expect(scoreByResidue(p2gCodon, baseScores, 'max').get(0)).toBe(4)
  expect(scoreByResidue(p2gCodon, baseScores, 'min').get(0)).toBe(1)
})

test('a codon with one scored base takes it, and one with none has no value', () => {
  const byPosition = scoreByResidue(p2gCodon, new Map([[104, -3]]), 'mean')
  expect(byPosition.get(1)).toBe(-3)
  expect(byPosition.has(0)).toBe(false)
  expect(byPosition.has(2)).toBe(false)
})

test('a codon split by an intron reads both pieces', () => {
  const split = { 0: [10, 11, 500] }
  const scores = scoreByBase(
    [
      { start: 10, end: 12, score: 2 },
      { start: 500, end: 501, score: 8 },
    ],
    [10, 11, 500],
  )
  expect(scoreByResidue(split, scores, 'mean').get(0)).toBe(4)
})
