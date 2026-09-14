import { CIF } from 'molstar/lib/mol-io/reader/cif'
import { parsePDB } from 'molstar/lib/mol-io/reader/pdb/parser'
import { trajectoryFromMmCIF } from 'molstar/lib/mol-model-formats/structure/mmcif'
import { trajectoryFromPDB } from 'molstar/lib/mol-model-formats/structure/pdb'
import { Task } from 'molstar/lib/mol-task'
import { expect, test } from 'vitest'

import {
  extractEntities,
  makeLabelSeqIdIndex,
  rangeToLabelSeqIds,
} from './extractStructureSequences'
import { structureFormatFromContent } from './structureFormat'

// Why this test exists, offline and against real molstar rather than a stub:
// the plugin used to derive molstar's label_seq_id as `structurePosition + 1`.
// That is true for any mmCIF with an entity_poly_seq category (all of RCSB and
// AlphaFold) and for PDB files carrying SEQRES records, because molstar
// synthesizes the category from them — which is why it went unnoticed. A PDB
// file with no SEQRES has neither, so molstar falls back to
// StructureSequence.fromHierarchy and reads label_seq_id off the observed
// residues' author numbering. Users open exactly those files via the
// "Open file manually" tab. This pins molstar's actual behavior, so if a future
// molstar release starts renumbering, this test says so rather than the
// highlights quietly drifting.

const RESIDUES = ['SER', 'SER', 'SER', 'VAL', 'PRO', 'SER', 'GLN', 'LYS']

/** CA-only PDB with no SEQRES, residues numbered from `first`. */
function caOnlyPdb(first: number, gapAfter?: number) {
  return (
    RESIDUES.map((res, i) => {
      const num = first + i + (gapAfter !== undefined && i > gapAfter ? 20 : 0)
      return (
        'ATOM  ' +
        String(i + 1).padStart(5) +
        '  CA  ' +
        res.padEnd(3) +
        ' A' +
        String(num).padStart(4) +
        '    ' +
        (10 + i).toFixed(3).padStart(8) +
        (20 + i).toFixed(3).padStart(8) +
        (30 + i).toFixed(3).padStart(8) +
        '  1.00  0.00           C'
      )
    }).join('\n') + '\nEND\n'
  )
}

async function entitiesOf(pdb: string) {
  const parsed = await parsePDB(pdb).run()
  if (parsed.isError) {
    throw new Error(parsed.message)
  }
  const trajectory = await trajectoryFromPDB(parsed.result).run()
  const model = await Task.resolveInContext(trajectory.getFrameAtIndex(0))
  const entities = extractEntities({ obj: { data: model } })
  expect(entities).toBeDefined()
  return entities!
}

test('a SEQRES-less PDB numbered from 1 does convert as position + 1', async () => {
  const [entity] = await entitiesOf(caOnlyPdb(1))
  expect(entity!.seqIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
})

test('a SEQRES-less PDB numbered from 94 does NOT convert as position + 1', async () => {
  const [entity] = await entitiesOf(caOnlyPdb(94))
  // molstar reports the author numbering; `position + 1` would be off by 93
  expect(entity!.seqIds[0]).toBe(94)
  expect(entity!.seq).toBe('SSSVPSQK')

  // outbound: structure position 0 must paint residue 94, not residue 1
  expect(rangeToLabelSeqIds(entity, { start: 0, end: 2 })).toEqual([94, 95])
  // inbound: molstar hovering residue 94 must report structure position 0
  expect(makeLabelSeqIdIndex(entity).get(94)).toBe(0)
})

test('an unobserved loop makes the offset non-constant', async () => {
  const [entity] = await entitiesOf(caOnlyPdb(94, 3))
  expect(entity!.seqIds).toEqual([94, 95, 96, 97, 118, 119, 120, 121])
  const index = makeLabelSeqIdIndex(entity)
  expect(index.get(118)).toBe(4)
  expect(index.get(98)).toBeUndefined()
})

// --- format detection, against the real parsers -----------------------------
// Loading with the wrong parser never produces a usable model, but it fails in
// several different shapes depending on the file: PDB-as-mmCIF throws in the
// tokenizer, while mmCIF-as-PDB does NOT throw — a real RCSB .cif read as PDB
// yields a model with thousands of misread atoms and zero polymer entities, and
// a short one yields no frames at all. Since none of those surface as an error
// to the user, the tests below assert the consequence (no entities come out)
// rather than any one failure mode. This is why detection had to move into
// addStructureFromData rather than staying in the launch dialog.

async function parseAsMmcif(text: string) {
  const parsed = await CIF.parseText(text).run()
  if (parsed.isError) {
    throw new Error(parsed.message)
  }
  const trajectory = await trajectoryFromMmCIF(parsed.result.blocks[0]!).run()
  return Task.resolveInContext(trajectory.getFrameAtIndex(0))
}

async function parseAsPdb(text: string) {
  const parsed = await parsePDB(text).run()
  if (parsed.isError) {
    throw new Error(parsed.message)
  }
  const trajectory = await trajectoryFromPDB(parsed.result).run()
  return trajectory.frameCount === 0
    ? undefined
    : Task.resolveInContext(trajectory.getFrameAtIndex(0))
}

const MINIMAL_MMCIF = `data_TEST
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
ATOM 1 C CA SER A 1 1 10.0 20.0 30.0 1 A
ATOM 2 C CA VAL A 1 2 11.0 21.0 31.0 2 A
ATOM 3 C CA LYS A 1 3 12.0 22.0 32.0 3 A
`

test('detection routes each format to a parser that actually works', () => {
  expect(structureFormatFromContent(MINIMAL_MMCIF)).toBe('mmcif')
  expect(structureFormatFromContent(caOnlyPdb(94))).toBe('pdb')
})

test('mmCIF parsed as PDB yields no entities, and does not throw', async () => {
  // no rejection — which is exactly what made this failure silent
  const model = await parseAsPdb(MINIMAL_MMCIF)
  const entities = model ? extractEntities({ obj: { data: model } }) : undefined
  expect(entities ?? []).toEqual([])
})

test('PDB parsed as mmCIF throws outright', async () => {
  await expect(parseAsMmcif(caOnlyPdb(94))).rejects.toThrow()
})

test('each format parsed with its detected parser yields its entity', async () => {
  const cifModel = await parseAsMmcif(MINIMAL_MMCIF)
  expect(extractEntities({ obj: { data: cifModel } })?.[0]?.seq).toBe('SVK')

  const pdbModel = await parseAsPdb(caOnlyPdb(94))
  expect(pdbModel).toBeDefined()
  expect(extractEntities({ obj: { data: pdbModel! } })?.[0]?.seq).toBe(
    'SSSVPSQK',
  )
})
