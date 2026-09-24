import { describe, expect, it } from 'vitest'

import getSearchDescription from './getSearchDescription'

describe('getSearchDescription', () => {
  it('returns database ID description for specific ID', () => {
    expect(
      getSearchDescription({
        selectedQueryId: 'ENST00000123',
        recognizedIds: ['ENST00000123', 'NM_001'],
        geneName: 'BRCA1',
      }),
    ).toBe('database ID "ENST00000123"')
  })

  it('returns gene name description for gene: prefix', () => {
    expect(
      getSearchDescription({
        selectedQueryId: 'gene:BRCA1',
        recognizedIds: ['ENST00000123'],
        geneName: 'BRCA1',
      }),
    ).toBe('gene name "BRCA1"')
  })

  it('returns combined description for auto with both IDs and gene name', () => {
    expect(
      getSearchDescription({
        selectedQueryId: 'auto',
        recognizedIds: ['ENST00000123', 'NM_001'],
        geneName: 'BRCA1',
      }),
    ).toBe('database IDs "ENST00000123", "NM_001" and gene name "BRCA1"')
  })

  it('returns only database ID description for auto without gene name', () => {
    expect(
      getSearchDescription({
        selectedQueryId: 'auto',
        recognizedIds: ['ENST00000123'],
        geneName: undefined,
      }),
    ).toBe('database ID "ENST00000123"')
  })

  it('returns only gene name description for auto without IDs', () => {
    expect(
      getSearchDescription({
        selectedQueryId: 'auto',
        recognizedIds: [],
        geneName: 'BRCA1',
      }),
    ).toBe('gene name "BRCA1"')
  })

  it('uses "or" join word when specified', () => {
    expect(
      getSearchDescription({
        selectedQueryId: 'auto',
        recognizedIds: ['ENST00000123'],
        geneName: 'BRCA1',
        joinWord: 'or',
      }),
    ).toBe('database ID "ENST00000123" or gene name "BRCA1"')
  })
})
