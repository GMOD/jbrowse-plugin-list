import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, it } from 'vitest'

import { translateTranscripts } from './calculateProteinSequence'

// ATG AAA TAA on the plus strand, padded either side so the transcripts sit at
// different offsets inside the gene span.
const GENOME = `TTTTATGAAATAAGGGGATGTGCTGATTTT`

function transcript(id: string, start: number, end: number) {
  return new SimpleFeature({
    uniqueId: id,
    refName: 'chr1',
    start,
    end,
    strand: 1,
    type: 'mRNA',
    subfeatures: [{ type: 'CDS', refName: 'chr1', start, end, phase: 0 }],
  })
}

describe('translateTranscripts', () => {
  it('fetches the gene span once and slices it per transcript', async () => {
    const spans: { start: number; end: number }[] = []
    const results = await translateTranscripts({
      transcripts: [transcript('a', 4, 13), transcript('b', 17, 26)],
      fetchSpan: async span => {
        spans.push({ start: span.start, end: span.end })
        return { seq: GENOME.slice(span.start, span.end) }
      },
    })

    expect(spans).toEqual([{ start: 4, end: 26 }])
    expect(results.map(r => r.seq)).toEqual(['MK*', 'MC*'])
  })

  it('leaves a transcript with no CDS untranslated rather than calling it 0aa', async () => {
    const noncoding = new SimpleFeature({
      uniqueId: 'noncoding',
      refName: 'chr1',
      start: 4,
      end: 13,
      strand: 1,
      type: 'mRNA',
    })
    const results = await translateTranscripts({
      transcripts: [transcript('a', 4, 13), noncoding],
      fetchSpan: async span => ({ seq: GENOME.slice(span.start, span.end) }),
    })

    expect(results[0]?.seq).toBe('MK*')
    // '' would show as a selectable "(0aa)" isoform the ranking could pick
    expect(results[1]?.seq).toBeUndefined()
  })

  it('leaves every transcript untranslated when the span comes back empty', async () => {
    const results = await translateTranscripts({
      transcripts: [transcript('a', 4, 13)],
      fetchSpan: async () => ({ seq: undefined }),
    })
    expect(results).toEqual([{ feature: expect.anything() }])
  })
})
