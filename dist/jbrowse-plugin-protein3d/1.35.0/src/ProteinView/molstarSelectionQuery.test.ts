import { OrderedSet } from 'molstar/lib/mol-data/int'
import {
  StructureElement,
  StructureProperties as SP,
  StructureSelection,
} from 'molstar/lib/mol-model/structure'
import { Script } from 'molstar/lib/mol-script/script'
import { beforeAll, expect, test } from 'vitest'

import { residueLoci } from './applyLociInteractivity'
import { parseStructure } from '../test_data/molstarStructure'

import type { Structure } from 'molstar/lib/mol-model/structure'

// residueLoci's query is the thing that paints every highlight and every
// selection, and it fails silently: a MolScript expression molstar doesn't
// understand selects nothing rather than throwing, so the 3D view just stops
// lighting up. This runs it against a real parsed Structure, offline.
//
// Two properties are pinned: the set membership test resolves the residues it
// is given, and the entity filter confines them. The second is what stops a
// residue number lighting up on an unrelated chain of a complex.

let structure: Structure

// Two polymer entities, each instantiated by two chains, overlapping residue
// numbering (both start at label_seq_id 1): the shape that makes the entity
// filter observable.
beforeAll(async () => {
  structure = await parseStructure([
    { asym: 'A', entity: '1', residues: ['SER', 'VAL', 'LYS', 'THR'] },
    { asym: 'B', entity: '1', residues: ['SER', 'VAL', 'LYS', 'THR'] },
    { asym: 'C', entity: '2', residues: ['GLY', 'ALA', 'PRO', 'PHE'] },
    { asym: 'D', entity: '2', residues: ['GLY', 'ALA', 'PRO', 'PHE'] },
  ])
})

/** What setMolstarLoci's query resolves the residues to. */
function select(labelSeqIds: number[], entityId?: string) {
  const loci = residueLoci(
    { Script, StructureSelection },
    { structure, entityId, labelSeqIds },
  )
  const chains = new Set<string>()
  const entities = new Set<string>()
  const residues = new Set<string>()
  const loc = StructureElement.Location.create(structure)
  for (const e of loci.elements) {
    loc.unit = e.unit
    for (let i = 0, il = OrderedSet.size(e.indices); i < il; i++) {
      loc.element = e.unit.elements[OrderedSet.getAt(e.indices, i)]!
      chains.add(SP.chain.auth_asym_id(loc))
      entities.add(SP.entity.id(loc))
      residues.add(
        `${SP.chain.auth_asym_id(loc)}:${SP.residue.label_seq_id(loc)}`,
      )
    }
  }
  return {
    chains: [...chains].sort(),
    entities: [...entities].sort(),
    residues: [...residues].sort(),
  }
}

test('a single label_seq_id resolves on every chain of its entity', () => {
  const r = select([2], '1')
  expect(r.entities).toEqual(['1'])
  expect(r.chains).toEqual(['A', 'B'])
  expect(r.residues).toEqual(['A:2', 'B:2'])
})

test('a set of ids resolves all of them, and only them', () => {
  const r = select([1, 3], '1')
  expect(r.residues).toEqual(['A:1', 'A:3', 'B:1', 'B:3'])
})

// the guard that stops a residue number lighting up on a binding partner
test('the entity filter excludes other entities sharing the numbering', () => {
  const r = select([1, 2], '2')
  expect(r.entities).toEqual(['2'])
  expect(r.chains).toEqual(['C', 'D'])
  expect(r.residues).toEqual(['C:1', 'C:2', 'D:1', 'D:2'])
})

test('without an entity filter every entity with that id matches', () => {
  expect(select([1]).entities).toEqual(['1', '2'])
})

test('ids that are not in the structure select nothing', () => {
  expect(select([9999], '1').residues).toEqual([])
})
