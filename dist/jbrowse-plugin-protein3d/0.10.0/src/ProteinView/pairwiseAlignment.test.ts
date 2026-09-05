import { expect, test } from 'vitest'

import {
  MAX_ALIGNMENT_CELLS,
  alignmentTooLarge,
  needlemanWunsch,
  runLocalAlignment,
  smithWaterman,
} from './pairwiseAlignment'

test('needlemanWunsch - identical sequences', () => {
  const result = needlemanWunsch('ACGT', 'ACGT')
  expect(result.alignedSeq1).toBe('ACGT')
  expect(result.alignedSeq2).toBe('ACGT')
})

test('needlemanWunsch - simple protein alignment', () => {
  const result = needlemanWunsch('MKAA', 'MKAA')
  expect(result.alignedSeq1).toBe('MKAA')
  expect(result.alignedSeq2).toBe('MKAA')
  expect(result.score).toBeGreaterThan(0)
})

test('needlemanWunsch - with gaps', () => {
  const result = needlemanWunsch('MKAAYLSMFG', 'MKAYLSMFG')
  expect(result.alignedSeq1.replace(/-/g, '')).toBe('MKAAYLSMFG')
  expect(result.alignedSeq2.replace(/-/g, '')).toBe('MKAYLSMFG')
  expect(result.alignedSeq1.length).toBe(result.alignedSeq2.length)
})

test('needlemanWunsch - different length sequences', () => {
  const result = needlemanWunsch('MKAAYLSMFGKED', 'MKAYLSMFG')
  expect(result.alignedSeq1.length).toBe(result.alignedSeq2.length)
})

test('smithWaterman - identical sequences', () => {
  const result = smithWaterman('MKAA', 'MKAA')
  expect(result.alignedSeq1).toBe('MKAA')
  expect(result.alignedSeq2).toBe('MKAA')
})

test('smithWaterman - local alignment finds best match', () => {
  const result = smithWaterman('XXXMKAAYYY', 'MKAA')
  expect(result.alignedSeq1.length).toBe(result.alignedSeq2.length)
})

test('runLocalAlignment - returns PairwiseAlignment format', () => {
  const result = runLocalAlignment('MKAA', 'MKAA', 'needleman_wunsch')
  expect(result.consensus).toBeDefined()
  expect(result.alns).toHaveLength(2)
  expect(result.alns[0].id).toBe('a')
  expect(result.alns[1].id).toBe('b')
  expect(result.alns[0].seq).toBe('MKAA')
  expect(result.alns[1].seq).toBe('MKAA')
  expect(result.consensus).toBe('||||')
})

test('runLocalAlignment - consensus marks gaps correctly', () => {
  const result = runLocalAlignment(
    'MKAYLSMFG',
    'MKAAYLSMFG',
    'needleman_wunsch',
  )
  expect(result.consensus).not.toContain('|||||||||')
  expect(result.consensus).toContain(' ')
})

test('lowercase residues score the same as uppercase', () => {
  expect(needlemanWunsch('mkaa', 'MKAA').score).toBe(
    needlemanWunsch('MKAA', 'MKAA').score,
  )
})

test('residues outside the BLOSUM alphabet fall back to the unknown-pair score', () => {
  // '?' isn't in the matrix; both directions must agree and stay finite
  const a = needlemanWunsch('M?AA', 'MKAA')
  expect(a.alignedSeq1.length).toBe(a.alignedSeq2.length)
  expect(Number.isFinite(a.score)).toBe(true)
  expect(needlemanWunsch('MKAA', 'M?AA').score).toBe(a.score)
})

// The DP is O(m*n) time and holds a byte of traceback per cell, on the main
// thread. Without a ceiling a titin-sized sequence hangs or OOMs the tab.
test('refuses an alignment whose DP table would exceed the cell limit', () => {
  const side = Math.ceil(Math.sqrt(MAX_ALIGNMENT_CELLS)) + 1
  expect(alignmentTooLarge(side, side)).toBe(true)
  expect(alignmentTooLarge(2500, 2500)).toBe(false)
  // constructing the strings is cheap next to the table they'd imply
  const long = 'A'.repeat(side)
  expect(() => needlemanWunsch(long, long)).toThrow(/too long to align/)
  expect(() => smithWaterman(long, long)).toThrow(/too long to align/)
})

test('runLocalAlignment - handles real protein sequences', () => {
  const seq1 = 'MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG'
  const seq2 = 'MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG'
  const result = runLocalAlignment(seq1, seq2, 'needleman_wunsch')
  expect(result.alns[0].seq).toBe(seq1)
  expect(result.alns[1].seq).toBe(seq2)
  expect(result.consensus).toBe('|'.repeat(seq1.length))
})
