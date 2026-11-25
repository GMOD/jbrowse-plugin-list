import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, it } from 'vitest'

import {
  codingTranscripts,
  hasInternalStop,
  isCodingFeature,
  translationCautions,
  uncodedTranscript,
} from './codingFeature'

function feature(type: string, subfeatures: SimpleFeature[] = []) {
  return new SimpleFeature({
    uniqueId: `${type}-${Math.random()}`,
    refName: 'chr1',
    start: 0,
    end: 100,
    type,
    subfeatures: subfeatures.map(s => s.toJSON()),
  })
}

describe('translationCautions', () => {
  const tagged = (tag: unknown) =>
    new SimpleFeature({
      uniqueId: 't',
      refName: 'chr1',
      start: 0,
      end: 100,
      type: 'mRNA',
      tag,
    })

  it('flags a stop inside the translation, not the one ending it', () => {
    expect(translationCautions(undefined, 'MKT*')).toEqual([])
    expect(translationCautions(undefined, 'MK*TL*')).toEqual(['internal stop'])
  })

  it("reads a GENCODE selenoprotein's interior stop as selenocysteine", () => {
    expect(
      translationCautions(tagged('basic,seleno,MANE_Select'), 'MCAAR*LAA*'),
    ).toEqual([])
    expect(hasInternalStop('MCAAR*LAA*', tagged(['seleno']))).toBe(false)
  })

  it("flags GENCODE's incomplete-CDS tags in either spelling of the tag list", () => {
    expect(translationCautions(tagged('basic,cds_start_NF'))).toEqual([
      'incomplete CDS',
    ])
    expect(translationCautions(tagged(['cds_end_NF']), 'M*K')).toEqual([
      'internal stop',
      'incomplete CDS',
    ])
    expect(translationCautions(tagged('MANE_Select'), 'MK')).toEqual([])
  })
})

describe('isCodingFeature', () => {
  it('finds a CDS anywhere below the feature', () => {
    const gene = feature('gene', [
      feature('mRNA', [feature('exon'), feature('CDS')]),
    ])
    expect(isCodingFeature(gene)).toBe(true)
  })

  it('is false for a transcript with exons only', () => {
    const lnc = feature('lnc_RNA', [feature('exon'), feature('exon')])
    expect(isCodingFeature(lnc)).toBe(false)
  })

  it('is false for a bare CDS with nothing to translate under it', () => {
    expect(isCodingFeature(feature('CDS'))).toBe(false)
  })
})

describe('codingTranscripts', () => {
  it('lists the gene-like children that carry CDS records', () => {
    const coding = feature('mRNA', [feature('CDS')])
    const retained = feature('transcript', [feature('exon')])
    const gene = feature('gene', [coding, retained])
    expect(codingTranscripts(gene).map(f => f.get('type'))).toEqual(['mRNA'])
  })

  it('is the feature itself when its CDS records hang directly off it', () => {
    const mrna = feature('mRNA', [feature('cds')])
    expect(codingTranscripts(mrna)).toEqual([mrna])
  })

  it('reaches a V_gene_segment the way it reaches an mRNA', () => {
    const gene = feature('gene', [feature('V_gene_segment', [feature('CDS')])])
    expect(codingTranscripts(gene)).toHaveLength(1)
  })
})

describe('uncodedTranscript', () => {
  const coding = feature('mRNA', [feature('CDS')])
  const retained = feature('transcript', [feature('exon')])
  const gene = feature('gene', [coding, retained])

  it('is the right-clicked transcript when it has no CDS', () => {
    expect(uncodedTranscript(gene, retained.id())?.id()).toBe(retained.id())
  })

  it('is nothing for a coding transcript, or with none right-clicked', () => {
    expect(uncodedTranscript(gene, coding.id())).toBeUndefined()
    expect(uncodedTranscript(gene)).toBeUndefined()
  })
})
