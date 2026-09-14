import { expect, test } from 'vitest'

import {
  extractPerResidueConfidence,
  looksLikePlddt,
} from './extractPerResidueConfidence'

// one atom per residue, so residue i is atom i
function fakeModel(
  residues: { entityId: string; seqId: number; bfactor: number }[],
) {
  return {
    obj: {
      data: {
        atomicConformation: {
          B_iso_or_equiv: { value: (row: number) => residues[row]!.bfactor },
        },
        atomicHierarchy: {
          residueAtomSegments: {
            offsets: residues.map((_, i) => i),
            count: residues.length,
          },
          chainAtomSegments: { index: residues.map((_, i) => i) },
          chains: {
            label_entity_id: {
              value: (row: number) => residues[row]!.entityId,
            },
          },
          residues: {
            label_seq_id: { value: (row: number) => residues[row]!.seqId },
          },
        },
      },
    },
  }
}

test('keys values by entity and label_seq_id', () => {
  const result = extractPerResidueConfidence(
    fakeModel([
      { entityId: '1', seqId: 1, bfactor: 90 },
      { entityId: '1', seqId: 2, bfactor: 80 },
      { entityId: '2', seqId: 1, bfactor: 40 },
    ]),
  )
  expect(result).toEqual([
    {
      entityId: '1',
      byLabelSeqId: new Map([
        [1, 90],
        [2, 80],
      ]),
    },
    { entityId: '2', byLabelSeqId: new Map([[1, 40]]) },
  ])
})

test('an unobserved residue leaves a hole rather than shifting later values', () => {
  const [entity] = extractPerResidueConfidence(
    fakeModel([
      { entityId: '1', seqId: 94, bfactor: 90 },
      { entityId: '1', seqId: 96, bfactor: 40 },
    ]),
  )!
  expect(entity!.byLabelSeqId.get(94)).toBe(90)
  expect(entity!.byLabelSeqId.get(95)).toBeUndefined()
  expect(entity!.byLabelSeqId.get(96)).toBe(40)
})

test('returns undefined when model data is missing', () => {
  expect(extractPerResidueConfidence({})).toBeUndefined()
})

test('looksLikePlddt accepts varying [0,100] values', () => {
  expect(looksLikePlddt([90, 40, 70])).toBe(true)
})

test('looksLikePlddt rejects constant, empty, or out-of-range', () => {
  expect(looksLikePlddt([50, 50, 50])).toBe(false)
  expect(looksLikePlddt([120, 30])).toBe(false)
  expect(looksLikePlddt([42])).toBe(false)
  expect(looksLikePlddt(undefined)).toBe(false)
})
