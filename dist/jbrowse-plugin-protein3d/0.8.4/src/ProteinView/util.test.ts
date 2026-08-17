import { expect, test } from 'vitest'

import { genomeHoverToTranscriptPos, invertMap } from './util'

// g2p is keyed by 0-based genome position; hovered.coord is 1-based display
const mapping = { refName: 'chr17', g2p: { 999: 4, 1002: 5 } }
const hoveredAt = (refName: string, coord: number) => ({
  hoverPosition: { refName, coord },
})

test('genomeHoverToTranscriptPos maps a hover on the transcript refName', () => {
  expect(genomeHoverToTranscriptPos(hoveredAt('chr17', 1000), mapping)).toBe(4)
})

test('genomeHoverToTranscriptPos ignores a hover on another refName', () => {
  // the same numeric coordinate on an unrelated chromosome matches a g2p key,
  // so without the refName gate this reported residue 4 for a different locus
  expect(
    genomeHoverToTranscriptPos(hoveredAt('chr1', 1000), mapping),
  ).toBeUndefined()
})

test('genomeHoverToTranscriptPos returns undefined off the CDS', () => {
  expect(
    genomeHoverToTranscriptPos(hoveredAt('chr17', 1001), mapping),
  ).toBeUndefined()
})

test('genomeHoverToTranscriptPos tolerates no mapping and no hover', () => {
  expect(
    genomeHoverToTranscriptPos(hoveredAt('chr17', 1000), undefined),
  ).toBeUndefined()
  expect(genomeHoverToTranscriptPos(undefined, mapping)).toBeUndefined()
  expect(genomeHoverToTranscriptPos({}, mapping)).toBeUndefined()
})

test('invertMap - simple case', () => {
  const map = { 0: 10, 1: 20, 2: 30 }
  const inverted = invertMap(map)
  expect(inverted[10]).toBe(0)
  expect(inverted[20]).toBe(1)
  expect(inverted[30]).toBe(2)
})

test('invertMap - empty map', () => {
  const map = {}
  const inverted = invertMap(map)
  expect(Object.keys(inverted)).toHaveLength(0)
})

test('invertMap - non-sequential values', () => {
  const map = { 5: 100, 10: 200, 15: 300 }
  const inverted = invertMap(map)
  expect(inverted[100]).toBe(5)
  expect(inverted[200]).toBe(10)
  expect(inverted[300]).toBe(15)
})

test('invertMap - alignment position mapping inversion', () => {
  // Simulates inverting structurePositionToAlignmentMap
  // structure pos -> alignment pos
  const structureToAlignment = { 0: 2, 1: 3, 2: 4, 3: 5 }
  // alignment pos -> structure pos
  const alignmentToStructure = invertMap(structureToAlignment)

  expect(alignmentToStructure[2]).toBe(0)
  expect(alignmentToStructure[3]).toBe(1)
  expect(alignmentToStructure[4]).toBe(2)
  expect(alignmentToStructure[5]).toBe(3)
  // positions 0,1 in alignment have no structure mapping
  expect(alignmentToStructure[0]).toBeUndefined()
  expect(alignmentToStructure[1]).toBeUndefined()
})
