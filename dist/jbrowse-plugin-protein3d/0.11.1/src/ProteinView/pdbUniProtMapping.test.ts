import { expect, test } from 'vitest'

import {
  chooseUniProtMappingForEntity,
  fusionPartnerPositions,
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
      chainId: 'A',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
    {
      entityId: '3',
      chainId: 'B',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
  ])
})

const P53_1TUP = { entityId: '3', chains: ['A', 'B', 'C'] }

test('picks the accession for the mapped entity of a heteromer', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_4HHB)
  const entity = (entityId: string, chains: string[]) => ({ entityId, chains })
  expect(
    chooseUniProtMappingForEntity(mappings, entity('1', ['A', 'C']))?.accession,
  ).toBe('P69905')
  expect(
    chooseUniProtMappingForEntity(mappings, entity('2', ['B', 'D']))?.accession,
  ).toBe('P68871')
  expect(
    chooseUniProtMappingForEntity(mappings, entity('3', ['E'])),
  ).toBeUndefined()
  expect(chooseUniProtMappingForEntity(mappings, undefined)).toBeUndefined()
})

// Mol* numbers a PDB-format file's entities per chain: 4HHB.pdb's chain B can
// be entity 3, which in SIFTS is nothing. The chain id still names it.
test('matches segments by chain, not by the entity number a PDB file was given', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_4HHB)
  expect(
    chooseUniProtMappingForEntity(mappings, { entityId: '3', chains: ['B'] })
      ?.accession,
  ).toBe('P68871')
})

test('collapses the repeated chains of a homomer to one segment', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_1TUP)
  expect(
    chooseUniProtMappingForEntity(mappings, P53_1TUP)?.segments,
  ).toHaveLength(1)
})

test('maps p53 uniprot positions onto 1TUP structure positions', () => {
  const mappings = parseUniProtStructureMappings(SIFTS_1TUP)
  const mapping = chooseUniProtMappingForEntity(mappings, P53_1TUP)
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

// 2RH1's SIFTS: ADRB2 on SEQRES 8-237 and 399-500, T4 lysozyme spliced in at
// 238-398 (0-based below). The alignment scattered ICL3 onto the lysozyme.
const SEGMENTS_2RH1 = [
  {
    accession: 'P07550',
    segments: [
      {
        entityId: '1',
        unpStart: 1,
        unpEnd: 230,
        structStart: 7,
        structEnd: 236,
      },
      {
        entityId: '1',
        unpStart: 264,
        unpEnd: 365,
        structStart: 398,
        structEnd: 499,
      },
    ],
  },
  {
    accession: 'P00720',
    segments: [
      {
        entityId: '1',
        unpStart: 2,
        unpEnd: 162,
        structStart: 237,
        structEnd: 397,
      },
    ],
  },
]
const range = (start: number, end: number) =>
  Array.from({ length: end - start }, (_, i) => start + i)
const CHIMERA = { entityId: '1', chains: ['A'] }

/** Mapped positions, each identical to its transcript residue or not. */
function pairs(identical: number[], different: number[] = []) {
  return new Map([
    ...identical.map(p => [p, true] as const),
    ...different.map(p => [p, false] as const),
  ])
}

test('unmaps the positions SIFTS gives the fusion partner, and nothing SIFTS leaves unassigned', () => {
  const icl3OnLysozyme = range(237, 270)
  const mapped = pairs([...range(0, 237), ...range(398, 500)], icl3OnLysozyme)
  expect([...fusionPartnerPositions(SEGMENTS_2RH1, CHIMERA, mapped)]).toEqual(
    icl3OnLysozyme,
  )
})

test('a chain with one accession, or another entity, unmaps nothing', () => {
  const mapped = pairs(range(0, 500))
  expect(
    fusionPartnerPositions(SEGMENTS_2RH1.slice(0, 1), CHIMERA, mapped).size,
  ).toBe(0)
  expect(
    fusionPartnerPositions(
      SEGMENTS_2RH1,
      { entityId: '2', chains: ['B'] },
      mapped,
    ).size,
  ).toBe(0)
})

// TP53's 11-residue peptide fused to CDK2: the alignment maps the 11, all
// identical, and 224 chance pairs on the kinase. Counting covered positions
// called CDK2 the transcript's protein and unmapped the peptide.
test("a short product fused to a long partner keeps its residues, and loses the partner's", () => {
  const cdk2 = {
    accession: 'P24941',
    segments: [
      {
        entityId: '1',
        unpStart: 1,
        unpEnd: 298,
        structStart: 0,
        structEnd: 297,
      },
    ],
  }
  const p53 = {
    accession: 'P04637',
    segments: [
      {
        entityId: '1',
        unpStart: 379,
        unpEnd: 389,
        structStart: 310,
        structEnd: 320,
      },
    ],
  }
  const peptide = range(310, 321)
  const chance = range(40, 264)
  const mapped = pairs(
    [...peptide, ...chance.filter(p => p % 5 === 0)],
    chance.filter(p => p % 5 !== 0),
  )
  const partners = fusionPartnerPositions([cdk2, p53], CHIMERA, mapped)
  expect(peptide.some(p => partners.has(p))).toBe(false)
  expect(partners.size).toBe(chance.length)
})

// A PDB-format file whose entity SIFTS describes some other chain, or a
// transcript that is neither protein: no accession reaches half identity over
// what it covers, so none is trusted
test('unmaps nothing when no accession is half identical over what it covers', () => {
  const mapped = pairs(
    range(0, 500).filter(p => p % 4 === 0),
    range(0, 500).filter(p => p % 4 !== 0),
  )
  expect(fusionPartnerPositions(SEGMENTS_2RH1, CHIMERA, mapped).size).toBe(0)
})
