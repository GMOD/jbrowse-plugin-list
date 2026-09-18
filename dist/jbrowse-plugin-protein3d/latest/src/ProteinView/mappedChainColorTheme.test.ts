import {
  StructureElement,
  StructureProperties as SP,
} from 'molstar/lib/mol-model/structure'
import { beforeAll, expect, test } from 'vitest'

import {
  MAPPED_CHAIN_COLOR,
  MappedChainColorThemeProvider,
  OTHER_CHAIN_COLOR,
} from './mappedChainColorTheme'
import { parseStructure } from '../test_data/molstarStructure'

import type { Structure } from 'molstar/lib/mol-model/structure'

let structure: Structure

beforeAll(async () => {
  structure = await parseStructure([
    { asym: 'A', entity: '1', residues: ['SER', 'VAL'] },
    { asym: 'B', entity: '1', residues: ['SER', 'VAL'] },
    { asym: 'C', entity: '2', residues: ['GLY', 'ALA'] },
  ])
})

function colorByChain(entityId: string) {
  const theme = MappedChainColorThemeProvider.factory(
    { structure },
    { entityId },
  )
  const byChain = new Map<string, Set<number>>()
  const l = StructureElement.Location.create(structure)
  for (const unit of structure.units) {
    l.unit = unit
    for (const element of unit.elements) {
      l.element = element
      const chain = SP.chain.label_asym_id(l)
      const colors = byChain.get(chain) ?? new Set()
      colors.add(theme.color(l, false))
      byChain.set(chain, colors)
    }
  }
  return Object.fromEntries(
    [...byChain].map(([chain, colors]) => [chain, [...colors]]),
  )
}

test('colors every chain of the mapped entity and greys the rest', () => {
  expect(colorByChain('1')).toEqual({
    A: [MAPPED_CHAIN_COLOR],
    B: [MAPPED_CHAIN_COLOR],
    C: [OTHER_CHAIN_COLOR],
  })
  expect(colorByChain('2')).toEqual({
    A: [OTHER_CHAIN_COLOR],
    B: [OTHER_CHAIN_COLOR],
    C: [MAPPED_CHAIN_COLOR],
  })
})
