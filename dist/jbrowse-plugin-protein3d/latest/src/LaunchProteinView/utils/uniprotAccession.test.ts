import { expect, test } from 'vitest'

import { isUniProtAccession } from './uniprotAccession'

test('accepts six- and ten-character accessions and an isoform suffix', () => {
  for (const id of ['P04637', 'Q9Y6K9', 'O15350', 'A0A024R1R8', 'P04637-2']) {
    expect(isUniProtAccession(id)).toBe(true)
  }
})

test('refuses a partial, padded, lower-case or foreign id', () => {
  for (const id of [
    '',
    'P0463',
    'P04637 ',
    'p04637',
    'P046377',
    'P04637-',
    'ENSG00000141510',
    '1TUP',
    'TP53',
  ]) {
    expect(isUniProtAccession(id)).toBe(false)
  }
})
