import { expect, test } from 'vitest'

import {
  extractPerResidueConfidence,
  looksLikePlddt,
} from './extractPerResidueConfidence'

function fakeModel(bfactors: number[]) {
  return {
    obj: {
      data: {
        atomicConformation: {
          B_iso_or_equiv: { value: (row: number) => bfactors[row]! },
        },
        atomicHierarchy: {
          // one atom per residue: residue i starts at atom i
          residueAtomSegments: {
            offsets: bfactors.map((_, i) => i),
            count: bfactors.length,
          },
        },
      },
    },
  }
}

test('extracts one B-factor per residue', () => {
  expect(extractPerResidueConfidence(fakeModel([90, 80, 40]))).toEqual([
    90, 80, 40,
  ])
})

test('caps to maxLength so other chains do not bleed in', () => {
  expect(extractPerResidueConfidence(fakeModel([90, 80, 40, 10]), 2)).toEqual([
    90, 80,
  ])
})

test('returns undefined when model data is missing', () => {
  expect(extractPerResidueConfidence({})).toBeUndefined()
})

test('looksLikePlddt accepts varying [0,100] values', () => {
  expect(looksLikePlddt([90, 40, 70])).toBe(true)
})

test('looksLikePlddt rejects constant, empty, or out-of-range', () => {
  expect(looksLikePlddt([50, 50, 50])).toBe(false) // constant B-factors
  expect(looksLikePlddt([120, 30])).toBe(false) // out of pLDDT range
  expect(looksLikePlddt([42])).toBe(false) // too short
  expect(looksLikePlddt(undefined)).toBe(false)
})
