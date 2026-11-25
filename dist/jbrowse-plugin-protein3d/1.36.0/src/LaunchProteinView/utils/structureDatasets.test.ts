import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, it } from 'vitest'

import {
  datasetMatches,
  parseStructureMapping,
  structuresFor,
} from './structureDatasets'

import type { StructureDataset } from './structureDatasets'

const BASE = 'https://example.org/folds/mapping.tsv'

const DATASET: StructureDataset = {
  datasetId: 'colabfold',
  name: 'ColabFold',
  description: 'Every protein of the assembly',
  mappingLocation: { locationType: 'UriLocation', uri: BASE },
}

function cds(uniqueId: string, extra: Record<string, unknown> = {}) {
  return {
    uniqueId,
    type: 'CDS',
    refName: 'chr1',
    start: 100,
    end: 400,
    ...extra,
  }
}

function transcript(uniqueId: string, extra: Record<string, unknown> = {}) {
  return {
    uniqueId,
    type: 'mRNA',
    refName: 'chr1',
    start: 100,
    end: 400,
    subfeatures: [cds(`${uniqueId}-cds`)],
    ...extra,
  }
}

function gene(
  transcripts: ReturnType<typeof transcript>[],
  extra: Record<string, unknown> = {},
) {
  return new SimpleFeature({
    uniqueId: 'gene',
    type: 'gene',
    refName: 'chr1',
    start: 100,
    end: 400,
    subfeatures: transcripts,
    ...extra,
  })
}

describe('parseStructureMapping', () => {
  it('reads id, url, accession and label, and resolves urls against the file', () => {
    const mapping = parseStructureMapping(
      [
        '#transcript_id\turl\tuniprot\tlabel',
        'ENST00000369535.5\tNRAS.pdb\tP01111\tNRAS rank 1',
        'ENST00000311936.8\thttps://cdn.example.org/KRAS.cif',
        '',
        'NM_000546.6\t../other/TP53.cif\t\tTP53 model\r',
      ].join('\n'),
      BASE,
    )
    expect(structuresFor(mapping, 'ENST00000369535.5')).toEqual([
      {
        id: 'ENST00000369535.5',
        url: 'https://example.org/folds/NRAS.pdb',
        uniprotId: 'P01111',
        label: 'NRAS rank 1',
      },
    ])
    expect(structuresFor(mapping, 'ENST00000311936.8')[0]?.url).toBe(
      'https://cdn.example.org/KRAS.cif',
    )
    expect(structuresFor(mapping, 'NM_000546.6')[0]).toEqual({
      id: 'NM_000546.6',
      url: 'https://example.org/other/TP53.cif',
      uniprotId: undefined,
      label: 'TP53 model',
    })
  })

  it('skips a line whose url does not parse', () => {
    const mapping = parseStructureMapping(
      'TP53\thttp://[broken\nTP53\tTP53.pdb\n',
      BASE,
    )
    expect(structuresFor(mapping, 'TP53').map(s => s.url)).toEqual([
      'https://example.org/folds/TP53.pdb',
    ])
  })

  it('keeps every row an id lists, in file order', () => {
    const mapping = parseStructureMapping(
      'TP53\tTP53_rank_1.pdb\nTP53\tTP53_rank_2.pdb\n',
      BASE,
    )
    expect(structuresFor(mapping, 'TP53').map(s => s.url)).toEqual([
      'https://example.org/folds/TP53_rank_1.pdb',
      'https://example.org/folds/TP53_rank_2.pdb',
    ])
  })
})

describe('structuresFor', () => {
  const mapping = parseStructureMapping(
    [
      'ENST00000369535.5\tNRAS.pdb',
      'ENST00000311936\tKRAS.pdb',
      'AT1G01010.1\tNAC001.1.pdb',
      'transcript:ENST00000269305\tTP53.pdb',
    ].join('\n'),
    BASE,
  )
  const url = (id: string) => structuresFor(mapping, id).map(s => s.url)

  it('ignores a version written on only one side', () => {
    expect(url('ENST00000369535')).toEqual([
      'https://example.org/folds/NRAS.pdb',
    ])
    expect(url('ENST00000311936.8')).toEqual([
      'https://example.org/folds/KRAS.pdb',
    ])
  })

  it('tells two versions apart', () => {
    expect(url('ENST00000369535.4')).toEqual([])
    expect(url('AT1G01010.2')).toEqual([])
    expect(url('AT1G01010.1')).toEqual([
      'https://example.org/folds/NAC001.1.pdb',
    ])
  })

  it("drops Ensembl's and NCBI's id prefixes on either side", () => {
    expect(url('transcript:ENST00000369535.5')).toEqual([
      'https://example.org/folds/NRAS.pdb',
    ])
    expect(url('ENST00000269305.9')).toEqual([
      'https://example.org/folds/TP53.pdb',
    ])
  })
})

describe('datasetMatches', () => {
  const mapping = parseStructureMapping(
    [
      'ENST0002.1\tiso2.pdb',
      'ENST0001.1\tiso1.pdb',
      'XP_0003.1\tiso3.pdb',
      'GENE1\tgene.pdb',
      'GENE1\tiso1.pdb',
    ].join('\n'),
    BASE,
  )
  const matches = (feature: SimpleFeature, preferredTranscriptId?: string) =>
    datasetMatches({
      dataset: DATASET,
      mapping,
      feature,
      preferredTranscriptId,
    }).map(m => ({
      url: m.structure.url.replace('https://example.org/folds/', ''),
      transcript: m.transcript?.id(),
    }))

  const isoforms = [
    transcript('t1', { id: 'ENST0001.1' }),
    transcript('t2', { transcript_id: 'ENST0002', tag: 'MANE_Select' }),
    transcript('t3', {
      name: 'other',
      subfeatures: [cds('t3-cds', { protein_id: 'XP_0003.1' })],
    }),
    transcript('t4', { id: 'ENST0004.1' }),
  ]

  it('leads with the right-clicked isoform, then the flagged one, then the gene', () => {
    expect(matches(gene(isoforms, { gene_name: 'GENE1' }), 't3')).toEqual([
      { url: 'iso3.pdb', transcript: 't3' },
      { url: 'iso2.pdb', transcript: 't2' },
      { url: 'iso1.pdb', transcript: 't1' },
      { url: 'gene.pdb', transcript: undefined },
    ])
  })

  it('lists a structure once, under its transcript rather than the gene', () => {
    const urls = matches(gene(isoforms, { gene_name: 'GENE1' })).map(m => m.url)
    expect(urls.filter(u => u === 'iso1.pdb')).toHaveLength(1)
    expect(urls[0]).toBe('iso2.pdb')
  })

  it('offers nothing for a gene none of whose ids the file lists', () => {
    expect(
      matches(gene([transcript('t9', { id: 'ENST0009.1' })], { name: 'X' })),
    ).toEqual([])
  })

  it('reads a transcript-less gene, as a prokaryote writes one, by its own ids', () => {
    const operon = new SimpleFeature({
      uniqueId: 'recA',
      type: 'gene',
      refName: 'chr',
      start: 1,
      end: 900,
      name: 'GENE1',
      subfeatures: [cds('recA-cds', { protein_id: 'XP_0003.1' })],
    })
    expect(matches(operon)).toEqual([
      { url: 'gene.pdb', transcript: 'recA' },
      { url: 'iso1.pdb', transcript: 'recA' },
      { url: 'iso3.pdb', transcript: 'recA' },
    ])
  })
})
