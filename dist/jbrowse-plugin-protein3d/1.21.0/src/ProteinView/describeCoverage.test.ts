import { expect, test } from 'vitest'

import { describeCoverage } from './describeCoverage'

import type { AlignmentQuality } from 'p2s_mapper'

function quality(q: Partial<AlignmentQuality>): AlignmentQuality {
  return {
    aligned: 0,
    identical: 0,
    transcriptLength: 0,
    structureLength: 0,
    identity: 0,
    identityOverShorter: 0,
    structureCoverage: 0,
    transcriptStart: 0,
    transcriptEnd: 0,
    ...q,
  }
}

test('a full-length model covers the whole transcript and all of itself', () => {
  expect(
    describeCoverage(
      quality({
        aligned: 393,
        transcriptLength: 393,
        structureLength: 393,
        identity: 1,
        transcriptStart: 1,
        transcriptEnd: 393,
      }),
    ),
  ).toBe('100% identity · whole transcript')
})

test('a fragment names the transcript residues it holds', () => {
  // 1TUP chain A against p53
  expect(
    describeCoverage(
      quality({
        aligned: 219,
        transcriptLength: 393,
        structureLength: 219,
        identity: 1,
        transcriptStart: 94,
        transcriptEnd: 312,
      }),
    ),
  ).toBe('100% identity · transcript 94–312 (219 of 393)')
})

test('structure residues the alignment leaves out are counted', () => {
  expect(
    describeCoverage(
      quality({
        aligned: 172,
        transcriptLength: 189,
        structureLength: 173,
        identity: 0.99,
        transcriptStart: 1,
        transcriptEnd: 172,
      }),
    ),
  ).toBe(
    '99% identity · transcript 1–172 (172 of 189) · 172 of 173 structure residues',
  )
})

test('nothing aligned says so', () => {
  expect(describeCoverage(quality({}))).toBe('no residues aligned')
})
