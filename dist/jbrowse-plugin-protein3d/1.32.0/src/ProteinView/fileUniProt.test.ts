import { CIF } from 'molstar/lib/mol-io/reader/cif'
import { trajectoryFromMmCIF } from 'molstar/lib/mol-model-formats/structure/mmcif'
import { Task } from 'molstar/lib/mol-task'
import { chooseUniProtMappingForEntity, extractEntities } from 'p2s_mapper'
import { expect, test } from 'vitest'

import { complexMembersLabel, fileUniProtMappings } from './fileUniProt'
import { caOnlyMmcif } from '../test_data/molstarStructure'

// AF-0000000210612662's own rows, spans cut to the test chains' length. Mol*'s
// schema for the category has no gene_name, so a reader of its `db` table
// finds no such column; parsed for real, this fails that way.
const REFERENCES = `loop_
_ma_target_ref_db_details.target_entity_id
_ma_target_ref_db_details.db_name
_ma_target_ref_db_details.db_accession
_ma_target_ref_db_details.db_code
_ma_target_ref_db_details.gene_name
_ma_target_ref_db_details.ncbi_taxonomy_id
_ma_target_ref_db_details.organism_scientific
_ma_target_ref_db_details.seq_db_align_begin
_ma_target_ref_db_details.seq_db_align_end
_ma_target_ref_db_details.seq_db_isoform
2 UNP P09488 'GSTM1_HUMAN' GSTM1 9606 'Homo sapiens' 1 3 ?
1 UNP P09211 'GSTP1_HUMAN' GSTP1 9606 'Homo sapiens' 1 4 ?
3 UNP P04637-2 'P53_HUMAN' TP53 9606 'Homo sapiens' 1 3 2
`

async function parsedEntities() {
  const text = `${caOnlyMmcif([
    { asym: 'A', entity: '2', residues: ['MET', 'PRO', 'MET'] },
    { asym: 'B', entity: '1', residues: ['MET', 'PRO', 'PRO', 'TYR'] },
    { asym: 'C', entity: '3', residues: ['MET', 'GLU', 'GLU'] },
  ])}${REFERENCES}`
  const parsed = await CIF.parseText(text).run()
  if (parsed.isError) {
    throw new Error(parsed.message)
  }
  const trajectory = await trajectoryFromMmCIF(parsed.result.blocks[0]!).run()
  const model = await Task.resolveInContext(trajectory.getFrameAtIndex(0))
  return extractEntities({ obj: { data: model } }) ?? []
}

test("a complex's file names each chain's UniProt entry, read through Mol*", async () => {
  const entities = await parsedEntities()
  expect(entities.map(e => [e.entityId, e.uniProt])).toEqual([
    [
      '2',
      { accession: 'P09488', name: 'GSTM1_HUMAN', gene: 'GSTM1', start: 1 },
    ],
    [
      '1',
      { accession: 'P09211', name: 'GSTP1_HUMAN', gene: 'GSTP1', start: 1 },
    ],
    ['3', { accession: 'P04637-2', name: 'P53_HUMAN', gene: 'TP53', start: 1 }],
  ])

  const mappings = fileUniProtMappings(entities)
  expect(mappings.map(m => m.accession)).toEqual(['P09488', 'P09211'])
  expect(
    chooseUniProtMappingForEntity(mappings, { entityId: '1', chains: ['B'] })
      ?.accession,
  ).toBe('P09211')
  expect(complexMembersLabel(entities)).toBe('GSTM1 + GSTP1 + TP53')
})

test('a file naming no UniProt entry names nothing', () => {
  const entity = {
    entityId: '1',
    seq: 'MKV',
    seqIds: [1, 2, 3],
    chains: ['A', 'B'],
  }
  expect(fileUniProtMappings([entity])).toEqual([])
  expect(complexMembersLabel([entity])).toBeUndefined()
  expect(complexMembersLabel(undefined)).toBeUndefined()
})
