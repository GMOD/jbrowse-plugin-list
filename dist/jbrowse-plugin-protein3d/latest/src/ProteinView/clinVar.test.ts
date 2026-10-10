import { getGeneticCode } from '@jbrowse/core/util/geneticCodes'
import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { expect, test } from 'vitest'

import {
  clinVarBuild,
  clinVarRefName,
  isUnnumberedMitochondrion,
  isWrongBuild,
  parseClinVarSnv,
  pathogenicCountByTranscriptPosition,
} from './clinVar'

import type { ClinVarSnv } from './clinVar'

const { codonTable } = getGeneticCode(1)

function vcfLine(pos: number, ref: string, alt: string, info: string) {
  return ['17', String(pos), '12345', ref, alt, '.', '.', info].join('\t')
}

const MISSENSE = 'MC=SO:0001583|missense_variant'

test('keeps pathogenic and likely pathogenic missense SNVs, 0-based', () => {
  for (const clnsig of [
    'Pathogenic',
    'Likely_pathogenic',
    'Pathogenic/Likely_pathogenic',
    'Pathogenic/Likely_pathogenic/Pathogenic,_low_penetrance',
    'Likely_pathogenic|risk_factor',
  ]) {
    expect(
      parseClinVarSnv(
        vcfLine(7675088, 'C', 'T', `ALLELEID=1;CLNSIG=${clnsig};${MISSENSE}`),
      ),
    ).toEqual({ start: 7675087, ref: 'C', alt: 'T' })
  }
})

test('drops other classifications, consequences and variant shapes', () => {
  const lines = [
    vcfLine(100, 'C', 'T', `CLNSIG=Uncertain_significance;${MISSENSE}`),
    vcfLine(
      100,
      'C',
      'T',
      `CLNSIG=Conflicting_classifications_of_pathogenicity;CLNSIGCONF=Pathogenic(1)|Uncertain_significance(2);${MISSENSE}`,
    ),
    vcfLine(100, 'C', 'T', `CLNSIG=Benign/Likely_benign;${MISSENSE}`),
    vcfLine(100, 'C', 'T', 'CLNSIG=Pathogenic;MC=SO:0001587|nonsense'),
    vcfLine(
      100,
      'C',
      'T',
      'CLNSIG=Pathogenic;MC=SO:0001627|intron_variant,SO:0001819|synonymous_variant',
    ),
    // no germline classification, only an oncogenicity one
    vcfLine(100, 'C', 'T', `ONC=Oncogenic;${MISSENSE}`),
    vcfLine(100, 'CT', 'AG', `CLNSIG=Pathogenic;${MISSENSE}`),
    vcfLine(100, 'C', 'CA', `CLNSIG=Pathogenic;${MISSENSE}`),
    vcfLine(100, 'C', '.', `CLNSIG=Pathogenic;${MISSENSE}`),
    // CLNSIGINCL is not CLNSIG
    vcfLine(100, 'C', 'T', `CLNSIGINCL=1:Pathogenic;${MISSENSE}`),
  ]
  expect(lines.map(parseClinVarSnv)).toEqual(lines.map(() => undefined))
})

test('a missense call on any transcript passes the filter', () => {
  expect(
    parseClinVarSnv(
      vcfLine(
        100,
        'G',
        'A',
        'CLNSIG=Pathogenic;MC=SO:0001627|intron_variant,SO:0001583|missense_variant',
      ),
    ),
  ).toEqual({ start: 99, ref: 'G', alt: 'A' })
})

test('picks the build from the assembly name or an alias', () => {
  expect(clinVarBuild(['hg38'])).toBe('GRCh38')
  expect(clinVarBuild(['custom', 'GRCh38.p14'])).toBe('GRCh38')
  expect(clinVarBuild(['hg19'])).toBe('GRCh37')
  expect(clinVarBuild(['GRCh37'])).toBe('GRCh37')
  for (const names of [['hs1'], ['mm39'], ['hg38_patched'], []]) {
    expect(clinVarBuild(names)).toBeUndefined()
  }
})

// the version ranges of NCBI's revision history for GCF/GCA_000001405
test('picks the build from a RefSeq or GenBank accession', () => {
  const accessions: [string, string][] = [
    ['GCF_000001405.13', 'GRCh37'],
    ['GCF_000001405.25', 'GRCh37'],
    ['GCA_000001405.1', 'GRCh37'],
    ['GCA_000001405.14', 'GRCh37'],
    ['GCF_000001405.26', 'GRCh38'],
    ['GCF_000001405.40', 'GRCh38'],
    ['GCA_000001405.15', 'GRCh38'],
    ['GCA_000001405.29', 'GRCh38'],
  ]
  for (const [accession, build] of accessions) {
    expect(clinVarBuild(['custom', accession])).toBe(build)
  }
  for (const accession of [
    // T2T-CHM13, hs1
    'GCF_009914755.1',
    'GCA_009914755.4',
    // NCBI36, and a version nobody has checked yet
    'GCF_000001405.12',
    'GCF_000001405.41',
    'GCA_000001405.30',
    'GCF_000001405',
  ]) {
    expect(clinVarBuild([accession])).toBeUndefined()
  }
})

