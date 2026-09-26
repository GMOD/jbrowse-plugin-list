import { SimpleFeature } from '@jbrowse/core/util'
import { describe, expect, it } from 'vitest'

import { translateTranscripts } from './translateTranscripts'

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

  // GENCODE's chrM CDS rows declare no transl_table, so MT-CO1 read its TGA
  // tryptophans as stops until the assembly's { chrM: 2 } was consulted
  it("translates with the assembly's code unless the feature declares one", async () => {
    const mito = (uniqueId: string, cdsAttributes: Record<string, string>) =>
      new SimpleFeature({
        uniqueId,
        refName: 'chrM',
        start: 0,
        end: 12,
        strand: 1,
        type: 'mRNA',
        subfeatures: [
          { type: 'CDS', start: 0, end: 12, phase: 0, ...cdsAttributes },
        ],
      })
    const results = await translateTranscripts({
      transcripts: [mito('m1', {}), mito('m2', { transl_table: '1' })],
      fetchSpan: async () => ({
        seq: 'ATGGCTTGATAA',
        assemblyGeneticCodeId: 2,
      }),
    })
    expect(results.map(r => r.seq)).toEqual(['MAW*', 'MA**'])
  })

  it('places a minus-strand transl_except on a spliced transcript inside the span', async () => {
    // ATG TGA AAA AAA TAA read backwards off two exons, after a plus-strand
    // transcript that starts the span 11 bases earlier. RefSeq repeats the
    // attribute on every CDS row.
    const genome = 'ATGAAATAA' + 'CC' + 'TTATTTT' + 'GGGGG' + 'TTTCACAT'
    const cds = (start: number, end: number) => ({
      type: 'CDS',
      start,
      end,
      phase: 0,
      transl_except: '(pos:complement(26..28),aa:Sec)',
    })
    const selenoprotein = new SimpleFeature({
      uniqueId: 'sec',
      refName: 'chr1',
      start: 11,
      end: 31,
      strand: -1,
      type: 'mRNA',
      subfeatures: [cds(11, 18), cds(23, 31)],
    })
    const results = await translateTranscripts({
      transcripts: [transcript('a', 0, 9), selenoprotein],
      fetchSpan: async span => ({ seq: genome.slice(span.start, span.end) }),
    })
    expect(results.map(r => r.seq)).toEqual(['MK*', 'MUKK*'])
  })
})
