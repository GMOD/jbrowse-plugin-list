import { SimpleFeature } from '@jbrowse/core/util'
import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { expect, test } from 'vitest'

import {
  MAX_ALIGNMENT_GAP_BP,
  codonExon,
  exonColor,
  exonKeyEntries,
  exonLabel,
  exonStatus,
  exonsByTranscriptPosition,
  transcriptExons,
  withExon,
} from './exons'
import { RESIDUE_COLORS } from './residueColors'
import { genomeToTranscriptSeqMapping as featureMapping } from '../mappings'
import { feature as ttc39a } from '../test_data/gene'
import { toStructure } from '../test_data/positionLookups'

const row = (type: string, start: number, end: number) => ({
  refName: 'chr1',
  type,
  start,
  end,
  phase: 0,
})

// exons [0,10) [20,30) [40,50); the first is all 5' UTR, the coding sequence
// runs [24,30) then [40,46), so its two codons sit in exons 2 and 3
const plus = {
  refName: 'chr1',
  start: 0,
  end: 50,
  strand: 1,
  subfeatures: [
    row('exon', 0, 10),
    row('exon', 20, 30),
    row('exon', 40, 50),
    row('five_prime_UTR', 0, 10),
    row('five_prime_UTR', 20, 24),
    row('CDS', 24, 30),
    row('CDS', 40, 46),
    row('three_prime_UTR', 46, 50),
  ],
}

test('numbers a plus-strand transcript from its 5′ end, a UTR exon included', () => {
  const exons = transcriptExons(plus)
  expect(exons).toEqual({
    blocks: [
      { start: 0, end: 10 },
      { start: 20, end: 30 },
      { start: 40, end: 50 },
    ],
    numbering: 'transcript',
  })
  const byPosition = exonsByTranscriptPosition(
    exons,
    genomeToTranscriptSeqMapping(plus).p2gCodon,
  )
  expect([...byPosition]).toEqual([
    [0, { exon: 2 }],
    [1, { exon: 2 }],
    [2, { exon: 3 }],
    [3, { exon: 3 }],
  ])
})

test("numbers a minus-strand transcript from its 5′ end, the genome's right", () => {
  const exons = transcriptExons(ttc39a)
  expect(exons.numbering).toBe('transcript')
  expect(exons.blocks).toHaveLength(7)
  expect(exons.blocks[0]).toEqual({ start: 51_297_790, end: 51_297_990 })
  const byPosition = exonsByTranscriptPosition(
    exons,
    featureMapping(
      new SimpleFeature({ ...ttc39a, subfeatures: [...ttc39a.subfeatures] }),
    ).p2gCodon,
  )
  // exon 1 is all 5' UTR, so the start codon sits in exon 2, as GENCODE's
  // exon_number says; a CDS-only count would call it exon 1
  expect(byPosition.get(0)).toEqual({ exon: 2 })
  const last = Math.max(...byPosition.keys())
  expect(byPosition.get(last)).toEqual({ exon: 7 })
  const fixtureNumbers = ttc39a.subfeatures
    .filter(f => f.type === 'exon')
    .map(f => ({ start: f.start, number: Number(f.exon_number) }))
  for (const { start, number } of fixtureNumbers) {
    expect(exons.blocks[number - 1]?.start).toBe(start)
  }
})

test('a codon an intron splits takes the exon holding two of its bases', () => {
  // minus strand: [30,35) then [7,14); codon 1 is G A at 31, 30 and A at 13
  const minus = {
    refName: 'chr17',
    start: 7,
    end: 35,
    strand: -1,
    subfeatures: [row('CDS', 30, 35), row('CDS', 7, 14)],
  }
  const { p2gCodon } = genomeToTranscriptSeqMapping(minus)
  expect(p2gCodon[1]).toEqual([31, 30, 13])
  const byPosition = exonsByTranscriptPosition(transcriptExons(minus), p2gCodon)
  expect(byPosition.get(0)).toEqual({ exon: 1 })
  expect(byPosition.get(1)).toEqual({ exon: 1, codonExons: [1, 2] })
  expect(byPosition.get(2)).toEqual({ exon: 2 })
  expect(exonLabel({ exon: 1, codonExons: [1, 2] }, 'transcript')).toBe(
    'Exon 1 (codon spans 1/2)',
  )
})

test('the hover names an exon as the legend numbers it', () => {
  expect(exonLabel({ exon: 3 }, 'coding')).toBe('Coding exon 3')
  expect(exonLabel({ exon: 1, codonExons: [1, 2] }, 'coding')).toBe(
    'Coding exon 1 (codon spans 1/2)',
  )
  expect(exonLabel({ exon: 3 }, 'transcript')).toBe('Exon 3')
})

test('one base before the intron gives the codon to the exon after it', () => {
  const blocks = [
    { start: 0, end: 10 },
    { start: 20, end: 30 },
  ]
  expect(codonExon(blocks, [9, 20, 21])).toEqual({
    exon: 2,
    codonExons: [1, 2],
  })
  expect(codonExon(blocks, [12, 13, 14])).toBeUndefined()
})

test('rebuilds exons from CDS and UTR rows that touch, as a bigBed transcript gives them', () => {
  const bigBed = {
    strand: 1,
    subfeatures: [
      row('five_prime_UTR', 0, 10),
      row('five_prime_UTR', 20, 24),
      row('CDS', 24, 30),
      row('CDS', 40, 46),
      row('three_prime_UTR', 46, 50),
    ],
  }
  expect(transcriptExons(bigBed)).toEqual(transcriptExons(plus))
})

