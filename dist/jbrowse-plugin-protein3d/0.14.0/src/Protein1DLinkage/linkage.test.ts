import { types } from '@jbrowse/mobx-state-tree'
import { expect, test } from 'vitest'

import { withProteinLinkage } from '.'
import {
  findProteinLinkedView,
  genomeHighlightsForProteinPosition,
  getProteinLinkage,
  getProteinLinkageMapping,
  linkageGenomeMapping,
} from './linkage'

import type { Protein1DLinkage } from './linkage'
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
    {
      uniqueId: 'c1',
      refName: 'chr1',
      start: 0,
      end: 4,
      type: 'CDS',
      phase: 0,
    },
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

const linkage: Protein1DLinkage = {
  connectedViewId: 'cv-split',
  feature: splitCodonFeature,
  uniprotId: 'SPLIT_TEST',
}

test('an exon-boundary codon highlights each of its bases and not the intron', () => {
  const spans = (pos: number) =>
    genomeHighlightsForProteinPosition(linkageGenomeMapping(linkage), pos).map(
      r => [r.start, r.end],
    )
  // codon 0 = [0,1,2] contiguous
  expect(spans(0)).toEqual([[0, 3]])
  // codon 1 = [3,10,11] split across the intron
  expect(spans(1)).toEqual([
    [3, 4],
    [10, 12],
  ])
  // codon 2 = [12,13,14] contiguous
  expect(spans(2)).toEqual([[12, 15]])
})

test('a missing view has no linkage rather than throwing', () => {
  expect(getProteinLinkage(undefined)).toBeUndefined()
  expect(getProteinLinkage({ id: 'lgv' })).toBeUndefined()
})

test('finds the open 1D view for a UniProt entry by its linkage', () => {
  const views = [
    { id: 'lgv' },
    { id: 'p1d', proteinLinkage: linkage },
    { id: 'other', proteinLinkage: { ...linkage, uniprotId: 'X' } },
  ]
  expect(findProteinLinkedView({ views }, 'SPLIT_TEST')?.id).toBe('p1d')
  expect(findProteinLinkedView({ views }, 'NOPE')).toBeUndefined()
})

test('a linked view carries its genome mapping, an unlinked one none', () => {
  const View = withProteinLinkage(types.model({ id: types.identifier }))
  expect(View.create({ id: 'lgv' }).proteinLinkageMapping).toBeUndefined()
  const linked = View.create({ id: 'p1d', proteinLinkage: linkage })
  expect(getProteinLinkageMapping(linked)?.refName).toBe('chr1')
  expect(
    genomeHighlightsForProteinPosition(
      getProteinLinkageMapping(linked)!,
      1,
    ).map(r => [r.start, r.end]),
  ).toEqual([
    [3, 4],
    [10, 12],
  ])
})
