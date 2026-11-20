import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, it } from 'vitest'

import { codingTranscripts, isCodingFeature } from './codingFeature'

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
