import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { expect, test } from 'vitest'

import { toTranscript } from '../test_data/positionLookups'
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

test('keeps the locus in plain digits, for whatever parses it', () => {
  expect(
    codonLocus(
      { refName: 'chr17', p2gCodon: { 0: [7674221, 7674220, 7674219] } },
      0,
    ),
  ).toBe('chr17:7674220-7674222')
})

test("writes the readout's locus with thousands separators", () => {
  expect(
    hoverReadout({
      hover: {},
      entity: undefined,
      structureToTranscript: undefined,
      transcript: '',
      locus: 'chr17:7674220-7674222',
    }),
  ).toBe('chr17:7,674,220-7,674,222')
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
      structureToTranscript: toTranscript({ 0: 2, 1: 3, 2: 4, 3: 5 }),
      transcript: 'PPMKAA',
      locus: 'chr1:10-12',
    }),
  ).toBe('K4 · chain A · chr1:10-12')
})

test('adds the transcript residue where the numbering disagrees with it', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1 },
      entity: CONSTRUCT,
      structureToTranscript: toTranscript({ 1: 7 }),
      transcript: 'PPPPPPPKAA',
      locus: undefined,
    }),
  ).toBe('K4 (transcript K8)')
})

test('adds the transcript residue where its letter differs from the structure', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1 },
      entity: CONSTRUCT,
      structureToTranscript: toTranscript({ 1: 3 }),
      transcript: 'PPMRAA',
      locus: undefined,
    }),
  ).toBe('K4 (transcript R4)')
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
      structureToTranscript: toTranscript({ 1: 3 }),
      transcript: 'PPMKAA',
      locus: undefined,
    }),
  ).toBe('chain B')
})

test('ends with the exon when one is given', () => {
  expect(
    hoverReadout({
      hover: { structureSeqPos: 1 },
      entity: CONSTRUCT,
      structureToTranscript: toTranscript({ 1: 3 }),
      transcript: 'PPMKAA',
      locus: 'chr1:10-12',
      exon: 'Exon 4',
    }),
  ).toBe('K4 · chr1:10-12 · Exon 4')
})
