import { SimpleFeature } from '@jbrowse/core/util'
import {
  structureSeqVsTranscriptSeqMap,
  transcriptAlignedSeq,
} from 'p2s_mapper'
import { expect, test } from 'vitest'

import { genomeToTranscriptSeqMapping } from './mappings'
import { feature, pairwiseAlignment } from './test_data/gene'

test('mapping', () => {
  // @ts-expect-error
  const res = genomeToTranscriptSeqMapping(new SimpleFeature(feature))
  const { p2g } = res
  const { structureSeqToTranscriptSeqPosition } =
    structureSeqVsTranscriptSeqMap(pairwiseAlignment)

  // the transcript starts opposite structure residue 392 of the PDB protein.
  // On the reverse strand p2g[0] is the highest base of the first codon, the
  // first CDS's end - 1, since intervals are half-open [start, end)
  expect(transcriptAlignedSeq(pairwiseAlignment).slice(392, 396)).toBe('MKAA')
  const t0 = structureSeqToTranscriptSeqPosition[392]!
  expect(t0).toBe(0)
  expect(p2g[t0]).toBe(51_296_154)
  expect(res).toMatchSnapshot()
})
