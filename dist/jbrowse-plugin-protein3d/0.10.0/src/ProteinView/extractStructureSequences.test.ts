import { expect, test } from 'vitest'

import {
  type Entity,
  extractEntities,
  makeLabelSeqIdIndex,
  rangeToLabelSeqIds,
  toLabelSeqIds,
} from './extractStructureSequences'

// A molstar model stub shaped like the fields extractEntities reads.
function model(
  entities: { entityId: string; seq: string; seqIds: number[] }[],
) {
  return {
    obj: {
      data: {
        sequence: {
          sequences: entities.map(e => ({
            entityId: e.entityId,
            sequence: {
              label: { toArray: () => Array.from(e.seq) },
              seqId: { toArray: () => e.seqIds },
            },
          })),
        },
      },
    },
  }
}

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
