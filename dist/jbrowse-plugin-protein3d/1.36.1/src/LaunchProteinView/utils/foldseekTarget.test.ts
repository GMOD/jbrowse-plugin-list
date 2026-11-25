import { expect, test } from 'vitest'

import { foldseekTarget } from './foldseekTarget'

test('a PDB chain is named by its entry and chain, linked to RCSB', () => {
  expect(
    foldseekTarget(
      '8f2h-assembly1.cif.gz_A Cellular tumor antigen p53',
      'pdb100',
    ),
  ).toEqual({
    label: '8F2H chain A',
    href: 'https://www.rcsb.org/structure/8F2H',
    description: 'Cellular tumor antigen p53',
  })
})

test('an AlphaFold model is named without its file version, linked to its entry', () => {
  expect(
    foldseekTarget(
      'AF-P16442-F1-model_v6 Histo-blood group ABO transferase',
      'afdb-swissprot',
    ),
  ).toEqual({
    label: 'AF-P16442-F1',
    href: 'https://alphafold.ebi.ac.uk/entry/P16442',
    description: 'Histo-blood group ABO transferase',
  })
})

test("a long protein's later fragment is named but not linked", () => {
  expect(
    foldseekTarget('AF-Q8WZ42-F7-model_v6 Titin', 'afdb-proteome'),
  ).toEqual({
    label: 'AF-Q8WZ42-F7',
    href: undefined,
    description: 'Titin',
  })
})

test("another database's id is shown as Foldseek spells it, unlinked", () => {
  expect(foldseekTarget('MGYP000123', 'mgnify_esm30')).toEqual({
    label: 'MGYP000123',
    href: undefined,
    description: '',
  })
})
