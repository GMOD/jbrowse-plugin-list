import { getGeneticCode } from '@jbrowse/core/util/geneticCodes'
import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { expect, test } from 'vitest'

import {
  clinVarCategory,
  isPathogenic,
  parseClinVarMissense,
  placeMissenseOnTranscript,
} from './clinVar'

const { codonTable } = getGeneticCode(1)

function vcfLine(
  pos: number,
  ref: string,
  alt: string,
  info: string,
  id = '12345',
) {
  return ['17', String(pos), id, ref, alt, '.', '.', info].join('\t')
}

const MISSENSE = 'MC=SO:0001583|missense_variant'

test('keeps every classified missense SNV with its id and terms, 0-based', () => {
  expect(
    parseClinVarMissense(
      vcfLine(
        7675088,
        'C',
        'T',
        `ALLELEID=1;CLNSIG=Benign/Likely_benign;${MISSENSE}`,
        '376638',
      ),
    ),
  ).toEqual({
    start: 7675087,
    ref: 'C',
    alt: 'T',
    id: '376638',
    significance: ['Benign', 'Likely_benign'],
  })
  expect(
    parseClinVarMissense(
      vcfLine(100, 'C', 'T', `CLNSIG=Pathogenic;${MISSENSE}`, '.'),
    )?.id,
  ).toBeUndefined()
})

test('drops what has no germline classification, is not missense, or is not one base', () => {
  const lines = [
    vcfLine(100, 'C', 'T', `ONC=Oncogenic;${MISSENSE}`),
    vcfLine(100, 'C', 'T', 'CLNSIG=Pathogenic;MC=SO:0001587|nonsense'),
    vcfLine(100, 'CT', 'AG', `CLNSIG=Pathogenic;${MISSENSE}`),
    vcfLine(100, 'C', '.', `CLNSIG=Pathogenic;${MISSENSE}`),
  ]
  expect(lines.map(parseClinVarMissense)).toEqual(lines.map(() => undefined))
})

test('the gravest term names the category, and a conflicted call is not pathogenic', () => {
  const cases: [string, string][] = [
    ['Pathogenic', 'pathogenic'],
    ['Pathogenic/Likely_pathogenic', 'pathogenic'],
    ['Likely_pathogenic|risk_factor', 'likely pathogenic'],
    ['Conflicting_classifications_of_pathogenicity', 'conflicting'],
    ['Uncertain_significance', 'uncertain'],
    ['Benign/Likely_benign', 'benign'],
    ['Likely_benign', 'likely benign'],
    ['drug_response', 'other'],
  ]
  for (const [clnsig, category] of cases) {
    const terms = clnsig.split(/[/|,]/)
    expect(clinVarCategory(terms)).toBe(category)
    expect(isPathogenic(terms)).toBe(
      category === 'pathogenic' || category === 'likely pathogenic',
    )
  }
})

// ATG GAA TGC TAA (M E C *) on the minus strand, the second codon split by
// an intron; the forward strand is the complement
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

test('each placed variant keeps its own record and names the change on the transcript', () => {
  const benign = {
    start: 13,
    ref: 'T',
    alt: 'G',
    id: '1',
    significance: ['Benign'],
  }
  const pathogenic = {
    start: 21,
    ref: 'C',
    alt: 'T',
    id: '2',
    significance: ['Pathogenic'],
  }
  // TGC to TGT, cysteine either way
  const synonymous = {
    start: 10,
    ref: 'G',
    alt: 'A',
    id: '3',
    significance: ['Benign'],
  }
  const { placed, residues, checked } = placeMissenseOnTranscript({
    variants: [benign, pathogenic, synonymous],
    p2gCodon: minus.p2gCodon,
    strand: minus.strand,
    genomeBase: position => GENOME[position],
    codonTable,
  })
  expect(placed).toEqual([
    { variant: benign, residue: 1, from: 'E', to: 'D' },
    { variant: pathogenic, residue: 1, from: 'E', to: 'K' },
  ])
  expect(residues).toEqual([0, 1, 2, 3])
  expect(checked).toBe(3)
})