// NM_001003035.1, canine SOD1, as UCSC's canFam4 ncbiRefSeq gives it: the
// RefSeq's alignment to the genome opens a 1-bp gap at 27125696, inside the
// fourth exon of a five-exon gene
const sod1 = {
  strand: 1,
  subfeatures: [
    row('five_prime_UTR', 27118828, 27118834),
    row('CDS', 27118834, 27118906),
    row('CDS', 27123011, 27123105),
    row('CDS', 27124754, 27124824),
    row('CDS', 27125647, 27125696),
    row('CDS', 27125697, 27125766),
    row('CDS', 27126823, 27126931),
    row('three_prime_UTR', 27126931, 27126937),
  ],
}

test('an alignment indel inside an exon is not an intron', () => {
  const { blocks } = transcriptExons(sod1)
  expect(blocks).toEqual([
    { start: 27118828, end: 27118906 },
    { start: 27123011, end: 27123105 },
    { start: 27124754, end: 27124824 },
    { start: 27125647, end: 27125766 },
    { start: 27126823, end: 27126937 },
  ])
  expect(codonExon(blocks, [27125694, 27125695, 27125697])).toEqual({
    exon: 4,
  })
})

test('a short intron stays, Stentor’s 15 bp and a gap just past an indel', () => {
  const exons = (gap: number) =>
    transcriptExons({
      strand: 1,
      subfeatures: [row('exon', 0, 30), row('exon', 30 + gap, 60 + gap)],
    }).blocks.length
  expect(exons(1)).toBe(1)
  expect(exons(MAX_ALIGNMENT_GAP_BP)).toBe(1)
  expect(exons(MAX_ALIGNMENT_GAP_BP + 1)).toBe(2)
  expect(exons(15)).toBe(2)
})

test('counts coding exons when the transcript names CDS alone', () => {
  const cdsOnly = {
    strand: 1,
    subfeatures: [row('CDS', 24, 30), row('CDS', 40, 46)],
  }
  const exons = transcriptExons(cdsOnly)
  expect(exons).toEqual({
    blocks: [
      { start: 24, end: 30 },
      { start: 40, end: 46 },
    ],
    numbering: 'coding',
  })
  expect(exonColor(exons).title).toBe('Coding exon')
})

test('cycles the palette over the exons, and keys each color with every exon it paints', () => {
  const blocks = Array.from({ length: 20 }, (_, i) => ({
    start: i * 10,
    end: i * 10 + 5,
  }))
  const color = exonColor({ blocks, numbering: 'transcript' })
  const palette = RESIDUE_COLORS.exon.range
  expect(color.domain).toHaveLength(20)
  expect(color.range[0]).toBe(palette[0])
  expect(color.range[9]).toBe(palette[0])
  expect(color.range[19]).toBe(palette[1])
  const key = exonKeyEntries(color)
  expect(key).toHaveLength(palette.length)
  expect(key[0]).toEqual({ label: 'Exons 1, 10, 19', color: palette[0] })
  expect(key[8]).toEqual({ label: 'Exons 9, 18', color: palette[8] })
  expect(
    exonKeyEntries(
      exonColor({ blocks: blocks.slice(0, 2), numbering: 'coding' }),
    ),
  ).toEqual([
    { label: 'Coding exon 1', color: palette[0] },
    { label: 'Coding exon 2', color: palette[1] },
  ])
})

test("places exon numbers on the structure's residues through the alignment", () => {
  const exons = transcriptExons(plus)
  const byPosition = exonsByTranscriptPosition(
    exons,
    genomeToTranscriptSeqMapping(plus).p2gCodon,
  )
  const entity = { entityId: '1', seqIds: [1, 2, 3] }
  // transcript residue 3 is past the structure's end, so it stays grey
  const status = exonStatus({
    exons,
    byPosition,
    entity,
    transcriptToStructure: toStructure({ 0: 0, 1: 1, 2: 2 }),
  })
  expect(status.placed).toEqual({
    entityId: '1',
    byLabelSeqId: new Map([
      [1, 2],
      [2, 2],
      [3, 3],
    ]),
  })
  expect(status.color?.domain).toEqual(['1', '2', '3'])
  expect(status.message).toBeUndefined()
  expect(
    exonStatus({ exons, byPosition, entity, transcriptToStructure: undefined }),
  ).toEqual({ color: status.color })
  expect(
    exonStatus({
      exons: undefined,
      byPosition: new Map(),
      entity,
      transcriptToStructure: undefined,
    }).message,
  ).toBe('There is no transcript, so no exons to color by')
  expect(
    exonStatus({
      exons,
      byPosition,
      entity,
      transcriptToStructure: toStructure({}),
    }).message,
  ).toBe("No exon reaches this structure's residues")
})

test('a located residue carries its exon', () => {
  const byPosition = new Map([
    [0, { exon: 2 }],
    [1, { exon: 2, codonExons: [2, 3] }],
  ])
  expect(
    withExon({ transcriptResidue: 2, residue: 5 }, byPosition, 'coding'),
  ).toEqual({
    transcriptResidue: 2,
    residue: 5,
    exon: 2,
    codonExons: [2, 3],
    exonNumbering: 'coding',
  })
  expect(withExon({ residue: 5 }, byPosition, 'coding')).toEqual({
    residue: 5,
  })
  expect(withExon(undefined, byPosition, 'coding')).toBeUndefined()
})
