import { expect, test } from 'vitest'

import { extractTaxonId } from './util'

test('reads a flat UCSC-style metadata.taxId', () => {
  expect(extractTaxonId({ organism: 'Human', taxId: 9606 })).toBe(9606)
})

test('reads a nested GenArk-style metadata.ucsc.taxId', () => {
  expect(extractTaxonId({ blatDb: 'x', ucsc: { taxId: 10090 } })).toBe(10090)
})

test('accepts a taxonId alias and numeric strings', () => {
  expect(extractTaxonId({ taxonId: '7227' })).toBe(7227)
})

test('prefers the flat taxId over the nested one', () => {
  expect(extractTaxonId({ taxId: 9606, ucsc: { taxId: 10090 } })).toBe(9606)
})

test('returns undefined when absent or unparseable', () => {
  expect(extractTaxonId({})).toBeUndefined()
  expect(extractTaxonId({ taxId: 'notanumber' })).toBeUndefined()
  expect(extractTaxonId({ taxId: 0 })).toBeUndefined()
  expect(extractTaxonId(undefined)).toBeUndefined()
  expect(extractTaxonId(null)).toBeUndefined()
  expect(extractTaxonId('9606')).toBeUndefined()
})
