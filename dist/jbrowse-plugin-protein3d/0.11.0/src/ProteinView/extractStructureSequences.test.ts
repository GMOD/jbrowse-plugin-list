import { expect, test } from 'vitest'

import {
  type Entity,
  entityLabel,
  extractEntities,
  fillAuthSeqIds,
  makeLabelSeqIdIndex,
  rangeToLabelSeqIds,
  residueNumber,
  residueRangeToPositions,
  toLabelSeqIds,
} from './extractStructureSequences'

// A molstar model stub shaped like the fields extractEntities reads. Observed
// residues, when given, build the atomic hierarchy: one atom per residue, each
// residue on the chain of its entity.
function model(
  entities: {
    entityId: string
    seq: string
    seqIds: number[]
    subtype?: string
  }[],
  observed?: { entityId: string; labelSeqId: number; authSeqId: number }[],
) {
  const entityIds = entities.map(e => e.entityId)
  return {
    obj: {
      data: {
        entities: {
          subtype: {
            rowCount: entities.length,
            value: (row: number) => entities[row]!.subtype ?? 'polypeptide(L)',
          },
          getEntityIndex: (id: string) => entityIds.indexOf(id),
        },
        sequence: {
          sequences: entities.map(e => ({
            entityId: e.entityId,
            sequence: {
              label: { toArray: () => Array.from(e.seq) },
              seqId: { toArray: () => e.seqIds },
            },
          })),
        },
        ...(observed
          ? {
              atomicHierarchy: {
                chains: {
                  label_entity_id: {
                    rowCount: entityIds.length,
                    value: (row: number) => entityIds[row]!,
                  },
                  auth_asym_id: {
                    rowCount: entityIds.length,
                    value: (row: number) => 'ABCDEFG'[row]!,
                  },
                },
                residues: {
                  label_seq_id: {
                    rowCount: observed.length,
                    value: (row: number) => observed[row]!.labelSeqId,
                  },
                  auth_seq_id: {
                    rowCount: observed.length,
                    value: (row: number) => observed[row]!.authSeqId,
                  },
                },
                residueAtomSegments: {
                  offsets: observed.map((_, i) => i),
                  count: observed.length,
                },
                chainAtomSegments: {
                  index: observed.map(o => entityIds.indexOf(o.entityId)),
                },
              },
            }
          : {}),
      },
    },
  }
}

test('extractEntities carries author numbering, filling unobserved residues by offset', () => {
  // an RCSB-style entity numbered 1..6 whose construct starts at author 94,
  // with residue 3 unobserved and a renumbering after a disordered loop
  const [e] = extractEntities(
    model(
      [{ entityId: '1', seq: 'SSSVPS', seqIds: [1, 2, 3, 4, 5, 6] }],
      [
        { entityId: '1', labelSeqId: 1, authSeqId: 94 },
        { entityId: '1', labelSeqId: 2, authSeqId: 95 },
        { entityId: '1', labelSeqId: 4, authSeqId: 97 },
        { entityId: '1', labelSeqId: 5, authSeqId: 120 },
        { entityId: '1', labelSeqId: 6, authSeqId: 121 },
      ],
    ),
  )!
  expect(e.chains).toEqual(['A'])
  expect(e.authSeqIds).toEqual([94, 95, 96, 97, 120, 121])
  expect(residueNumber(e, 0)).toBe(94)
  expect(residueNumber(e, 5)).toBe(121)
})

test('extractEntities flags DNA and RNA entities and labels them in nt', () => {
  const [dna, rna, protein] = extractEntities(
    model([
      {
        entityId: '1',
        seq: 'TTTCC',
        seqIds: [1, 2, 3, 4, 5],
        subtype: 'polydeoxyribonucleotide',
      },
      {
        entityId: '2',
        seq: 'GGAU',
        seqIds: [1, 2, 3, 4],
        subtype: 'polyribonucleotide',
      },
      { entityId: '3', seq: 'MKV', seqIds: [1, 2, 3] },
    ]),
  )!
  expect(dna.nucleicAcid).toBe(true)
  expect(rna.nucleicAcid).toBe(true)
  expect(protein.nucleicAcid).toBeUndefined()
  expect(entityLabel(dna)).toBe('Entity 1 (5 nt)')
  expect(entityLabel(protein)).toBe('Entity 3 (3 aa)')
})

test('fillAuthSeqIds: an unobserved N-terminus takes the first observed offset', () => {
  const observed = new Map([
    [3, 103],
    [4, 104],
  ])
  expect(fillAuthSeqIds([1, 2, 3, 4], observed)).toEqual([101, 102, 103, 104])
})

test('fillAuthSeqIds: nothing observed keeps the label numbering', () => {
  expect(fillAuthSeqIds([1, 2, 3], new Map())).toEqual([1, 2, 3])
  expect(fillAuthSeqIds([1, 2, 3], undefined)).toEqual([1, 2, 3])
})

