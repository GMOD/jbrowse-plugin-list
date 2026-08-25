import { expect, test } from 'vitest'

import {
  chooseUniProtMappingForEntity,
  identityUniProtPositionMap,
  makeUniProtPositionMap,
  parseUniProtStructureMappings,
  pdbeSiftsUrl,
} from './pdbUniProtMapping'

// Abridged real responses from
// https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/{1tup,4hhb}

// p53 DNA-binding domain: one entity, UniProt 94 aligns to SEQRES 1, and the
// two extra chains repeat the same entity-level correspondence.
const SIFTS_1TUP = {
  '1tup': {
    UniProt: {
      P04637: {
        name: 'P53_HUMAN',
        mappings: [
          {
            entity_id: 3,
            chain_id: 'A',
            unp_start: 94,
            unp_end: 312,
            start: { residue_number: 1, author_residue_number: 94 },
            end: { residue_number: 219, author_residue_number: null },
          },
          {
            entity_id: 3,
            chain_id: 'B',
            unp_start: 94,
            unp_end: 312,
            start: { residue_number: 1, author_residue_number: null },
            end: { residue_number: 219, author_residue_number: null },
          },
        ],
      },
    },
  },
}

// Hemoglobin: a heteromer where each entity maps to a different accession.
const SIFTS_4HHB = {
  '4hhb': {
    UniProt: {
      P69905: {
        name: 'HBA_HUMAN',
        mappings: [
          {
            entity_id: 1,
            chain_id: 'A',
            unp_start: 2,
            unp_end: 142,
            start: { residue_number: 1 },
            end: { residue_number: 141 },
          },
        ],
      },
      P68871: {
        name: 'HBB_HUMAN',
        mappings: [
          {
            entity_id: 2,
            chain_id: 'B',
            unp_start: 2,
            unp_end: 147,
            start: { residue_number: 1 },
            end: { residue_number: 146 },
          },
        ],
      },
    },
  },
}

test('sifts url is lowercased', () => {
  expect(pdbeSiftsUrl('1TUP')).toBe(
    'https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/1tup',
  )
})

test('parses segments into 0-based structure positions', () => {
  const [mapping, ...rest] = parseUniProtStructureMappings(SIFTS_1TUP)
  expect(rest).toEqual([])
  expect(mapping?.accession).toBe('P04637')
  expect(mapping?.name).toBe('P53_HUMAN')
  expect(mapping?.segments).toEqual([
    {
      entityId: '3',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
    {
      entityId: '3',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
  ])
})

test('picks the accession for the mapped entity of a heteromer', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_4HHB)
  expect(chooseUniProtMappingForEntity(mappings, '1')?.accession).toBe('P69905')
  expect(chooseUniProtMappingForEntity(mappings, '2')?.accession).toBe('P68871')
  expect(chooseUniProtMappingForEntity(mappings, '3')).toBeUndefined()
  expect(chooseUniProtMappingForEntity(mappings, undefined)).toBeUndefined()
})

test('collapses the repeated chains of a homomer to one segment', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_1TUP)
  expect(chooseUniProtMappingForEntity(mappings, '3')?.segments).toHaveLength(1)
})

test('maps p53 uniprot positions onto 1TUP structure positions', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_1TUP)
  const mapping = chooseUniProtMappingForEntity(mappings, '3')
  const map = makeUniProtPositionMap(mapping!.segments)

  // UniProt 94 is the first modeled residue, i.e. structure position 0
  expect(map(94)).toBe(0)
  expect(map(312)).toBe(218)
  // the DNA-binding domain (UniProt 102-292) sits well inside the chain, where
  // the naive position-1 assumption would put it past the 219-residue end
  expect(map(102)).toBe(8)
  expect(map(292)).toBe(198)
  // outside the modeled region
  expect(map(93)).toBeUndefined()
  expect(map(313)).toBeUndefined()
})

test('identity map is used for alphafold models', () => {
  expect(identityUniProtPositionMap(1)).toBe(0)
  expect(identityUniProtPositionMap(250)).toBe(249)
})

test('tolerates malformed and empty payloads', () => {
  expect(parseUniProtStructureMappings(undefined)).toEqual([])
  expect(parseUniProtStructureMappings({})).toEqual([])
  expect(parseUniProtStructureMappings({ '1abc': {} })).toEqual([])
  expect(
    parseUniProtStructureMappings({ '1abc': { UniProt: { P1: {} } } }),
  ).toEqual([])
  // a segment missing its residue numbers is skipped, the good one survives
  expect(
    parseUniProtStructureMappings({
      '1abc': {
        UniProt: {
          P1: {
            mappings: [
              { entity_id: 1, unp_start: 1, unp_end: 2, start: {}, end: {} },
              {
                entity_id: 1,
                unp_start: 5,
                unp_end: 6,
                start: { residue_number: 1 },
                end: { residue_number: 2 },
              },
            ],
          },
        },
      },
    })[0]?.segments,
  ).toEqual([
    { entityId: '1', unpStart: 5, unpEnd: 6, structStart: 0, structEnd: 1 },
  ])
})

test('a gapped multi-segment mapping maps each segment by its own offset', () => {
  const map = makeUniProtPositionMap([
    { entityId: '1', unpStart: 10, unpEnd: 20, structStart: 0, structEnd: 10 },
    { entityId: '1', unpStart: 50, unpEnd: 60, structStart: 11, structEnd: 21 },
  ])
  expect(map(10)).toBe(0)
  expect(map(20)).toBe(10)
  expect(map(50)).toBe(11)
  expect(map(60)).toBe(21)
  expect(map(30)).toBeUndefined()
})
