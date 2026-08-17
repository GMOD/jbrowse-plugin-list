import { expect, test } from 'vitest'

import { parseAlphaFoldConfidence } from './AlphaFoldConfidenceAdapter'

test('1-based residueNumber becomes a 0-based half-open interval', () => {
  const rows = parseAlphaFoldConfidence({
    residueNumber: [1, 2, 3],
    confidenceScore: [90, 80, 70],
  })
  expect(rows).toEqual([
    { uniqueId: 'feat-0', start: 0, end: 1, score: 90 },
    { uniqueId: 'feat-1', start: 1, end: 2, score: 80 },
    { uniqueId: 'feat-2', start: 2, end: 3, score: 70 },
  ])
})

test('handles a gapped/renumbered residueNumber sequence', () => {
  const rows = parseAlphaFoldConfidence({
    residueNumber: [10, 42],
    confidenceScore: [55, 44],
  })
  expect(rows.map(r => [r.start, r.end])).toEqual([
    [9, 10],
    [41, 42],
  ])
})
