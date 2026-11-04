import { types } from '@jbrowse/mobx-state-tree'
import { expect, test, vi } from 'vitest'

import Structure from './structureModel'

import type { ProteinColor } from './proteinColor'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'

// hg19 spells chr11 as 11
vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return {
    ...actual,
    getSession: () => ({
      hovered: undefined,
      views: [{ id: 'lgv', type: 'LinearGenomeView', assemblyNames: ['hg19'] }],
      assemblyManager: {
        get: (name: string) =>
          name === 'hg19'
            ? {
                name,
                initialized: true,
                getCanonicalRefName: (r: string) => r.replace(/^chr/, ''),
              }
            : undefined,
      },
    }),
  }
})

const TestParent = types
  .model({ structures: types.array(Structure) })
  .volatile((): { color: ProteinColor } => ({ color: {} }))
  .views(() => ({
    get alignmentAlgorithm() {
      return 'needleman_wunsch' as const
    },
    get molstarPluginContext() {
      return undefined
    },
  }))
  .actions(self => ({
    addNotice(e: unknown) {
      throw e
    },
    setColor(color: ProteinColor) {
      self.color = color
    },
  }))

// minus strand: residues 0-3 on bases 211..200, residues 4-6 on 108..100
const feature = {
  uniqueId: 'tx1',
  refName: 'chr11',
  start: 100,
  end: 212,
  strand: -1,
  type: 'mRNA',
  name: 'NM_HBB_TEST',
  subfeatures: [
    { uniqueId: 'c1', refName: 'chr11', start: 100, end: 109, type: 'CDS' },
    { uniqueId: 'c2', refName: 'chr11', start: 200, end: 212, type: 'CDS' },
  ],
}

function setup() {
  const parent = TestParent.create({
    structures: [
      {
        url: 'x.cif',
        connectedViewId: 'lgv',
        feature,
        userProvidedTranscriptSequence: 'MVHLTPE',
        // the crystal lacks the initiator methionine
        pairwiseAlignment: {
          consensus: ' ||||||',
          alns: [
            { id: 'transcript', seq: 'MVHLTPE' },
            { id: 'structure', seq: '-VHLTPE' },
          ],
        },
      },
    ],
  })
  const structure = parent.structures[0]!
  structure.setStructureData({
    entities: [
      {
        entityId: '1',
        seq: 'VHLTPE',
        seqIds: [1, 2, 3, 4, 5, 6],
        authSeqIds: [2, 3, 4, 5, 6, 7],
        chains: ['A'],
      },
    ],
  })
  structure.setLoadedToMolstar(true)
  return { parent, structure }
}

test('a residue named as a paper does is located in every numbering', () => {
  const { structure } = setup()
  expect(structure.locateResidues({ residues: { start: 2, end: 2 } })).toEqual([
    {
      position: 0,
      residue: 2,
      labelSeqId: 1,
      chains: ['A'],
      structureLetter: 'V',
      transcriptResidue: 2,
      transcriptLetter: 'V',
      codon: { refName: 'chr11', start: 206, end: 209 },
      locus: 'chr11:207-209',
      exon: 1,
      exonNumbering: 'coding',
    },
  ])
})

// the feature names CDS alone, so its numbers count coding exons
test('colored by exon, each mapped residue takes its exon number', () => {
  const { parent, structure } = setup()
  expect(structure.exonStatus).toBeUndefined()
  parent.setColor({ field: 'exon' })
  expect(structure.exonStatus?.placed?.byLabelSeqId).toEqual(
    new Map([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 2],
      [5, 2],
      [6, 2],
    ]),
  )
  expect(structure.exonStatus?.color?.title).toBe('Coding exon')
  expect(structure.placedValues).toEqual(structure.exonStatus?.placed)
  expect(structure.statusMessage).toBeUndefined()
  structure.setHoveredPosition({ structureSeqPos: 3 })
  expect(structure.hoverString).toMatch(/Coding exon 2$/)
})

test("a genome region finds its residues under the assembly's alias", () => {
  const { parent, structure } = setup()
  const residues = structure.locateGenomeRegion({
    refName: '11',
    start: 205,
    end: 212,
  })
  expect(residues?.map(r => [r.transcriptResidue, r.residue])).toEqual([
    [1, undefined],
    [2, 2],
    [3, 3],
  ])
  expect(
    structure.locateGenomeRegion({ refName: 'chr12', start: 205, end: 212 }),
  ).toEqual([])
  expect(
    parent.structures.map(
      s =>
        s.locateGenomeRegion({
          refName: 'chr11',
          start: 100,
          end: 103,
        })?.[0]?.residue,
    ),
  ).toEqual([7])
})

test('the report says which chain maps and how well', () => {
  const { structure } = setup()
  expect(structure.report).toMatchObject({
    label: 'x.cif',
    source: 'url',
    transcript: 'NM_HBB_TEST',
    loading: false,
    error: undefined,
    mapping: {
      entityId: '1',
      chains: ['A'],
      aligned: 6,
      identical: 6,
      lowSimilarity: false,
      exactMatch: false,
      fusionPartnerResiduesUnmapped: 0,
    },
  })
})

// A half-settled mapping reads as a final one: a transcript-only entry would
// say the crystal lacks a codon it holds.
test('a structure still loading locates nothing yet', () => {
  const { structure } = setup()
  structure.setLoadedToMolstar(false)
  expect(structure.locateResidues({ residues: { start: 2, end: 2 } })).toBe(
    undefined,
  )
  expect(
    structure.locateGenomeRegion({ refName: 'chr11', start: 205, end: 212 }),
  ).toBe(undefined)
})
