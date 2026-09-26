import { types } from '@jbrowse/mobx-state-tree'
import { expect, test } from 'vitest'

import { withProteinLinkage } from '.'
import {
  findProteinLinkedView,
  genomeHighlightsForProteinPosition,
  getProteinLinkage,
  getProteinLinkageMapping,
  hovered1DProteinPosition,
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

const hg38 = {
  name: 'hg38',
  initialized: true,
  getCanonicalRefName: (r: string) => r.replace(/^chr/, ''),
}
const assemblyManager = {
  get: (name: string) =>
    name === 'hg38' || name === 'GRCh38'
      ? hg38
      : { ...hg38, name, getCanonicalRefName: (r: string) => r },
}
const View = withProteinLinkage(types.model({ id: types.identifier }))
// base 3 is the first base of the codon split across the intron
const hoverAt = (refName: string, assemblyName: string) => ({
  hoverPosition: { refName, coord: 4, assemblyName },
})

// jbrowse.org's hg38 names the chromosome `1` where GENCODE says `chr1`
test('a genome hover lights the 1D view through the assembly it was launched from', () => {
  const p1d = View.create({
    id: 'p1d',
    proteinLinkage: { ...linkage, assemblyName: 'hg38' },
  })
  const session = (hovered: unknown) => ({
    hovered,
    views: [p1d],
    assemblyManager,
  })
  expect(hovered1DProteinPosition(session(hoverAt('1', 'hg38')), p1d)).toBe(1)
  expect(hovered1DProteinPosition(session(hoverAt('1', 'GRCh38')), p1d)).toBe(1)
  expect(
    hovered1DProteinPosition(session(hoverAt('chr1', 'hg19')), p1d),
  ).toBeUndefined()
})

test('a 1D view saved without its assembly finds it through the genome view', () => {
  const p1d = View.create({ id: 'p1d', proteinLinkage: linkage })
  const genomeView = { id: 'cv-split', assemblyNames: ['hg38'] }
  expect(
    hovered1DProteinPosition(
      {
        hovered: hoverAt('1', 'hg38'),
        views: [genomeView, p1d],
        assemblyManager,
      },
      p1d,
    ),
  ).toBe(1)
  expect(
    hovered1DProteinPosition(
      { hovered: hoverAt('1', 'hg38'), views: [p1d], assemblyManager },
      p1d,
    ),
  ).toBeUndefined()
})
