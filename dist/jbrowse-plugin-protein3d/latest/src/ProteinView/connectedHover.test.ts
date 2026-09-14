import { expect, test } from 'vitest'

import { connectedHoverTranscriptPos } from './connectedHover'

// residues 0 and 1 of a minus-strand transcript on chr17
const mapping = {
  refName: 'chr17',
  g2p: { 105: 0, 104: 0, 103: 0, 102: 1, 101: 1, 100: 1 },
}

function msa(connectedViewId: string, start?: number) {
  return {
    id: `msa-${connectedViewId}`,
    type: 'MsaView',
    connectedViewId,
    connectedHoverHighlights:
      start === undefined
        ? []
        : [{ assemblyName: 'hg38', refName: 'chr17', start, end: start + 3 }],
  }
}

const genomeHover = (coord: number, refName = 'chr17') => ({
  hoverPosition: { coord, refName },
})

test('a genome hover names the residue its base is in', () => {
  expect(
    connectedHoverTranscriptPos({
      hovered: genomeHover(102),
      views: [],
      mapping,
      connectedViewId: 'lgv',
      genomeViewReady: true,
    }),
  ).toEqual({ transcriptPos: 1, source: 'genome' })
})

// The Pfam seed shape: the alignment column says nothing about the residue,
// the codon msaview maps it to does.
test('an alignment hover is read through the codon it maps to', () => {
  expect(
    connectedHoverTranscriptPos({
      hovered: undefined,
      views: [msa('lgv', 103)],
      mapping,
      connectedViewId: 'lgv',
      genomeViewReady: true,
    }),
  ).toEqual({ transcriptPos: 0, source: 'msa' })
})

test('the genome hover wins while both are set', () => {
  expect(
    connectedHoverTranscriptPos({
      hovered: genomeHover(101),
      views: [msa('lgv', 103)],
      mapping,
      connectedViewId: 'lgv',
      genomeViewReady: true,
    })?.source,
  ).toBe('genome')
})

test('an alignment on another genome view, or another chromosome, names nothing', () => {
  expect(
    connectedHoverTranscriptPos({
      hovered: undefined,
      views: [msa('other-lgv', 103)],
      mapping,
      connectedViewId: 'lgv',
      genomeViewReady: true,
    }),
  ).toBeUndefined()
  expect(
    connectedHoverTranscriptPos({
      hovered: genomeHover(102, 'chr1'),
      views: [],
      mapping,
      connectedViewId: 'lgv',
      genomeViewReady: true,
    }),
  ).toBeUndefined()
})

test('a structure with no connected genome view hears no alignment', () => {
  expect(
    connectedHoverTranscriptPos({
      hovered: undefined,
      views: [msa('lgv', 103)],
      mapping,
      connectedViewId: undefined,
      genomeViewReady: false,
    }),
  ).toBeUndefined()
})
