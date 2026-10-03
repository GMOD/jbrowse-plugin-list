import { genePins } from '@jbrowse/bandage-core/genes/genePins'
import { convertGFAToGraph } from '@jbrowse/bandage-core/gfa/gfaConverter'
import { parseGFA } from '@jbrowse/bandage-core/gfa-core/index'
import {
  featuresOnBackbone,
  graphBackbone,
} from '@jbrowse/bandage-core/reference'

import { geneModelsFrom, pickGeneTrack } from './geneFeatures'

const gene = {
  type: 'gene',
  name: 'LPA',
  refName: 'chr1',
  start: 2,
  end: 18,
  strand: -1,
  subfeatures: [
    {
      type: 'mRNA',
      start: 2,
      end: 18,
      subfeatures: [
        { type: 'exon', start: 2, end: 5 },
        { type: 'exon', start: 12, end: 18 },
      ],
    },
    {
      type: 'mRNA',
      start: 2,
      end: 16,
      subfeatures: [
        { type: 'exon', start: 3, end: 6 },
        { type: 'exon', start: 12, end: 16 },
      ],
    },
  ],
}

test('a gene merges the exons of every transcript under it', () => {
  const [g] = geneModelsFrom([gene])
  expect(g).toMatchObject({
    name: 'LPA',
    start: 2,
    end: 18,
    strand: -1,
    exons: [
      { start: 2, end: 6 },
      { start: 12, end: 18 },
    ],
  })
  expect(geneModelsFrom([{ id: 'x', start: 0, end: 4 }])[0]!.exons).toEqual([
    { start: 0, end: 4 },
  ])
})

// A BED track gives one feature per transcript, and JBrowse splits a coding
// block into CDS and UTR parts
const bedTranscript = (start: number, end: number, cdsEnd: number) => ({
  type: 'mRNA',
  name: 'AMY1C',
  refName: 'ctg',
  start,
  end,
  strand: 1,
  subfeatures: [
    { type: 'five_prime_UTR', start, end: start + 10 },
    { type: 'CDS', start: start + 10, end: cdsEnd },
    { type: 'three_prime_UTR', start: end - 10, end },
  ],
})

test("a BED gene's transcripts merge, its copies stay apart, CDS and UTR count as exons", () => {
  const genes = geneModelsFrom([
    bedTranscript(1000, 1100, 1040),
    bedTranscript(1020, 1100, 1060),
    bedTranscript(9000, 9100, 9040),
  ])
  expect(genes.map(g => [g.name, g.start, g.end])).toEqual([
    ['AMY1C', 1000, 1100],
    ['AMY1C', 9000, 9100],
  ])
  expect(genes[0]!.exons).toEqual([
    { start: 1000, end: 1060 },
    { start: 1090, end: 1100 },
  ])
})

test('a BED track counts as genes only where its name says so', () => {
  expect(
    pickGeneTrack([{ trackId: 'peaks', adapterType: 'BedTabixAdapter' }], ''),
  ).toBeUndefined()
})

test('BED tracks count as gene tracks', () => {
  expect(
    pickGeneTrack(
      [{ trackId: 'HG00097.1_cat_genes', adapterType: 'BedTabixAdapter' }],
      '',
    )?.trackId,
  ).toBe('HG00097.1_cat_genes')
})

test('the gene track is the named one, else the annotation-looking one', () => {
  const tracks = [
    { trackId: 'reads', adapterType: 'BamAdapter' },
    { trackId: 'repeats', name: 'RepeatMasker', adapterType: 'BigBedAdapter' },
    {
      trackId: 'ncbi',
      name: 'NCBI RefSeq genes',
      adapterType: 'Gff3TabixAdapter',
    },
  ]
  expect(pickGeneTrack(tracks, '')?.trackId).toBe('ncbi')
  expect(pickGeneTrack(tracks, 'repeats')?.trackId).toBe('repeats')
  expect(pickGeneTrack(tracks.slice(0, 1), '')).toBeUndefined()
})

// v1 covers chr1:0-10 and v2 chr1:10-20, each drawn as a straight 100-unit
// line; a1 is an allele with no coordinates and gets nothing.
const GFA = `S\tv1\t${'A'.repeat(10)}\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\t${'C'.repeat(10)}\tSN:Z:chr1\tSO:i:10\tSR:i:0
S\ta1\tTTT\tSN:Z:foo\tSO:i:0\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv1\t+\ta1\t+\t0M
L\ta1\t+\tv2\t+\t0M`
const graph = convertGFAToGraph(parseGFA(GFA))
const positions = {
  'v1+': [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  'v2+': [
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
  'a1+': [{ x: 50, y: 30 }],
}

test('exons land on the backbone stretch they cover, and the name at the midpoint', () => {
  const [pin] = genePins(graph, geneModelsFrom([gene]), positions)
  expect(pin!.exons).toBe('M20,0L60,0M100,20L100,80')
  expect(pin!.exonsByNode).toEqual([
    { nodeId: 'v1+', d: 'M20,0L60,0' },
    { nodeId: 'v2+', d: 'M100,20L100,80' },
  ])
  expect(pin!.at).toEqual({ x: 100, y: 0 })
  expect(pin!.covered).toBe(1)
})

test('a PanSN-named backbone carries a gene named by its contig once renamed onto it', () => {
  const pansn = convertGFAToGraph(
    parseGFA(GFA.replaceAll('SN:Z:chr1', 'SN:Z:GRCh38#0#chr1')),
  )
  const genes = geneModelsFrom([gene])
  expect(genePins(pansn, genes, positions)).toEqual([])
  const renamed = featuresOnBackbone(genes, graphBackbone(pansn)!)
  expect(genePins(pansn, renamed, positions)).toHaveLength(1)
})

test('a gene on another sequence pins nothing', () => {
  expect(
    genePins(graph, geneModelsFrom([{ ...gene, refName: 'chr2' }]), positions),
  ).toEqual([])
})

// A gene reads only the backbone nodes it lies over, found by their offsets.
// `long` begins 990 bp before the gene and still carries its first 5 bp, so
// the search has to reach back by the longest node, not start at the gene.
test('a gene inside a long node that begins well before it still lands on it', () => {
  const long = convertGFAToGraph(
    parseGFA(
      [
        'S\tlong\t*\tLN:i:1000\tSN:Z:chr1\tSO:i:0\tSR:i:0',
        'S\tnext\t*\tLN:i:10\tSN:Z:chr1\tSO:i:1000\tSR:i:0',
        'S\tlast\t*\tLN:i:10\tSN:Z:chr1\tSO:i:1010\tSR:i:0',
        'L\tlong\t+\tnext\t+\t0M',
        'L\tnext\t+\tlast\t+\t0M',
      ].join('\n'),
    ),
  )
  const drawn = {
    'long+': [
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
    ],
    'next+': [
      { x: 1000, y: 0 },
      { x: 1010, y: 0 },
    ],
    'last+': [
      { x: 1010, y: 0 },
      { x: 1020, y: 0 },
    ],
  }
  const [pin] = genePins(
    long,
    [
      {
        name: 'G',
        refName: 'chr1',
        start: 995,
        end: 1005,
        strand: 1,
        exons: [{ start: 995, end: 1005 }],
      },
    ],
    drawn,
  )
  expect(pin!.covered).toBe(1)
  expect(pin!.exons).toBe('M995,0L1000,0M1000,0L1005,0')
})
