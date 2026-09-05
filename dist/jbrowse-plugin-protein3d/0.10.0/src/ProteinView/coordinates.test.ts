import { expect, test } from 'vitest'

import {
  alignmentCol,
  makeCoordinateMapper,
  structurePos,
  transcriptPos,
} from './coordinates'

import type { PairwiseAlignment } from '../mappings'

// Same fixture as the mappings characterization test:
//   col:  0 1 2 3 4 5
//   tx :  M K - L V A
//   st :  M K D L - A
const PA: PairwiseAlignment = {
  consensus: '||  | ',
  alns: [
    { id: 'transcript', seq: 'MK-LVA' },
    { id: 'structure', seq: 'MKDL-A' },
  ],
}

test('point conversions round-trip through aligned positions', () => {
  const m = makeCoordinateMapper(PA)
  // structurePos 3 (L) <-> transcriptPos 2 (L)
  expect(m.structureToTranscript(structurePos(3))).toBe(2)
  expect(m.transcriptToStructure(transcriptPos(2))).toBe(3)
  // structurePos 0 (M) -> alignment col 0; structurePos 4 (A) -> col 5
  expect(m.structureToAlignment(structurePos(0))).toBe(0)
  expect(m.structureToAlignment(structurePos(4))).toBe(5)
  expect(m.alignmentToStructure(alignmentCol(5))).toBe(4)
  // transcriptPos 2 (L) -> col 3
  expect(m.transcriptToAlignment(transcriptPos(2))).toBe(3)
  expect(m.alignmentToTranscript(alignmentCol(3))).toBe(2)
})

test('unaligned residues and gap columns convert to undefined', () => {
  const m = makeCoordinateMapper(PA)
  // structurePos 2 (D) is unaligned in the transcript
  expect(m.structureToTranscript(structurePos(2))).toBeUndefined()
  // alignment col 4 (transcript V) has no structure residue (structure gap)
  expect(m.alignmentToStructure(alignmentCol(4))).toBeUndefined()
  // alignment col 2 (structure D) has no transcript residue
  expect(m.alignmentToTranscript(alignmentCol(2))).toBeUndefined()
})

test('maps match the underlying mappings functions', () => {
  const m = makeCoordinateMapper(PA)
  expect(m.maps.structureSeqToTranscriptSeqPosition).toEqual({
    0: 0,
    1: 1,
    3: 2,
    4: 4,
  })
  expect(m.maps.structurePositionToAlignmentMap).toEqual({
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 5,
  })
  expect(m.maps.alignmentToStructurePosition).toEqual({
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    5: 4,
  })
})
