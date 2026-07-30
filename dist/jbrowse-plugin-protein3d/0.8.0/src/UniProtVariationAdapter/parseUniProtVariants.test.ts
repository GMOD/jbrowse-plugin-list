import { expect, test } from 'vitest'

import { parseUniProtVariants } from './UniProtVariationAdapter'

const variant = {
  begin: '10',
  end: '10',
  wildType: 'V',
  mutatedType: 'L',
  xrefs: [],
  predictions: [{ score: 0.7 }],
  populationFrequencies: [{ frequency: 0.01 }],
  descriptions: [{ value: 'test variant' }],
}

test('1-based inclusive begin/end become a 0-based half-open interval', () => {
  const [row] = parseUniProtVariants([variant], 'variant_impact_score')
  expect(row).toMatchObject({ start: 9, end: 10, score: 0.7 })
})

test('multi-residue span keeps the half-open end', () => {
  const [row] = parseUniProtVariants(
    [{ ...variant, begin: '5', end: '8' }],
    'none',
  )
  expect(row).toMatchObject({ start: 4, end: 8 })
})

test('score follows the configured scoreField', () => {
  const [freq] = parseUniProtVariants([variant], 'population_frequency')
  expect(freq.score).toBe(0.01)
  const [none] = parseUniProtVariants([variant], 'none')
  expect(none.score).toBeUndefined()
})

test('deletion (no mutatedType) is named ->del', () => {
  const [row] = parseUniProtVariants(
    [{ ...variant, mutatedType: '' }],
    'none',
  )
  expect(row.name).toEqual(['V->del'])
})
