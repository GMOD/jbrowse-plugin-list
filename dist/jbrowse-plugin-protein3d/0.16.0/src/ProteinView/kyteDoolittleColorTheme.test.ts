import {
  StructureElement,
  StructureProperties as SP,
} from 'molstar/lib/mol-model/structure'
import { Color } from 'molstar/lib/mol-util/color'
import { beforeAll, expect, test } from 'vitest'

import {
  KyteDoolittleColorThemeProvider,
  NON_AMINO_ACID_COLOR,
} from './kyteDoolittleColorTheme'
import { hydrophobicityColor } from './residueTracks'
import { parseStructure } from '../test_data/molstarStructure'

import type { Structure } from 'molstar/lib/mol-model/structure'

let structure: Structure
let withoutCanonical: Structure

beforeAll(async () => {
  structure = await parseStructure([
    {
      asym: 'A',
      entity: '1',
      residues: ['ILE', 'ARG', 'GLY', 'MSE'],
      canonical: 'IRGM',
    },
    { asym: 'B', entity: '2', residues: ['HOH'] },
  ])
  withoutCanonical = await parseStructure([
    { asym: 'A', entity: '1', residues: ['ILE', 'MSE'] },
  ])
})

function colorByResidue(structure: Structure) {
  const theme = KyteDoolittleColorThemeProvider.factory({ structure }, {})
  const byResidue: Record<string, string> = {}
  const l = StructureElement.Location.create(structure)
  for (const unit of structure.units) {
    l.unit = unit
    for (const element of unit.elements) {
      l.element = element
      byResidue[SP.atom.label_comp_id(l)] = Color.toStyle(theme.color(l, false))
    }
  }
  return byResidue
}

test('paints each residue the colour the alignment strip gives its score', () => {
  expect(colorByResidue(structure)).toEqual({
    ILE: hydrophobicityColor(4.5),
    ARG: hydrophobicityColor(-4.5),
    GLY: hydrophobicityColor(-0.4),
    MSE: hydrophobicityColor(1.9),
    HOH: Color.toStyle(NON_AMINO_ACID_COLOR),
  })
})

test('greys a modified residue whose parent the file does not name', () => {
  expect(colorByResidue(withoutCanonical)).toEqual({
    ILE: hydrophobicityColor(4.5),
    MSE: Color.toStyle(NON_AMINO_ACID_COLOR),
  })
})
