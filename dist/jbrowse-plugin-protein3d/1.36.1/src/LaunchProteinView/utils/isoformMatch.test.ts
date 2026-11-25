import { describe, expect, it } from 'vitest'

import { isoformMatch } from './isoformMatch'

const structureSequence = `${'M'.repeat(200)}*`

function ranked(identical: number | undefined, length = 393) {
  return {
    ranking: {
      matches: [{ id: 'same', length: 200 }],
      nonMatches: [{ id: 'other', length, identical, score: 1 }],
      noData: [],
    },
    structureSequence,
  }
}

describe('isoformMatch', () => {
  it('says nothing for an isoform that is the structure', () => {
    expect(isoformMatch({ ...ranked(190), selectedId: 'same' })).toBeUndefined()
  })

  it('counts identical residues against the ranked chain, stop codon aside', () => {
    expect(isoformMatch({ ...ranked(190), selectedId: 'other' })).toEqual({
      identical: 190,
      chainLength: 200,
      lowIdentity: false,
    })
  })

  it('flags identity under the floor over the shorter sequence', () => {
    expect(
      isoformMatch({ ...ranked(59), selectedId: 'other' })?.lowIdentity,
    ).toBe(true)
    expect(
      isoformMatch({ ...ranked(60), selectedId: 'other' })?.lowIdentity,
    ).toBe(false)
  })

  it('holds a short alignment to the stricter floor', () => {
    expect(
      isoformMatch({ ...ranked(15, 18), selectedId: 'other' })?.lowIdentity,
    ).toBe(false)
    expect(
      isoformMatch({ ...ranked(14, 18), selectedId: 'other' })?.lowIdentity,
    ).toBe(true)
    expect(
      isoformMatch({ ...ranked(4, 4), selectedId: 'other' })?.lowIdentity,
    ).toBe(true)
  })

  it('says nothing with no structure to compare against', () => {
    expect(
      isoformMatch({ ...ranked(undefined), selectedId: 'other' }),
    ).toBeUndefined()
    expect(
      isoformMatch({
        ...ranked(190),
        structureSequence: undefined,
        selectedId: 'other',
      }),
    ).toBeUndefined()
  })

  it('says nothing for a pair too large to align, which ranks with no identical residues', () => {
    expect(
      isoformMatch({
        ...ranked(0, 7000),
        structureSequence: 'M'.repeat(6000),
        selectedId: 'other',
      }),
    ).toBeUndefined()
  })

  it('still warns about an aligned pair with no identical residues', () => {
    expect(
      isoformMatch({ ...ranked(0), selectedId: 'other' })?.lowIdentity,
    ).toBe(true)
  })
})
