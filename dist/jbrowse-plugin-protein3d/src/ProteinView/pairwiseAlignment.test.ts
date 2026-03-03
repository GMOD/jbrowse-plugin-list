import { expect, test } from 'vitest'

import {
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

test('runLocalAlignment - handles real protein sequences', () => {
  const seq1 = 'MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG'
  const seq2 = 'MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG'
  const result = runLocalAlignment(seq1, seq2)
  expect(result.alns[0].seq).toBe(seq1)
  expect(result.alns[1].seq).toBe(seq2)
  expect(result.consensus).toBe('|'.repeat(seq1.length))
})
