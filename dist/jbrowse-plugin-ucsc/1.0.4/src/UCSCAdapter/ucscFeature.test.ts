import { describe, expect, test } from 'vitest'

import chainSelf from './__fixtures__/chainSelf.json'
import cosmicMuts from './__fixtures__/cosmicMuts.json'
import geneHancer from './__fixtures__/geneHancerInteractionsDoubleElite.json'
import knownGene from './__fixtures__/knownGene.json'
import ncbiRefSeq from './__fixtures__/ncbiRefSeq.json'
import nestedRepeats from './__fixtures__/nestedRepeats.json'
import phyloP from './__fixtures__/phyloP100way.json'
import rmsk from './__fixtures__/rmsk.json'
import { transcriptParts, ucscFeatureData } from './ucscFeature'

const HES4_PARTS = [
  { type: 'three_prime_UTR', start: 998961, end: 999058 },
  { type: 'CDS', start: 999058, end: 999432, phase: 2 },
  { type: 'CDS', start: 999525, end: 999613, phase: 0 },
  { type: 'CDS', start: 999691, end: 999973, phase: 0 },
  { type: 'five_prime_UTR', start: 999973, end: 1000172 },
]

describe('ucscFeatureData', () => {
  test('splits a bigGenePred transcript into UTR and CDS, named by gene', () => {
    const [, hes4] = knownGene.knownGene
    const data = ucscFeatureData(hes4!, knownGene.trackType, 'chr1')
    expect(data).toMatchObject({
      refName: 'chr1',
      start: 998961,
      end: 1000172,
      strand: -1,
      type: 'mRNA',
      name: 'HES4',
      description: 'ENST00000428771.6',
      reserved: '789624',
      subfeatures: HES4_PARTS,
    })
    expect(data).not.toHaveProperty('chromStarts')
  })

  test('marks a bigGenePred with no coding frames as a non-coding transcript', () => {
    const [lncRna] = knownGene.knownGene
    expect(ucscFeatureData(lncRna!, knownGene.trackType, 'chr1')).toMatchObject(
      {
        type: 'transcript',
        subfeatures: [{ type: 'exon', start: 995965, end: 998051 }],
      },
    )
  })

  test('reads genePred exons and CDS, named by name2', () => {
    const [refSeq] = ncbiRefSeq.ncbiRefSeq
    const data = ucscFeatureData(refSeq!, ncbiRefSeq.trackType, 'chr1')
    expect(data).toMatchObject({
      start: 998963,
      end: 1000097,
      type: 'mRNA',
      name: 'HES4',
      description: 'NM_001142467.2',
      subfeatures: expect.arrayContaining(
        HES4_PARTS.filter(part => part.type === 'CDS'),
      ),
    })
    expect(data).not.toHaveProperty('exonStarts')
  })

  test('keeps blocks of a non-gene bed12 untyped', () => {
    const [repeat] = nestedRepeats.nestedRepeats
    const data = ucscFeatureData(repeat!, nestedRepeats.trackType, 'chr1')
    expect(data).toMatchObject({
      name: 'MLT1G1',
      subfeatures: [
        { start: 1003378, end: 1003425 },
        { start: 1003499, end: 1003623 },
      ],
    })
    expect(data).not.toHaveProperty('type')
  })

  test('reads rmsk coordinates and names repeats by repName', () => {
    const [repeat] = rmsk.rmsk
    expect(ucscFeatureData(repeat!, rmsk.trackType, 'chr1')).toMatchObject({
      refName: repeat!.genoName,
      start: repeat!.genoStart,
      end: repeat!.genoEnd,
      name: repeat!.repName,
    })
  })

  test('reads chain target coordinates', () => {
    const [chain] = chainSelf.chainSelf
    expect(ucscFeatureData(chain!, chainSelf.trackType, 'chr1')).toMatchObject({
      refName: chain!.tName,
      start: chain!.tStart,
      end: chain!.tEnd,
    })
  })

  test('colors a bigInteract feature by its color column', () => {
    const [interaction] = geneHancer.geneHancerInteractionsDoubleElite
    expect(
      ucscFeatureData(interaction!, geneHancer.trackType, 'chr1'),
    ).toMatchObject({ itemRgb: interaction!.color, name: interaction!.name })
  })

  test('reads a bigBed with no blocks', () => {
    const [mutation] = cosmicMuts.cosmicMuts
    const data = ucscFeatureData(mutation!, cosmicMuts.trackType, 'chr17')
    expect(data).toMatchObject({
      start: mutation!.chromStart,
      end: mutation!.chromEnd,
      strand: -1,
      name: mutation!.name,
    })
    expect(data).not.toHaveProperty('subfeatures')
  })

  test('scores a wiggle value', () => {
    const [base] = phyloP.phyloP100way
    expect(ucscFeatureData(base!, phyloP.trackType, 'chr17')).toMatchObject({
      start: base!.start,
      end: base!.end,
      score: base!.value,
    })
  })

  test('keeps a feature at position 0', () => {
    expect(
      ucscFeatureData(
        { chrom: 'chrM', chromStart: 0, chromEnd: 10 },
        'bed 3',
        'chrM',
      ),
    ).toMatchObject({ start: 0, end: 10 })
  })
})

describe('transcriptParts', () => {
  const blocks = [
    { start: 998961, end: 999432 },
    { start: 999525, end: 999613 },
    { start: 999691, end: 1000172 },
  ]

  test('derives the phases exonFrames gives when exonFrames is absent', () => {
    expect(transcriptParts(blocks, 999058, 999973, -1, [])).toEqual(HES4_PARTS)
  })

  test('names the left UTR five prime on the plus strand', () => {
    expect(
      transcriptParts([{ start: 0, end: 30 }], 10, 20, 1, []).map(
        part => part.type,
      ),
    ).toEqual(['five_prime_UTR', 'CDS', 'three_prime_UTR'])
  })
})
