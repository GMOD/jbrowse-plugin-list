import { expect, test } from 'vitest'

import { protein1DViewRegistry } from './index'

import type { SimpleFeatureSerialized } from '@jbrowse/core/util'

// Forward-strand transcript whose CDS is split into [0,4) and [10,15), so the
// middle codon (protein position 1) straddles the exon boundary: its bases are
// genomic 3, 10, 11. The highlight span must enclose all three (getCodonRange
// used to return [3,6), missing bases 10 and 11).
const splitCodonFeature: SimpleFeatureSerialized = {
  uniqueId: 'feat-split',
  refName: 'chr1',
  start: 0,
  end: 15,
  strand: 1,
  type: 'mRNA',
  subfeatures: [
    { uniqueId: 'c1', refName: 'chr1', start: 0, end: 4, type: 'CDS', phase: 0 },
    {
      uniqueId: 'c2',
      refName: 'chr1',
      start: 10,
      end: 15,
      type: 'CDS',
      phase: 0,
    },
  ],
}

test('highlight for an exon-boundary codon encloses all its genomic bases', () => {
  protein1DViewRegistry.register({
    viewId: 'v-split',
    connectedViewId: 'cv-split',
    feature: splitCodonFeature,
    uniprotId: 'SPLIT_TEST',
  })

  // codon 0 = [0,1,2] contiguous
  expect(
    protein1DViewRegistry.getGenomeHighlightForProteinPosition('SPLIT_TEST', 0),
  ).toEqual({ refName: 'chr1', start: 0, end: 3 })

  // codon 1 = [3,10,11] split across the intron -> span [3,12)
  expect(
    protein1DViewRegistry.getGenomeHighlightForProteinPosition('SPLIT_TEST', 1),
  ).toEqual({ refName: 'chr1', start: 3, end: 12 })

  // codon 2 = [12,13,14] contiguous
  expect(
    protein1DViewRegistry.getGenomeHighlightForProteinPosition('SPLIT_TEST', 2),
  ).toEqual({ refName: 'chr1', start: 12, end: 15 })

  protein1DViewRegistry.unregister('v-split')
})