test("spells a chromosome the way NCBI's VCF does", () => {
  expect(clinVarRefName('chr17', 'GRCh38')).toBe('17')
  expect(clinVarRefName('17', 'GRCh37')).toBe('17')
  expect(clinVarRefName('chrX', 'GRCh37')).toBe('X')
  expect(clinVarRefName('chrM', 'GRCh38')).toBe('MT')
  expect(clinVarRefName('MT', 'GRCh38')).toBe('MT')
})

// GRCh38's chrM and GRCh37's MT are the rCRS; hg19's chrM is NC_001807
test("leaves hg19's chrM out of GRCh37's VCF", () => {
  expect(clinVarRefName('MT', 'GRCh37')).toBe('MT')
  for (const name of ['chrM', 'M', 'NC_001807.4']) {
    expect(isUnnumberedMitochondrion(name, 'GRCh37')).toBe(true)
    expect(clinVarRefName(name, 'GRCh37')).toBeUndefined()
    expect(isUnnumberedMitochondrion(name, 'GRCh38')).toBe(false)
  }
  expect(isUnnumberedMitochondrion('MT', 'GRCh37')).toBe(false)
})

// A minus-strand transcript of two coding exons, [20,25) then [7,14), reading
// ATG GAA TGC TAA (M E C *). The second codon is split by the intron: G and A
// at 21 and 20, its last A at 13. The forward strand is the complement.
const GENOME = 'NNNNNNNTTAGCATNNNNNNTCCATNNNNN'
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

function tally(variants: ClinVarSnv[], mapping = minus, genome = GENOME) {
  return pathogenicCountByTranscriptPosition({
    variants,
    p2gCodon: mapping.p2gCodon,
    strand: mapping.strand,
    genomeBase: position => genome[position],
    codonTable,
  })
}

function counts(variants: ClinVarSnv[], mapping = minus, genome = GENOME) {
  return [...tally(variants, mapping, genome).byPosition]
}

test('reads a minus-strand codon split by an intron in reading order', () => {
  expect(minus.p2gCodon[1]).toEqual([21, 20, 13])
  expect(
    counts([
      // GAA to GAC and to GAT, both aspartate, across the intron: one
      { start: 13, ref: 'T', alt: 'G' },
      { start: 13, ref: 'T', alt: 'A' },
      // GAA to AAA, lysine
      { start: 21, ref: 'C', alt: 'T' },
      // ATG to AAG, lysine
      { start: 23, ref: 'A', alt: 'T' },
    ]),
  ).toEqual([
    [0, 1],
    [1, 2],
    [2, 0],
    [3, 0],
  ])
})

test('skips what is not missense on this transcript, or disagrees with the genome', () => {
  expect(
    counts([
      // GAA to GAG, synonymous here
      { start: 13, ref: 'T', alt: 'C' },
      // TGC to TGA, nonsense here
      { start: 10, ref: 'G', alt: 'T' },
      // the stop codon TAA to CAA
      { start: 9, ref: 'A', alt: 'G' },
      // REF names a base the genome does not have
      { start: 12, ref: 'G', alt: 'C' },
      // intronic here
      { start: 16, ref: 'N', alt: 'A' },
    ]),
  ).toEqual([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ])
})

test('reads a plus-strand codon as the genome spells it', () => {
  const plus = genomeToTranscriptSeqMapping({
    refName: 'chr7',
    start: 2,
    end: 8,
    strand: 1,
    subfeatures: [{ refName: 'chr7', start: 2, end: 8, type: 'CDS', phase: 0 }],
  })
  // ATG GTG: valine to glutamate at the second codon's middle base
  expect(
    counts([{ start: 6, ref: 'T', alt: 'A' }], plus, 'NNatgGTGNN'),
  ).toEqual([
    [0, 0],
    [1, 1],
  ])
})

test('counts the variants that disagree with the genome on REF', () => {
  const result = tally([
    { start: 13, ref: 'T', alt: 'G' },
    { start: 12, ref: 'G', alt: 'C' },
    // off the coding sequence, so neither checked nor disagreeing
    { start: 16, ref: 'N', alt: 'A' },
  ])
  expect(result).toMatchObject({ checked: 2, disagreeing: 1 })
})

test('calls a build wrong when most of at least ten variants disagree', () => {
  expect(isWrongBuild({ checked: 10, disagreeing: 6 })).toBe(true)
  expect(isWrongBuild({ checked: 10, disagreeing: 5 })).toBe(false)
  // too few to say
  expect(isWrongBuild({ checked: 9, disagreeing: 9 })).toBe(false)
  expect(isWrongBuild({ checked: 0, disagreeing: 0 })).toBe(false)
})
