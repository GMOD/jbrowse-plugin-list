import { expect, test } from 'vitest'

import {
  structurePositionToAlignmentMap,
  structureSeqVsTranscriptSeqMap,
  transcriptPositionToAlignmentMap,
} from './mappings'

import type { PairwiseAlignment } from './mappings'

// Characterization fixture: gaps on BOTH rows so every branch is exercised.
//   col:  0 1 2 3 4 5
//   tx :  M K - L V A   (transcript, alns[0])
//   st :  M K D L - A   (structure,  alns[1])
const PA: PairwiseAlignment = {
  consensus: '||  | ',
  alns: [
    { id: 'transcript', seq: 'MK-LVA' },
    { id: 'structure', seq: 'MKDL-A' },
  ],
}

// These assertions pin CURRENT behavior. If a refactor changes them, that is a
// behavior change to scrutinize, not a test to casually update.

test('structureSeqVsTranscriptSeqMap pins the residue<->residue maps', () => {
  const {
    structureSeqToTranscriptSeqPosition,
    transcriptSeqToStructureSeqPosition,
  } = structureSeqVsTranscriptSeqMap(PA)
  // structure residue D (structurePos 2) and transcript residue V (transcriptPos 3)
  // are unaligned and absent from the maps.
  expect(structureSeqToTranscriptSeqPosition).toEqual({
    0: 0,
    1: 1,
    3: 2,
    4: 4,
  })
  expect(transcriptSeqToStructureSeqPosition).toEqual({
    0: 0,
    1: 1,
    2: 3,
    4: 4,
  })
})

test('structurePositionToAlignmentMap pins structurePos -> alignment column', () => {
  expect(structurePositionToAlignmentMap(PA)).toEqual({
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 5,
  })
})

test('transcriptPositionToAlignmentMap pins transcriptPos -> alignment column', () => {
  expect(transcriptPositionToAlignmentMap(PA)).toEqual({
    0: 0,
    1: 1,
    2: 3,
    3: 4,
    4: 5,
  })
})

test('mismatched alignment row lengths throw', () => {
  expect(() =>
    structureSeqVsTranscriptSeqMap({
      consensus: '',
      alns: [
        { id: 'a', seq: 'MK' },
        { id: 'b', seq: 'MKD' },
      ],
    }),
  ).toThrow('mismatched length')
})
