import { SimpleFeature } from '@jbrowse/core/util'
import { structureSeqVsTranscriptSeqMap } from 'p2s_mapper'
import { expect, test } from 'vitest'

import { genomeToTranscriptSeqMapping } from './mappings'
import { feature, pairwiseAlignment } from './test_data/gene'

test('structureSeqVsTranscriptSeqMap snapshot', () => {
  const ret = structureSeqVsTranscriptSeqMap(pairwiseAlignment)
  expect(ret).toMatchSnapshot()
})

test('mapping', () => {
  // @ts-expect-error
  const res = genomeToTranscriptSeqMapping(new SimpleFeature(feature))
  const { p2g } = res
  const aln = structureSeqVsTranscriptSeqMap(pairwiseAlignment)

  // expected position in sequence
  const s2 = pairwiseAlignment.alns[1].seq
  expect(s2[392]).toBe('M')
  expect(s2[393]).toBe('K')
  expect(s2[394]).toBe('A')
  expect(s2[395]).toBe('A')
  // maps the 392 position in the "pdb version of the protein" to the 0th
  // position in the genome version of the protein, and then maps that back to
  // the genome. For reverse strand, p2g[0] is the highest position in the
  // first codon (end-1 of first CDS, since intervals are half-open [start, end))
  const p0 = aln.transcriptSeqToStructureSeqPosition[392]!
  const g0 = p2g[p0]
  expect(p0).toBe(0)
  expect(g0).toBe(51_296_154)
  expect(res).toMatchSnapshot()
})
