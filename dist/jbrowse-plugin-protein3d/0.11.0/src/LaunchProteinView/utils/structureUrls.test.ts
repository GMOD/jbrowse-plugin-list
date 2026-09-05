import { expect, test } from 'vitest'

import {
  getAlphaFoldStructureUrl,
  getPdbIdFromUrl,
  getPdbStructureUrl,
  resolveStructureUrl,
  structureDisplayLabel,
} from './structureUrls'

test('recognizes pdb archive urls', () => {
  expect(getPdbIdFromUrl(getPdbStructureUrl('1TUP'))).toBe('1tup')
  expect(getPdbIdFromUrl('https://files.rcsb.org/download/4hhb.cif')).toBe(
    '4hhb',
  )
  expect(
    getPdbIdFromUrl('https://files.rcsb.org/download/pdb1tup.ent.gz'),
  ).toBe('1tup')
  expect(
    getPdbIdFromUrl(
      'https://www.ebi.ac.uk/pdbe/entry-files/download/1tup_updated.cif',
    ),
  ).toBe('1tup')
})

test('ignores non-pdb urls', () => {
  // an alphafold model is handled by its own uniprot-id parser
  expect(getPdbIdFromUrl(getAlphaFoldStructureUrl('P04637'))).toBeUndefined()
  // a user file that merely looks like a pdb id must not inherit annotations
  expect(getPdbIdFromUrl('https://example.com/data/1tup.cif')).toBeUndefined()
  expect(
    getPdbIdFromUrl('https://files.rcsb.org/download/mymodel.cif'),
  ).toBeUndefined()
  // pdb ids never start with 0
  expect(
    getPdbIdFromUrl('https://files.rcsb.org/download/0abc.cif'),
  ).toBeUndefined()
  expect(getPdbIdFromUrl('not a url')).toBeUndefined()
})

test('resolveStructureUrl: an explicit url wins over any shorthand', () => {
  expect(
    resolveStructureUrl({ url: 'https://e.com/x.cif', uniprotId: 'P04637' }),
  ).toBe('https://e.com/x.cif')
})

test('resolveStructureUrl: inline data suppresses the shorthand', () => {
  // a structure supplied as data has no url, and must not acquire one
  expect(
    resolveStructureUrl({ data: 'ATOM...', pdbId: '1TUP' }),
  ).toBeUndefined()
})

test('resolveStructureUrl: uniprotId resolves to the AlphaFold model', () => {
  expect(resolveStructureUrl({ uniprotId: 'P04637' })).toBe(
    getAlphaFoldStructureUrl('P04637'),
  )
})

test('resolveStructureUrl: pdbId resolves to the RCSB mmCIF', () => {
  expect(resolveStructureUrl({ pdbId: '1TUP' })).toBe(
    getPdbStructureUrl('1TUP'),
  )
})

test('resolveStructureUrl: uniprotId takes precedence over pdbId', () => {
  expect(resolveStructureUrl({ uniprotId: 'P04637', pdbId: '1TUP' })).toBe(
    getAlphaFoldStructureUrl('P04637'),
  )
})

test('resolveStructureUrl is idempotent over an already-resolved spec', () => {
  const once = resolveStructureUrl({ pdbId: '1TUP' })
  expect(resolveStructureUrl({ url: once })).toBe(once)
})

test('resolveStructureUrl: nothing to go on yields undefined', () => {
  expect(resolveStructureUrl({})).toBeUndefined()
})

test('structureDisplayLabel names a structure by its id, else its file', () => {
  expect(structureDisplayLabel({ url: getPdbStructureUrl('1TUP') })).toBe(
    '1TUP',
  )
  expect(
    structureDisplayLabel({ url: getAlphaFoldStructureUrl('P04637') }),
  ).toBe('AlphaFold P04637')
  expect(
    structureDisplayLabel({ url: 'https://e.com/models/ranked_0.pdb?x=1' }),
  ).toBe('ranked_0.pdb')
  expect(structureDisplayLabel({ data: 'ATOM...' })).toBe('Uploaded structure')
  expect(structureDisplayLabel({})).toBe('')
})
