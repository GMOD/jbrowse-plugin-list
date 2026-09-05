import { OrderedSet } from 'molstar/lib/mol-data/int'
import { CIF } from 'molstar/lib/mol-io/reader/cif'
import {
  Structure,
  StructureElement,
  StructureProperties as SP,
  StructureSelection,
} from 'molstar/lib/mol-model/structure'
import { trajectoryFromMmCIF } from 'molstar/lib/mol-model-formats/structure/mmcif'
import { Script } from 'molstar/lib/mol-script/script'
import { Task } from 'molstar/lib/mol-task'
import { beforeAll, expect, test } from 'vitest'

// setMolstarLoci's query is the thing that paints every highlight and every
// selection, and it fails silently: a MolScript expression molstar doesn't
// understand selects nothing rather than throwing, so the 3D view just stops
// lighting up. Nothing else in the suite exercises it — the e2e test renders a
// structure but never selects — so this runs the exact expression against a
// real parsed Structure, offline.
//
// Two properties are pinned: the set membership test resolves the residues it
// is given, and the entity filter confines them. The second is what stops a
// residue number lighting up on an unrelated chain of a complex.

// Two polymer entities, each instantiated by two chains, overlapping residue
// numbering (both start at label_seq_id 1) — the shape that makes the entity
// filter observable.
function atom(
  id: number,
  comp: string,
  asym: string,
  entity: string,
  seq: number,
) {
  return `ATOM ${id} C CA ${comp} ${asym} ${entity} ${seq} ${id}.0 0.0 0.0 ${seq} ${asym}`
}
const MMCIF = `data_TEST
loop_
_atom_site.group_PDB
_atom_site.id
_atom_site.type_symbol
_atom_site.label_atom_id
_atom_site.label_comp_id
_atom_site.label_asym_id
_atom_site.label_entity_id
_atom_site.label_seq_id
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
_atom_site.auth_seq_id
_atom_site.auth_asym_id
${[
  ...['A', 'B'].flatMap(asym =>
    ['SER', 'VAL', 'LYS', 'THR'].map((c, i) => [c, asym, '1', i + 1] as const),
  ),
  ...['C', 'D'].flatMap(asym =>
    ['GLY', 'ALA', 'PRO', 'PHE'].map((c, i) => [c, asym, '2', i + 1] as const),
  ),
]
  .map(([comp, asym, entity, seq], i) => atom(i + 1, comp, asym, entity, seq))
  .join('\n')}
`

let structure: Structure

beforeAll(async () => {
  const parsed = await CIF.parseText(MMCIF).run()
  if (parsed.isError) {
    throw new Error(parsed.message)
  }
  const trajectory = await trajectoryFromMmCIF(parsed.result.blocks[0]!).run()
  structure = Structure.ofModel(
    await Task.resolveInContext(trajectory.getFrameAtIndex(0)),
  )
})

/** The exact expression setMolstarLoci builds, reported as what it resolved. */
function select(labelSeqIds: number[], entityId?: string) {
  const sel = Script.getStructureSelection(
    Q =>
      Q.struct.generator.atomGroups({
        ...(entityId
          ? {
              'chain-test': Q.core.rel.eq([
                Q.struct.atomProperty.macromolecular.label_entity_id(),
                entityId,
              ]),
            }
          : {}),
        'residue-test': Q.core.set.has([
          Q.core.type.set([...new Set(labelSeqIds)]),
          Q.struct.atomProperty.macromolecular.label_seq_id(),
        ]),
        'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
      }),
    structure,
  )
  const loci = StructureSelection.toLociWithSourceUnits(sel)
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
