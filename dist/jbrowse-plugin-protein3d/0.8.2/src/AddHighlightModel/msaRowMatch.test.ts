import { expect, test } from 'vitest'

import { findStructureRowName, ungap } from './msaRowMatch'

test('ungap strips both gap characters', () => {
  expect(ungap('A-T.G-C')).toBe('ATGC')
  expect(ungap('MKV')).toBe('MKV')
})

test('matches the row whose ungapped sequence equals the structure', () => {
  const rowMap = new Map([
    ['query', 'MK-VLAA'], // ungaps to MKVLAA
    ['homolog1', 'MKIVLAA'],
    ['homolog2', 'MK.VLAA'], // ungaps to MKVLAA too, but query comes first
  ])
  expect(findStructureRowName(rowMap, 'MKVLAA')).toBe('query')
})

test('returns undefined when no row matches (so caller falls back to 1:1)', () => {
  const rowMap = new Map([['query', 'MKVLAA']])
  expect(findStructureRowName(rowMap, 'DIFFERENT')).toBeUndefined()
})

test('returns undefined for missing rowMap or sequence', () => {
  expect(findStructureRowName(undefined, 'MKV')).toBeUndefined()
  expect(findStructureRowName(new Map(), undefined)).toBeUndefined()
})
