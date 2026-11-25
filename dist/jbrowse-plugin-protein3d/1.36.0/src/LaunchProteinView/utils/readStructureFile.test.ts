import { gzipSync } from 'node:zlib'

import { expect, test } from 'vitest'

import { formatFileSize, readStructureFile } from './readStructureFile'

const pdb =
  'ATOM      1  CA  MET A   1       0.000   0.000   0.000  1.00  0.00           C\nEND\n'

test('reads a plain file as text', async () => {
  expect(await readStructureFile(new File([pdb], 'x.pdb'))).toBe(pdb)
})

test('inflates a .gz file by its name', async () => {
  const gz = new File([new Uint8Array(gzipSync(pdb))], 'pdb1abc.ent.gz')
  expect(await readStructureFile(gz)).toBe(pdb)
})

test('names a size in kB below a megabyte and in MB above', () => {
  expect(formatFileSize(85)).toBe('1 kB')
  expect(formatFileSize(840_400)).toBe('840 kB')
  expect(formatFileSize(3_240_000)).toBe('3.2 MB')
})
