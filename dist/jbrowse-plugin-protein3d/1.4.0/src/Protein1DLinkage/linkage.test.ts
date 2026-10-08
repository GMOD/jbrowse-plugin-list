import { types } from '@jbrowse/mobx-state-tree'
import {
  DEFAULT_ALIGNMENT_ALGORITHM,
  alignTranscriptToEntity,
  makeCoordinateMapper,
} from 'p2s_mapper'
import { expect, test, vi } from 'vitest'

import { withProteinLinkage } from '.'
import {
  findProteinLinkedViews,
  genomeHighlightsForProteinPosition,
  genomeHighlightsForUniProtPosition,
  getProteinLinkage,
  getProteinLinkageMapping,
  hovered1DProteinPosition,
  linkageGenomeMapping,
  resolveLinkageAlignment,
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
  const { connectedViewId } = linkage
  expect(
    findProteinLinkedViews({ views }, 'SPLIT_TEST', connectedViewId).map(
      v => v.id,
    ),
  ).toEqual(['p1d'])
  expect(findProteinLinkedViews({ views }, 'NOPE', connectedViewId)).toEqual([])
})

// the first view for the accession used to answer for every genome view, so a
// second 1D view of the same entry painted nothing on its own
test("one entry open from two genome views resolves to each one's own", () => {
  const views = [
    { id: 'first', proteinLinkage: { ...linkage, connectedViewId: 'lgvA' } },
    { id: 'second', proteinLinkage: { ...linkage, connectedViewId: 'lgvB' } },
  ]
  expect(
    findProteinLinkedViews({ views }, 'SPLIT_TEST', 'lgvB').map(v => v.id),
  ).toEqual(['second'])
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

// The transcript's three residues are the UniProt entry's residues 2..4, as an
// isoform starting at a later methionine is.
const lateStart = {
  consensus: '  |||',
  alns: [
    { id: 'transcript', seq: '--MKA' },
    { id: 'uniprot', seq: 'GSMKA' },
  ],
}

function linkedView(snapshot: {
  id: string
  proteinLinkage: Protein1DLinkage
}) {
  const view = View.create(snapshot)
  view.setProteinLinkageAlignment(lateStart)
  return view
}

// base 3 is the first base of the codon split across the intron
const hoverAt = (refName: string, assemblyName: string) => ({
  hoverPosition: { refName, coord: 4, assemblyName },
})

// jbrowse.org's hg38 names the chromosome `1` where GENCODE says `chr1`
test('a genome hover lights the 1D view through the assembly it was launched from', () => {
  const p1d = linkedView({
    id: 'p1d',
    proteinLinkage: { ...linkage, assemblyName: 'hg38' },
  })
  const session = (hovered: unknown) => ({
    hovered,
    views: [p1d],
    assemblyManager,
  })
  // transcript residue 1 is the entry's residue 3
  expect(hovered1DProteinPosition(session(hoverAt('1', 'hg38')), p1d)).toBe(3)
  expect(hovered1DProteinPosition(session(hoverAt('1', 'GRCh38')), p1d)).toBe(3)
  expect(
    hovered1DProteinPosition(session(hoverAt('chr1', 'hg19')), p1d),
  ).toBeUndefined()
})

test('a 1D view saved without its assembly finds it through the genome view', () => {
  const p1d = linkedView({ id: 'p1d', proteinLinkage: linkage })
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
  ).toBe(3)
  expect(
    hovered1DProteinPosition(
      { hovered: hoverAt('1', 'hg38'), views: [p1d], assemblyManager },
      p1d,
    ),
  ).toBeUndefined()
})

// Until 2026-10-08 both directions used a UniProt position as the transcript's
// own. Until the view has aligned the two, neither direction may answer.
test('a view that has not aligned its transcript links nothing either way', () => {
  const p1d = View.create({
    id: 'p1d',
    proteinLinkage: { ...linkage, assemblyName: 'hg38' },
  })
  expect(
    hovered1DProteinPosition(
      { hovered: hoverAt('1', 'hg38'), views: [p1d], assemblyManager },
      p1d,
    ),
  ).toBeUndefined()
  expect(genomeHighlightsForUniProtPosition([p1d], 1)).toEqual([])
})

test('a UniProt residue lights the codon of the transcript residue aligned to it', () => {
  const p1d = linkedView({ id: 'p1d', proteinLinkage: linkage })
  const spans = (pos: number) =>
    genomeHighlightsForUniProtPosition([p1d], pos).map(r => [r.start, r.end])
  // entry residue 3 is transcript residue 1, the codon split across the intron
  expect(spans(3)).toEqual([
    [3, 4],
    [10, 12],
  ])
  expect(spans(2)).toEqual([[0, 3]])
  // the entry's first two residues precede the transcript's start
  expect(spans(0)).toEqual([])
  expect(spans(1)).toEqual([])
})

// a hover names no view, so every 1D view of the entry answers, and two
// isoforms sharing a codon would otherwise render it twice under one key
test('two views of one entry light a shared codon once', () => {
  const a = linkedView({ id: 'a', proteinLinkage: linkage })
  const b = linkedView({ id: 'b', proteinLinkage: linkage })
  expect(
    genomeHighlightsForUniProtPosition([a, b], 3).map(r => [r.start, r.end]),
  ).toEqual([
    [3, 4],
    [10, 12],
  ])
})

const P53 =
  'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD'

function alignmentHost(transcript: string | undefined, uniprot = P53) {
  const align = vi.fn(async (t: string, u: string) =>
    alignTranscriptToEntity(t, u, DEFAULT_ALIGNMENT_ALGORITHM),
  )
  return {
    align,
    host: {
      transcriptProtein: async () => transcript,
      uniprotSequence: async () => uniprot,
      align,
    },
  }
}

async function mapsFor(transcript: string) {
  const result = await resolveLinkageAlignment(alignmentHost(transcript).host)
  if (!('alignment' in result)) {
    throw new Error(result.problem)
  }
  return makeCoordinateMapper(result.alignment).maps
}

// ENST00000504937, Δ133p53: the entry from residue 133 on. By raw index the
// R248 codon, transcript residue 115, lit serine 116.
test('an isoform starting inside the entry maps at its offset', async () => {
  const maps = await mapsFor(`${P53.slice(132)}*`)
  expect(maps.transcriptSeqToStructureSeqPosition[0]).toBe(132)
  expect(maps.transcriptSeqToStructureSeqPosition[115]).toBe(247)
  expect(maps.transcriptSeqToStructureSeqPosition[260]).toBe(392)
  expect(maps.transcriptSeqToStructureSeqPosition[261]).toBeUndefined()
  expect(maps.structureSeqToTranscriptSeqPosition[0]).toBeUndefined()
  expect(maps.structureSeqToTranscriptSeqPosition[131]).toBeUndefined()
})

// ENST00000420246, p53β: ten residues of its own after residue 331. A global
// alignment stretches them across to the entry's C-terminus.
test('an isoform with its own tail leaves the tail unmapped', async () => {
  const maps = await mapsFor(`${P53.slice(0, 331)}DQTSFQKENC`)
  expect(maps.transcriptSeqToStructureSeqPosition[330]).toBe(330)
  for (let pos = 331; pos <= 340; pos++) {
    expect(maps.transcriptSeqToStructureSeqPosition[pos]).toBeUndefined()
  }
})

// what a constant offset, or a search for the transcript inside the entry,
// cannot get right
test('an isoform skipping an exon maps on both sides of the gap', async () => {
  const maps = await mapsFor(P53.slice(0, 150) + P53.slice(180))
  expect(maps.transcriptSeqToStructureSeqPosition[149]).toBe(149)
  expect(maps.transcriptSeqToStructureSeqPosition[150]).toBe(180)
  expect(maps.structureSeqToTranscriptSeqPosition[150]).toBeUndefined()
  expect(maps.structureSeqToTranscriptSeqPosition[179]).toBeUndefined()
  expect(maps.structureSeqToTranscriptSeqPosition[392]).toBe(362)
})

test('the canonical transcript maps one to one without an alignment run', async () => {
  const { align, host } = alignmentHost(`${P53}*`)
  const result = await resolveLinkageAlignment(host)
  expect(align).not.toHaveBeenCalled()
  expect(
    'alignment' in result &&
      makeCoordinateMapper(result.alignment).maps
        .transcriptSeqToStructureSeqPosition[392],
  ).toBe(392)
})

// A Foldseek hit can be any protein: human myoglobin has nothing to say about
// p53's codons.
test('an unrelated entry, a missing translation or an oversized pair links nothing', async () => {
  const MYOGLOBIN =
    'MGLSDGEWQLVLNVWGKVEADIPGHGQEVLIRLFKGHPETLEKFDKFKHLKSEDEMKASEDLKKHGATVLTALGGILKKKGHHEAEIKPLAQSHATKHKIPVKYLEFISECIIQVLQSKHPGDFGADAQGAMNKALELFRKDMASNYKELGFQG'
  expect(
    await resolveLinkageAlignment(alignmentHost(P53, MYOGLOBIN).host),
  ).toEqual({
    problem: 'the transcript and the UniProt entry are too dissimilar',
  })
  expect(await resolveLinkageAlignment(alignmentHost(undefined).host)).toEqual({
    problem: 'the transcript has no translation',
  })
  expect(
    await resolveLinkageAlignment({
      ...alignmentHost(P53.slice(1)).host,
      align: async () => undefined,
    }),
  ).toEqual({ problem: 'the sequences are too long to align' })
})
