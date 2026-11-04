import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test } from 'vitest'

import { featureFilterLabel, passesFeatureFilter } from './featureFields'

// @gmod/vcf reads a FILTER column of PASS as the string 'PASS', of failed
// filters as a list of their names, and of '.' as nothing at all
function record(FILTER: string | string[] | undefined, INFO = {}) {
  return new SimpleFeature({
    uniqueId: 'r',
    refName: 'chr1',
    start: 100,
    end: 101,
    REF: 'A',
    ALT: ['G'],
    QUAL: 40,
    ...(FILTER === undefined ? {} : { FILTER }),
    INFO,
  })
}

const pass = [{ field: 'FILTER', equal: 'PASS' }]

test('FILTER equal PASS keeps a passing record and drops a failing or unfiltered one', () => {
  expect(passesFeatureFilter(record('PASS'), pass)).toBe(true)
  expect(
    passesFeatureFilter(record(['VQSRTrancheSNP99.00to99.90']), pass),
  ).toBe(false)
  expect(passesFeatureFilter(record(undefined), pass)).toBe(false)
})

test('a list passes equal and oneOf when any entry does', () => {
  const failed = record(['LowQual', 'VQSRTrancheSNP99.90to100.00'])
  expect(
    passesFeatureFilter(failed, [{ field: 'FILTER', equal: 'LowQual' }]),
  ).toBe(true)
  expect(
    passesFeatureFilter(failed, [
      { field: 'FILTER', oneOf: ['PASS', 'LowQual'] },
    ]),
  ).toBe(true)
  expect(
    passesFeatureFilter(failed, [{ field: 'FILTER', oneOf: ['PASS'] }]),
  ).toBe(false)
})

test("bounds test a field's number as scoreField reads it, a list's highest", () => {
  const site = record('PASS', { AF: [0.002, 0.3], DP: '25' })
  expect(passesFeatureFilter(site, [{ field: 'INFO.AF', gte: 0.05 }])).toBe(
    true,
  )
  expect(passesFeatureFilter(site, [{ field: 'INFO.AF', lt: 0.05 }])).toBe(
    false,
  )
  expect(
    passesFeatureFilter(site, [{ field: 'INFO.DP', range: [20, 30] }]),
  ).toBe(true)
  expect(passesFeatureFilter(site, [{ field: 'QUAL', equal: 40 }])).toBe(true)
  expect(passesFeatureFilter(site, [{ field: 'INFO.DP', equal: 25 }])).toBe(
    true,
  )
})

test('a field the record lacks passes no test', () => {
  const site = record('PASS')
  expect(passesFeatureFilter(site, [{ field: 'INFO.AF', lte: 1 }])).toBe(false)
  expect(passesFeatureFilter(site, [{ field: 'INFO.AF', gte: 0 }])).toBe(false)
})

test('every predicate must pass', () => {
  const site = record('PASS', { AF: [0.01] })
  expect(
    passesFeatureFilter(site, [...pass, { field: 'INFO.AF', gte: 0.05 }]),
  ).toBe(false)
  expect(passesFeatureFilter(site, [])).toBe(true)
})

test('a filter reads as a legend phrase', () => {
  expect(
    featureFilterLabel([
      { field: 'FILTER', oneOf: ['PASS', 'LowQual'] },
      { field: 'INFO.AF', range: [0.01, 0.5] },
      { field: 'QUAL', gt: 30, lte: 100 },
    ]),
  ).toBe('FILTER = PASS or LowQual, INFO.AF 0.01–0.5, QUAL > 30, QUAL ≤ 100')
})
