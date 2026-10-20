import { expect, test } from 'vitest'

import { normalizeAnnotationLaunch } from './normalizeAnnotationLaunch'

const connectedView = {
  assembly: 'hg38',
  loc: 'chr17:7,668,421-7,687,550',
  tracks: ['hg38-gencodeComp', { trackId: 'hg38-clinvarMain' }],
}

test('a transcript linkage passes through, the isoform accession intact', () => {
  expect(
    normalizeAnnotationLaunch({
      uniprotId: 'P04637-7',
      transcriptId: 'ENST00000504937',
      connectedView,
    }),
  ).toEqual({
    launch: {
      uniprotId: 'P04637-7',
      transcriptId: 'ENST00000504937',
      connectedView,
    },
    warnings: [],
  })
})

test('a gene alone is enough, since its lookup names the entry', () => {
  expect(normalizeAnnotationLaunch({ gene: 'TP53' })).toEqual({
    launch: { gene: 'TP53' },
    warnings: [],
  })
})

test('a launch naming no entry and no gene is rejected', () => {
  expect(normalizeAnnotationLaunch({ transcriptId: 'NM_000546.6' })).toEqual({
    error:
      'No uniprotId or gene provided when launching a protein annotation view',
    warnings: [],
  })
})

test('unknown keys and wrongly typed values are reported and dropped', () => {
  expect(
    normalizeAnnotationLaunch({
      uniprotId: 'P04637',
      ulr: 'x',
      pdbId: '1TUP',
      transcriptId: 7,
      connectedView: { loc: 5 },
    }),
  ).toEqual({
    launch: { uniprotId: 'P04637' },
    warnings: [
      'ignored unknown key(s): ulr, pdbId',
      '`transcriptId` is not a string and was ignored',
      '`connectedView` is not { assembly, loc, tracks } and was ignored',
    ],
  })
})

test('a genome view with no transcript to link is reported and left out', () => {
  expect(
    normalizeAnnotationLaunch({
      uniprotId: 'P04637',
      connectedView,
      connectedViewId: 'lgv1',
    }),
  ).toEqual({
    launch: { uniprotId: 'P04637' },
    warnings: [
      '`connectedView` and `connectedViewId` connect a transcript, and the launch names no `gene` or `transcriptId`, so the view opens unlinked',
    ],
  })
})
