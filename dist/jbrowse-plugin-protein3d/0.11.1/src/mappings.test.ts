import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test } from 'vitest'

import {
  genomeToTranscriptSeqMapping,
  pairwiseAlignmentSequenceProblem,
  structurePositionToAlignmentMap,
  structureSeqVsTranscriptSeqMap,
  transcriptPositionToAlignmentMap,
  unmapStructurePositions,
} from './mappings'
import { feature, pairwiseAlignment } from './test_data/gene'

import type { PairwiseAlignment } from './mappings'

test('pairwiseAlignmentSequenceProblem: rows must spell the mapped sequences', () => {
  const pa: PairwiseAlignment = {
    consensus: '',
    alns: [
      { id: 'a', seq: 'MKAA*WYVL' },
      { id: 'b', seq: 'mkaa-WYVL' },
    ],
  }
  expect(pairwiseAlignmentSequenceProblem(pa, 'MKAA*WYVL', 'MKAAWYVL')).toBe(
    undefined,
  )
  // an alignment made against another isoform: same length, other residues
  expect(pairwiseAlignmentSequenceProblem(pa, 'MKAA*WYVL', 'MKAAWYVQ')).toMatch(
    /second sequence/,
  )
  expect(pairwiseAlignmentSequenceProblem(pa, 'MKAAWYVL', 'MKAAWYVL')).toMatch(
    /first sequence.*9 vs 8/,
  )
})

test('unmapStructurePositions splits a column so its residue maps to nothing', () => {
  const pa: PairwiseAlignment = {
    consensus: '|| |',
    alns: [
      { id: 'a', seq: 'MKQA' },
      { id: 'b', seq: 'MKGA' },
    ],
  }
  const unmapped = unmapStructurePositions(pa, new Set([2]))
  expect(unmapped.alns.map(r => r.seq)).toEqual(['MKQ-A', 'MK-GA'])
  expect(unmapped.consensus).toBe('||  |')
  expect(structureSeqVsTranscriptSeqMap(unmapped)).toEqual({
    structureSeqToTranscriptSeqPosition: { 0: 0, 1: 1, 3: 3 },
    transcriptSeqToStructureSeqPosition: { 0: 0, 1: 1, 3: 3 },
  })
  expect(unmapStructurePositions(pa, new Set([9]))).toBe(pa)
})

// 2RH1's loop paired with lysozyme in short blocks between gaps; alternating
// column by column it read as a zipper
test('unmapStructurePositions sets an unmapped region, gaps inside it included, apart as one block', () => {
  const pa: PairwiseAlignment = {
    consensus: '|| |  ||',
    alns: [
      { id: 'a', seq: 'MKQR-SWY' },
      { id: 'b', seq: 'MKGGG-WY' },
    ],
  }
  const unmapped = unmapStructurePositions(pa, new Set([2, 3]))
  expect(unmapped.alns.map(r => r.seq)).toEqual(['MKQRS---WY', 'MK---GGGWY'])
  expect(structureSeqVsTranscriptSeqMap(unmapped)).toEqual({
    structureSeqToTranscriptSeqPosition: { 0: 0, 1: 1, 5: 5, 6: 6 },
    transcriptSeqToStructureSeqPosition: { 0: 0, 1: 1, 5: 5, 6: 6 },
  })
})

// Two rows cut from a multiple alignment keep the columns only a third
// sequence filled; one used to advance the structure position, shifting every
// later residue.
test('structureSeqVsTranscriptSeqMap skips a column that is a gap in both rows', () => {
  const pa: PairwiseAlignment = {
    consensus: '',
    alns: [
      { id: 'a', seq: 'AC-D-E' },
      { id: 'b', seq: 'AC--YE' },
    ],
  }
  expect(structureSeqVsTranscriptSeqMap(pa)).toEqual({
    structureSeqToTranscriptSeqPosition: { 0: 0, 1: 1, 3: 3 },
    transcriptSeqToStructureSeqPosition: { 0: 0, 1: 1, 3: 3 },
  })
})

test('structureSeqVsTranscriptSeqMap snapshot', () => {
  const ret = structureSeqVsTranscriptSeqMap(pairwiseAlignment)
  expect(ret).toMatchSnapshot()
})

