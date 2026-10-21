import { expect, test } from 'vitest'

import { residueValuesStatus, valuesByPosition } from './residueValuesStatus'

const entity = { entityId: '1', seqIds: [1, 2, 3, 4] }

test('a list counts residues from 1, an object keys them by number', () => {
  expect([...valuesByPosition([5, null, 7])]).toEqual([
    [0, 5],
    [2, 7],
  ])
  expect([...valuesByPosition({ 2: 1.5, 4: -1 })]).toEqual([
    [1, 1.5],
    [3, -1],
  ])
})

test('places the values through the transcript to structure map', () => {
  const status = residueValuesStatus({
    values: { 1: 10, 2: 20, 3: 30 },
    entity,
    transcriptToStructure: { 0: 0, 1: 1, 2: 3 },
  })
  expect(status.placed?.entityId).toBe('1')
  expect([...status.placed!.byLabelSeqId]).toEqual([
    [1, 10],
    [2, 20],
    [4, 30],
  ])
})

test('waits for the alignment without a message', () => {
  expect(
    residueValuesStatus({
      values: [1],
      entity,
      transcriptToStructure: undefined,
    }),
  ).toEqual({})
})

test('says so when no value lands on the structure', () => {
  expect(
    residueValuesStatus({
      values: { 90: 1 },
      entity,
      transcriptToStructure: { 0: 0 },
    }).message,
  ).toMatch(/None of the values/)
  expect(
    residueValuesStatus({
      values: undefined,
      entity,
      transcriptToStructure: {},
    }).message,
  ).toMatch(/No values/)
})
