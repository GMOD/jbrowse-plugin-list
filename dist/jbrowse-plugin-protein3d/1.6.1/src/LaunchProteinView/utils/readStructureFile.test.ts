import { gzipSync } from 'node:zlib'

import { expect, test } from 'vitest'

import { readStructureFile } from './readStructureFile'

const pdb =
  'ATOM      1  CA  MET A   1       0.000   0.000   0.000  1.00  0.00           C\nEND\n'

test('reads a plain file as text', async () => {
  expect(await readStructureFile(new File([pdb], 'x.pdb'))).toBe(pdb)
})

test('inflates a .gz file by its name', async () => {
  const gz = new File([new Uint8Array(gzipSync(pdb))], 'pdb1abc.ent.gz')
  expect(await readStructureFile(gz)).toBe(pdb)
})