test('mapping', () => {
  // @ts-expect-error
  const res = genomeToTranscriptSeqMapping(new SimpleFeature(feature))
  const { p2g } = res
  const aln = structureSeqVsTranscriptSeqMap(pairwiseAlignment)

  // expected position in sequence
  const s2 = pairwiseAlignment.alns[1].seq
  expect(s2[392]).toBe('M')
  expect(s2[393]).toBe('K')
  expect(s2[394]).toBe('A')
  expect(s2[395]).toBe('A')
  // maps the 392 position in the "pdb version of the protein" to the 0th
  // position in the genome version of the protein, and then maps that back to
  // the genome. For reverse strand, p2g[0] is the highest position in the
  // first codon (end-1 of first CDS, since intervals are half-open [start, end))
  const p0 = aln.transcriptSeqToStructureSeqPosition[392]!
  const g0 = p2g[p0]
  expect(p0).toBe(0)
  expect(g0).toBe(51_296_154)
  expect(res).toMatchSnapshot()
})

test('structurePositionToAlignmentMap - identical sequences', () => {
  const alignment = {
    consensus: '||||',
    alns: [
      { id: 'a', seq: 'MKAA' },
      { id: 'b', seq: 'MKAA' },
    ],
  } as const
  const map = structurePositionToAlignmentMap(alignment)
  expect(map[0]).toBe(0)
  expect(map[1]).toBe(1)
  expect(map[2]).toBe(2)
  expect(map[3]).toBe(3)
})

test('structurePositionToAlignmentMap - with gaps in structure', () => {
  const alignment = {
    consensus: '|| ||',
    alns: [
      { id: 'a', seq: 'MKAAA' },
      { id: 'b', seq: 'MK-AA' },
    ],
  } as const
  const map = structurePositionToAlignmentMap(alignment)
  // structure seq is MK-AA, so positions 0,1 map to alignment 0,1
  // then position 2 (first A after gap) maps to alignment 3
  expect(map[0]).toBe(0)
  expect(map[1]).toBe(1)
  expect(map[2]).toBe(3)
  expect(map[3]).toBe(4)
})

test('structurePositionToAlignmentMap - with leading gap', () => {
  const alignment = {
    consensus: ' ||||',
    alns: [
      { id: 'a', seq: 'AMKAA' },
      { id: 'b', seq: '-MKAA' },
    ],
  } as const
  const map = structurePositionToAlignmentMap(alignment)
  expect(map[0]).toBe(1)
  expect(map[1]).toBe(2)
  expect(map[2]).toBe(3)
  expect(map[3]).toBe(4)
})

test('transcriptPositionToAlignmentMap - identical sequences', () => {
  const alignment = {
    consensus: '||||',
    alns: [
      { id: 'a', seq: 'MKAA' },
      { id: 'b', seq: 'MKAA' },
    ],
  } as const
  const map = transcriptPositionToAlignmentMap(alignment)
  expect(map[0]).toBe(0)
  expect(map[1]).toBe(1)
  expect(map[2]).toBe(2)
  expect(map[3]).toBe(3)
})

test('transcriptPositionToAlignmentMap - with gaps in transcript', () => {
  const alignment = {
    consensus: '|| ||',
    alns: [
      { id: 'a', seq: 'MK-AA' },
      { id: 'b', seq: 'MKAAA' },
    ],
  } as const
  const map = transcriptPositionToAlignmentMap(alignment)
  expect(map[0]).toBe(0)
  expect(map[1]).toBe(1)
  expect(map[2]).toBe(3)
  expect(map[3]).toBe(4)
})

test('structurePositionToAlignmentMap - range mapping for feature highlight', () => {
  // This test verifies the mapping used for protein feature track highlighting
  const alignment = {
    consensus: '  ||||||||  ',
    alns: [
      { id: 'a', seq: '--MKAAYLSM--' },
      { id: 'b', seq: 'XXMKAAYLSMXX' },
    ],
  } as const
  const map = structurePositionToAlignmentMap(alignment)

  // If we have a feature at structure positions 2-9 (0-based: MKAAYLSM)
  // it should map to alignment positions 2-9
  const featureStart = 2
  const featureEnd = 9
  const alignmentStart = map[featureStart]
  const alignmentEnd = map[featureEnd]

  expect(alignmentStart).toBe(2)
  expect(alignmentEnd).toBe(9)
})
