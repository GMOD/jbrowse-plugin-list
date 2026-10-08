import { expect, test } from 'vitest'

import { parseAlphaMissense } from './AlphaMissensePathogenicityAdapter'

test('parses well-formed rows, 1-based coord to half-open interval', () => {
  const rows = parseAlphaMissense(
    ['protein_variant,am_pathogenicity,am_class', 'V123L,0.98,pathogenic'].join(
      '\n',
    ),
  )
  expect(rows).toEqual([
    {
      uniqueId: 'feat-0',
      ref: 'V',
      variant: 'L',
      start: 122,
      end: 123,
      score: 0.98,
      am_class: 'pathogenic',
    },
  ])
})

test('handles multi-digit coordinates', () => {
  const [row] = parseAlphaMissense(['header', 'M1024K,0.1,benign'].join('\n'))
  expect(row).toMatchObject({ ref: 'M', variant: 'K', start: 1023, end: 1024 })
})

test('skips malformed rows instead of emitting position-0 features', () => {
  const rows = parseAlphaMissense(
    ['header', 'V10L,0.5,benign', 'garbage', ',,,', 'V20A,0.7,pathogenic'].join(
      '\n',
    ),
  )
  expect(rows.map(r => r.start)).toEqual([9, 19])
  expect(rows.every(r => !Number.isNaN(r.start))).toBe(true)
})

test('skips short variant strings that would parse to position 0', () => {
  const rows = parseAlphaMissense(['header', 'VL,0.5,benign'].join('\n'))
  expect(rows).toHaveLength(0)
})

test('ignores trailing blank lines', () => {
  const rows = parseAlphaMissense('header\nV1L,0.2,benign\n\n  \n')
  expect(rows).toHaveLength(1)
})
