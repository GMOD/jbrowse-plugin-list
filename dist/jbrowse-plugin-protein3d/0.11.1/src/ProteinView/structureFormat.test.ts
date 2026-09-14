import { expect, test } from 'vitest'

import {
  isBinaryStructureUrl,
  structureFileExtension,
  structureFormatFromContent,
  structureFormatFromName,
} from './structureFormat'
import { caCoordsToPdb } from '../LaunchProteinView/utils/caCoordsToPdb'
import {
  getAlphaFoldStructureUrl,
  getPdbStructureUrl,
} from '../LaunchProteinView/utils/structureUrls'

test('structureFileExtension ignores query, fragment and .gz', () => {
  expect(structureFileExtension('1TUP.pdb')).toBe('pdb')
  expect(structureFileExtension('https://x.org/files/pdb1tup.ent.gz')).toBe(
    'ent',
  )
  expect(structureFileExtension('https://x.org/a.cif?v=2#frag')).toBe('cif')
  expect(structureFileExtension('https://x.org/download')).toBe('')
  expect(structureFileExtension('MODEL.CIF')).toBe('cif')
})

test('the URLs the plugin generates itself are mmCIF', () => {
  expect(structureFormatFromName(getPdbStructureUrl('1TUP'))).toBe('mmcif')
  expect(structureFormatFromName(getAlphaFoldStructureUrl('P04637'))).toBe(
    'mmcif',
  )
})

// getPdbIdFromUrl deliberately accepts these, so they must also load
test('PDB-archive file forms are detected as pdb', () => {
  for (const url of [
    'https://files.rcsb.org/download/1TUP.pdb',
    'https://files.rcsb.org/download/pdb1tup.ent.gz',
    'https://www.ebi.ac.uk/pdbe/entry-files/1tup.ent',
  ]) {
    expect(structureFormatFromName(url)).toBe('pdb')
  }
})

test('an unknown extension falls back to mmCIF', () => {
  expect(structureFormatFromName('https://x.org/structure')).toBe('mmcif')
})

test('isBinaryStructureUrl only for bcif', () => {
  expect(isBinaryStructureUrl('https://x.org/a.bcif')).toBe(true)
  expect(isBinaryStructureUrl('https://x.org/a.cif')).toBe(false)
  expect(isBinaryStructureUrl('https://x.org/a.pdb')).toBe(false)
})

test('content sniffing finds the mmCIF data_ header past comments', () => {
  expect(structureFormatFromContent('data_1TUP\n#\nloop_\n')).toBe('mmcif')
  expect(structureFormatFromContent('#\n# a comment\n\ndata_XYZ\n')).toBe(
    'mmcif',
  )
})

test('content sniffing reads PDB records as pdb', () => {
  expect(
    structureFormatFromContent('HEADER    ANTITUMOR PROTEIN\nATOM      1'),
  ).toBe('pdb')
  expect(structureFormatFromContent('ATOM      1  CA  SER A  94')).toBe('pdb')
  expect(structureFormatFromContent('')).toBe('pdb')
})

// the plugin generates this itself from Foldseek Cα coordinates, so it must
// round-trip through its own detection
test('caCoordsToPdb output is detected as pdb', () => {
  const pdb = caCoordsToPdb('1,2,3,4,5,6', 'MK', 'A', 'hit')
  expect(structureFormatFromContent(pdb)).toBe('pdb')
})
