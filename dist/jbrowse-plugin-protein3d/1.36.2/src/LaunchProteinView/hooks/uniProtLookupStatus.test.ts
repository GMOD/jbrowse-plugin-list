import { describe, expect, it } from 'vitest'

import { describeOrganism } from './useUniProtIdLookup'
import { partialFailureNotice } from './useUniProtSearch'

describe('describeOrganism', () => {
  it('names the taxon and where it came from', () => {
    expect(describeOrganism(10090, 'assembly')).toBe(
      'Organism: 10090 (from assembly)',
    )
    expect(describeOrganism(9606, 'user')).toBe('Organism: 9606 (typed above)')
  })

  it('says every species is searched when no taxon is known', () => {
    expect(describeOrganism(undefined, 'assembly')).toBe(
      'Organism: unknown, showing all species; type an NCBI taxon id to narrow',
    )
  })
})

describe('partialFailureNotice', () => {
  it('reports how many sources failed', () => {
    expect(
      partialFailureNotice({ entries: [], attemptedCount: 3, failedCount: 2 }),
    ).toBe('UniProt lookup failed for 2 of 3 identifiers')
  })

  it('stays quiet when nothing failed, and when everything did', () => {
    expect(
      partialFailureNotice({ entries: [], attemptedCount: 3, failedCount: 0 }),
    ).toBeUndefined()
    // every source failing throws instead, so there is no partial to report
    expect(
      partialFailureNotice({ entries: [], attemptedCount: 2, failedCount: 2 }),
    ).toBeUndefined()
  })
})
