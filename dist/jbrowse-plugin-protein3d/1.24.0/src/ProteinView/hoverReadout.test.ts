import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { expect, test } from 'vitest'

import { codonLocus, hoverReadout } from './hoverReadout'

import type { Entity } from 'p2s_mapper'

// A minus-strand transcript of two coding exons, [20,25) then [7,14): its
// second codon is split by the intron, G and A at 21 and 20, the last A at 13
const minus = genomeToTranscriptSeqMapping({
  refName: 'chr17',
  start: 7,
  end: 25,
  strand: -1,
  subfeatures: [
    { refName: 'chr17', start: 20, end: 25, type: 'CDS', phase: 0 },
    { refName: 'chr17', start: 7, end: 14, type: 'CDS', phase: 0 },
  ],
})

test('names a codon as a 1-based locString on the transcript refName', () => {
  expect(codonLocus(minus, 0)).toBe('chr17:23-25')
})

test('a codon split by an intron spans it', () => {
  expect(minus.p2gCodon[1]).toEqual([21, 20, 13])
  expect(codonLocus(minus, 1)).toBe('chr17:14-22')
})

test('names no locus without a mapping or a mapped residue', () => {
  expect(codonLocus(undefined, 0)).toBeUndefined()
  expect(codonLocus(minus, undefined)).toBeUndefined()
  expect(codonLocus(minus, 99)).toBeUndefined()
})

// a construct whose label ids run 1..4, numbered by its authors from 3
const CONSTRUCT: Entity = {
  entityId: '1',
  seq: 'MKAA',
  seqIds: [1, 2, 3, 4],
  authSeqIds: [3, 4, 5, 6],
  chains: ['A'],
}

test('reads the author number, letter, chain and locus of a hovered residue', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1, chain: 'A' },
      entity: CONSTRUCT,
      structureToTranscript: { 0: 2, 1: 3, 2: 4, 3: 5 },
      transcript: 'PPMKAA',
      locus: 'chr1:10-12',
    }),
  ).toBe('4, Structure: K, Chain: A, chr1:10-12')
})

test('adds the transcript residue where the numbering disagrees with it', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1 },
      entity: CONSTRUCT,
      structureToTranscript: { 1: 7 },
      transcript: 'PPPPPPPKAA',
      locus: undefined,
    }),
  ).toBe('4, Transcript residue: 8, Structure: K')
})

test('names the genome letter only where it differs from the structure', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1 },
      entity: CONSTRUCT,
      structureToTranscript: { 1: 3 },
      transcript: 'PPMRAA',
      locus: undefined,
    }),
  ).toBe('4, Structure: K, Genome: R')
})

test('counts from one when the entity is unknown', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1 },
      entity: undefined,
      structureToTranscript: undefined,
      transcript: '',
      locus: undefined,
    }),
  ).toBe('2')
})

test('a hover naming only a chain reads out the chain', () => {
  expect(
    hoverReadout({
      hover: { chain: 'B' },
      entity: CONSTRUCT,
      structureToTranscript: { 1: 3 },
      transcript: 'PPMKAA',
      locus: undefined,
    }),
  ).toBe('Chain: B')
})
