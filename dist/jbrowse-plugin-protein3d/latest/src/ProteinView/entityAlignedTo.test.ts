import { expect, test } from 'vitest'

import { entityAlignedTo } from './entityAlignedTo'

const alignment = (transcriptRow: string, structureRow: string) => ({
  consensus: '',
  alns: [
    { id: 'a', seq: transcriptRow },
    { id: 'b', seq: structureRow },
  ] as const,
})

const entity = (entityId: string, seq: string, nucleicAcid?: boolean) => ({
  entityId,
  seq,
  seqIds: [],
  chains: [],
  ...(nucleicAcid ? { nucleicAcid } : {}),
})

test('the preferred entity wins among chains of one sequence', () => {
  const entities = [entity('1', 'MKAA'), entity('2', 'MKAA')]
  expect(
    entityAlignedTo(alignment('MKAA', 'MKAA'), 'MKAA*', entities, '2'),
  ).toEqual({ entityId: '2' })
  expect(entityAlignedTo(alignment('MKAA', 'MKAA'), 'MKAA', entities)).toEqual({
    entityId: '1',
  })
})

test('a protein chain wins over a nucleic-acid chain of the same letters', () => {
  const entities = [entity('1', 'ACGT', true), entity('2', 'ACGT')]
  expect(entityAlignedTo(alignment('ACGT', 'ACGT'), 'ACGT', entities)).toEqual({
    entityId: '2',
  })
})

test('names the row that does not fit', () => {
  const entities = [entity('1', 'MKAA')]
  expect(entityAlignedTo(alignment('MKA-', 'MKAA'), 'MKAAV', entities)).toEqual(
    {
      problem: expect.stringContaining("not this transcript's translation"),
    },
  )
  expect(entityAlignedTo(alignment('MKA', 'MKAA'), 'MKA', entities)).toEqual({
    problem: expect.stringContaining('same length'),
  })
})

test('a stop codon aligned to a gap at the end is not a residue', () => {
  expect(
    entityAlignedTo(alignment('MKAA*', 'MKAA-'), 'MKAA*', [
      entity('1', 'MKAA'),
    ]),
  ).toEqual({ entityId: '1' })
})
