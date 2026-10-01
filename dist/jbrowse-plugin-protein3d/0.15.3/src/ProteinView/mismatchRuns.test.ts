import { expect, test } from 'vitest'

import { mismatchRuns } from './mismatchRuns'

function alignment(transcript: string, structure: string, consensus: string) {
  return { alns: [{ seq: transcript }, { seq: structure }], consensus }
}

test('an identical alignment shades nothing', () => {
  expect(mismatchRuns(alignment('MEEPQ', 'MEEPQ', '|||||'))).toEqual([])
})

test('gaps are left to the dash, whichever row carries it', () => {
  expect(mismatchRuns(alignment('MEE-Q', '-EEPQ', ' || |'))).toEqual([])
})

test('adjacent substitutions of one kind form one run', () => {
  // I/L and V/I are conservative (BLOSUM62 > 0), W/G is not
  expect(mismatchRuns(alignment('AIVWGK', 'ALIGWK', '|::  |'))).toEqual([
    { start: 1, end: 3, kind: 'similar' },
    { start: 3, end: 5, kind: 'different' },
  ])
})

test('case does not make a residue different', () => {
  expect(mismatchRuns(alignment('mEEPQ', 'MEEPq', ' |||| '))).toEqual([])
})
