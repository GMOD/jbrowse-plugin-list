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
  expect(geneModelsFrom([{ name: 'x', start: 0, end: 4 }])[0]!.exons).toEqual([
    { start: 0, end: 4 },
  ])
})

// Every RefSeq GFF3 opens each molecule with one of these, named ANONYMOUS
const ncbiRegion = {
  type: 'region',
  name: 'ANONYMOUS',
  gbkey: 'Src',
  refName: 'chr',
  start: 0,
  end: 4_641_652,
}

test('a whole-sequence record is no gene', () => {
  expect(geneModelsFrom([ncbiRegion, gene]).map(g => g.name)).toEqual(['LPA'])
})

// RefSeq names its unnamed records by their span, `id-<accession>:<range>`,
// and a gene record carries its symbol as `gene` too
test('a record is named by its name or gene, never by its raw ID', () => {
  const element = {
    type: 'mobile_genetic_element',
    id: 'id-NC_000913.3:1978503..1979270',
    refName: 'chr',
    start: 1_978_502,
    end: 1_979_270,
  }
  const transposase = {
    type: 'gene',
    id: 'gene-b1993',
    gene: 'insB5',
    refName: 'chr',
    start: 1_978_600,
    end: 1_979_100,
  }
  expect(geneModelsFrom([element, transposase]).map(g => g.name)).toEqual([
    'insB5',
  ])
})

// jbrowse.org/ucsc/hg38/ncbiRefSeq.gff.gz at CFH, as the GFF3 adapter serializes
// it: the gene record's only names are its ID and gene_id
test('a UCSC ncbiRefSeq gene is named by its gene_id', () => {
  const cfh = {
    type: 'gene',
    id: 'CFH',
    gene_id: 'CFH',
    refName: 'chr1',
    start: 196_652_042,
    end: 196_747_504,
    strand: 1,
    subfeatures: [
      {
        type: 'transcript',
        id: 'NM_000186.4',
        name: 'NM_000186.4',
        gene_name: 'CFH',
        gene_id: 'CFH',
        start: 196_652_042,
        end: 196_747_504,
        subfeatures: [
          { type: 'exon', start: 196_652_042, end: 196_652_175 },
          { type: 'exon', start: 196_746_000, end: 196_747_504 },
        ],
      },
    ],
  }
  expect(geneModelsFrom([cfh])).toMatchObject([
    {
      name: 'CFH',
      exons: [
        { start: 196_652_042, end: 196_652_175 },
        { start: 196_746_000, end: 196_747_504 },
      ],
    },
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

// `ecoli_pggb.tier50` at K12's IS5 insertion: the tier collapses the bubble to
// one rank-1 node on K12's own coordinates, so the backbone has a hole where
// the element is, and insH21 lies wholly inside it
const TIER = [
  'S\tbb_chr_1295416\t*\tLN:i:4081\tSN:Z:chr\tSO:i:1295416\tSR:i:0',
  'S\t79945@1299497\t*\tLN:i:1200\tSN:Z:chr\tSO:i:1299497\tSR:i:1',
  'S\tbb_chr_1300697\t*\tLN:i:15043\tSN:Z:chr\tSO:i:1300697\tSR:i:0',
  'L\tbb_chr_1295416\t+\t79945@1299497\t+\t0M',
  'L\t79945@1299497\t+\tbb_chr_1300697\t+\t0M',
].join('\n')
const tierPositions = {
  'bb_chr_1295416+': [
    { x: 1_295_416, y: 0 },
    { x: 1_299_497, y: 0 },
  ],
  '79945@1299497+': [
    { x: 1_299_497, y: 20 },
    { x: 1_300_697, y: 20 },
  ],
  'bb_chr_1300697+': [
    { x: 1_300_697, y: 0 },
    { x: 1_315_740, y: 0 },
  ],
}
const k12Gene = (name: string, start: number, end: number) => ({
  name,
  refName: 'chr',
  start,
  end,
  strand: 1,
  exons: [{ start, end }],
})

test("a tier's bubble node carries the genes on the reference span it stands for", () => {
  const pins = genePins(
    convertGFAToGraph(parseGFA(TIER)),
    [
      k12Gene('insH21', 1_299_566, 1_300_547),
      k12Gene('oppA', 1_301_181, 1_302_813),
    ],
    tierPositions,
  )
  expect(
    pins.map(p => [p.gene.name, p.at.y, [...p.nodeIds], p.covered]),
  ).toEqual([
    ['insH21', 20, ['79945@1299497+'], 1],
    ['oppA', 0, ['bb_chr_1300697+'], 1],
  ])
})