test('residueRangeToPositions finds the positions an author range names', () => {
  const e: Entity = {
    entityId: '1',
    seq: 'SSSVPS',
    seqIds: [1, 2, 3, 4, 5, 6],
    authSeqIds: [94, 95, 96, 97, 120, 121],
    chains: ['A'],
  }
  expect(residueRangeToPositions(e, { start: 95, end: 95 })).toEqual({
    start: 1,
    end: 2,
  })
  // a range spanning the renumbered loop covers the positions on both sides
  expect(residueRangeToPositions(e, { start: 96, end: 120 })).toEqual({
    start: 2,
    end: 5,
  })
  // residues the fragment does not hold select nothing
  expect(residueRangeToPositions(e, { start: 1, end: 10 })).toBeUndefined()
  expect(
    residueRangeToPositions(undefined, { start: 1, end: 1 }),
  ).toBeUndefined()
})

test('residueNumber falls back to label ids, then to position + 1', () => {
  const e: Entity = { entityId: '1', seq: 'AB', seqIds: [94, 95], chains: [] }
  expect(residueNumber(e, 1)).toBe(95)
  expect(residueNumber(undefined, 1)).toBe(2)
})

const contiguous = (seq: string, from = 1): Entity => ({
  entityId: '1',
  seq,
  seqIds: Array.from(seq, (_, i) => i + from),
  chains: [],
})

test('extractEntities carries molstar label_seq_ids alongside the sequence', () => {
  const entities = extractEntities(
    model([{ entityId: '3', seq: 'MKAA', seqIds: [1, 2, 3, 4] }]),
  )
  expect(entities).toEqual([
    { entityId: '3', seq: 'MKAA', seqIds: [1, 2, 3, 4], chains: [] },
  ])
})

// The usual case: an mmCIF with entity_poly_seq (all of RCSB and AlphaFold)
// numbers residues 1..N, so position p is label_seq_id p+1.
test('contiguous-from-1 entity converts as position + 1', () => {
  const e = contiguous('MKAAY')
  expect(rangeToLabelSeqIds(e, { start: 0, end: 3 })).toEqual([1, 2, 3])
  expect(toLabelSeqIds(e, [0, 4])).toEqual([1, 5])
  expect(makeLabelSeqIdIndex(e).get(5)).toBe(4)
})

// A PDB-format file with no SEQRES records has no entity_poly_seq, so molstar
// falls back to the observed residues' author numbering. Verified against a
// real CA-only PDB: a chain starting at residue 94 reports seqIds 94.., and
// `position + 1` would address a residue 93 places away.
test('entity numbered from 94 does NOT convert as position + 1', () => {
  const e = contiguous('SSSVPSQKTY', 94)
  expect(rangeToLabelSeqIds(e, { start: 0, end: 3 })).toEqual([94, 95, 96])
  expect(toLabelSeqIds(e, [0])).toEqual([94])
  // the inbound direction agrees: molstar hovering label_seq_id 94 is residue 0
  expect(makeLabelSeqIdIndex(e).get(94)).toBe(0)
  expect(makeLabelSeqIdIndex(e).get(1)).toBeUndefined()
})

// An unobserved loop leaves a hole, so the offset is not even constant.
test('a gapped chain maps through the real ids, not a fixed offset', () => {
  const e: Entity = {
    entityId: '1',
    seq: 'ABCDE',
    seqIds: [94, 95, 96, 117, 118],
  }
  expect(rangeToLabelSeqIds(e, { start: 0, end: 5 })).toEqual([
    94, 95, 96, 117, 118,
  ])
  const index = makeLabelSeqIdIndex(e)
  expect(index.get(117)).toBe(3)
  // the residues inside the gap belong to no structure position
  expect(index.get(100)).toBeUndefined()
})

test('round-trips every position through both directions', () => {
  const e: Entity = { entityId: '1', seq: 'ABCDE', seqIds: [7, 8, 20, 21, 40] }
  const index = makeLabelSeqIdIndex(e)
  for (let pos = 0; pos < e.seq.length; pos++) {
    expect(index.get(toLabelSeqIds(e, [pos])[0]!)).toBe(pos)
  }
})

test('out-of-range positions are dropped rather than guessed', () => {
  const e = contiguous('MKAA')
  expect(toLabelSeqIds(e, [-1, 0, 99])).toEqual([1])
  expect(rangeToLabelSeqIds(e, { start: 2, end: 99 })).toEqual([3, 4])
  expect(rangeToLabelSeqIds(e, { start: 3, end: 3 })).toEqual([])
  expect(rangeToLabelSeqIds(undefined, { start: 0, end: 2 })).toEqual([])
  expect(toLabelSeqIds(undefined, [0])).toEqual([])
})

test('duplicate ids (micro-heterogeneity) collapse to the first position', () => {
  const e: Entity = { entityId: '1', seq: 'ABC', seqIds: [5, 5, 6] }
  expect(makeLabelSeqIdIndex(e).get(5)).toBe(0)
})
