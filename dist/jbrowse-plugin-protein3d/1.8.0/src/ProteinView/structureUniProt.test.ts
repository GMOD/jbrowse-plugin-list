import { expect, test } from 'vitest'

import { structureUniProt } from './structureUniProt'

const none = {
  uniProtMappings: undefined,
  uniProtMappingsError: undefined,
  mappedEntity: undefined,
}

test('an AlphaFold model is its UniProt entry, position for position', () => {
  const entry = structureUniProt({
    ...none,
    uniprotId: 'P04637',
    pdbId: undefined,
  })
  expect(entry.uniprotId).toBe('P04637')
  expect(entry.isLoading).toBe(false)
  expect(entry.mapUniProtPosition(248)).toBe(247)
})

// 1TUP's position 154 is residue 248: named beside its accession, the entry
// used to take the 1:1 map and draw every UniProt feature 94 residues off
test('a PDB entry named beside an accession still waits on SIFTS', () => {
  const entry = structureUniProt({
    ...none,
    uniprotId: 'P04637',
    pdbId: '1tup',
  })
  expect(entry.uniprotId).toBeUndefined()
  expect(entry.isLoading).toBe(true)
})

// The loader opens AF-P04637-7 for the Δ133 transcript while the view keeps
// P04637, and the launch dialog can hand over the isoform file with no
// accession at all. Either way the entry's features are not the file's.
test('an isoform model withholds the features of its entry rather than misplacing them', () => {
  for (const uniprotId of ['P04637', 'P04637-7']) {
    const entry = structureUniProt({
      ...none,
      uniprotId,
      pdbId: undefined,
      modelAccession: 'P04637-7',
    })
    expect(entry.uniprotId).toBe('P04637')
    expect(entry.isoformAccession).toBe('P04637-7')
    expect(entry.mapUniProtPosition(248)).toBeUndefined()
  }
})

test("the entry's own model, and a user's fold given an accession, keep the 1:1 map", () => {
  for (const modelAccession of ['P04637', undefined]) {
    const entry = structureUniProt({
      ...none,
      uniprotId: 'P04637',
      pdbId: undefined,
      modelAccession,
    })
    expect(entry.isoformAccession).toBeUndefined()
    expect(entry.mapUniProtPosition(248)).toBe(247)
  }
})
