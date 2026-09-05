import { types } from '@jbrowse/mobx-state-tree'
import { expect, test, vi } from 'vitest'

import Structure from './structureModel'

import type { AlignmentAlgorithm } from './types'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

// Structure uses getParent(self, 2) for parentView, so it needs to live inside
// a types.array inside a parent model (array = level 1, parent = level 2).
const TestParent = types
  .model({ structures: types.array(Structure) })
  .views(() => ({
    get zoomToBaseLevel() {
      return false
    },
    get autoScrollAlignment() {
      return false
    },
    get showHighlight() {
      return false
    },
    get showProteinTracks() {
      return false
    },
    get alignmentAlgorithm(): AlignmentAlgorithm {
      return 'needleman_wunsch'
    },
    get molstarPluginContext() {
      return undefined
    },
  }))
  .actions(() => ({
    setShowAlignment(_: boolean) {},
    setError(_: unknown) {},
  }))

const pairwiseAlignment = {
  consensus: '||||',
  alns: [
    { id: 'a', seq: 'MKAA' },
    { id: 'b', seq: 'MKAA' },
  ],
}

function makeModel() {
  const parent = TestParent.create({
    structures: [{ userProvidedTranscriptSequence: 'MKAA', pairwiseAlignment }],
  })
  return parent.structures[0]!
}

test('hydrates from a minimal { url } snapshot (userProvidedTranscriptSequence optional)', () => {
  const parent = TestParent.create({ structures: [{ url: 'x.cif' }] })
  const s = parent.structures[0]!
  expect(s.url).toBe('x.cif')
  expect(s.userProvidedTranscriptSequence).toBe('')
})

test('hydrates every declarative per-structure field from a snapshot', () => {
  const feature = { uniqueId: 'tx1', refName: 'chr1', start: 0, end: 9 }
  const parent = TestParent.create({
    structures: [
      {
        url: 'x.cif',
        connectedViewId: 'lgv-1',
        feature,
        userProvidedTranscriptSequence: 'MKAA',
        initialSelection: { start: 3, end: 7 },
      },
    ],
  })
  const s = parent.structures[0]!
  expect(s.connectedViewId).toBe('lgv-1')
  expect(s.feature).toEqual(feature)
  expect(s.userProvidedTranscriptSequence).toBe('MKAA')
  expect(s.initialSelection).toEqual({ start: 3, end: 7 })
})

test('resolves a uniprotId shorthand to an AlphaFold url at hydration', () => {
  const parent = TestParent.create({ structures: [{ uniprotId: 'P04637' }] })
  expect(parent.structures[0]!.url).toBe(
    'https://alphafold.ebi.ac.uk/files/AF-P04637-F1-model_v6.cif',
  )
})

test('resolves a pdbId shorthand to an RCSB url at hydration', () => {
  const parent = TestParent.create({ structures: [{ pdbId: '1CRN' }] })
  expect(parent.structures[0]!.url).toBe(
    'https://files.rcsb.org/download/1CRN.cif',
  )
})

test('an explicit url wins over a uniprotId shorthand', () => {
  const parent = TestParent.create({
    structures: [{ url: 'https://example.com/x.cif', uniprotId: 'P04637' }],
  })
  expect(parent.structures[0]!.url).toBe('https://example.com/x.cif')
})

test('hoverAlignmentPosition updates hoverPosition when no feature is hovered', () => {
  const model = makeModel()
  expect(model.hoverPosition).toBeUndefined()
  model.hoverAlignmentPosition(0)
  expect(model.hoverPosition?.structureSeqPos).toBe(0)
})

test('hoverAlignmentPosition is blocked when alignmentHoverRange is set', () => {
  const model = makeModel()
  model.setHoveredPosition({ structureSeqPos: 42 })
  model.setAlignmentHoverRange({ start: 5, end: 15 })
  model.hoverAlignmentPosition(0)
  expect(model.hoverPosition?.structureSeqPos).toBe(42)
})

test('hoverAlignmentPosition resumes after alignmentHoverRange is cleared', () => {
  const model = makeModel()
  model.setAlignmentHoverRange({ start: 5, end: 15 })
  model.hoverAlignmentPosition(2)
  expect(model.hoverPosition).toBeUndefined()

  model.setAlignmentHoverRange(undefined)
  model.hoverAlignmentPosition(1)
  expect(model.hoverPosition?.structureSeqPos).toBe(1)
})

test('setAlignmentHoverRange manages state', () => {
  const model = makeModel()
  expect(model.alignmentHoverRange).toBeUndefined()

  model.setAlignmentHoverRange({ start: 3, end: 8 })
  expect(model.alignmentHoverRange).toEqual({ start: 3, end: 8 })

  model.setAlignmentHoverRange(undefined)
  expect(model.alignmentHoverRange).toBeUndefined()
})

test('alignmentHoverPos reflects hoverPosition via structurePositionToAlignmentMap', () => {
  const model = makeModel()
  expect(model.alignmentHoverPos).toBeUndefined()

  // For identical sequences, structure pos N maps to alignment pos N
  model.setHoveredPosition({ structureSeqPos: 2 })
  expect(model.alignmentHoverPos).toBe(2)
})

test('chooseEntity realigns to the chosen chain and drops stale highlights', () => {
  const parent = TestParent.create({
    structures: [{ userProvidedTranscriptSequence: 'MKAA' }],
  })
  const model = parent.structures[0]!
  model.setStructureData({
    entities: [
      {
        entityId: '1',
        seq: 'GGGGGG',
        seqIds: [1, 2, 3, 4, 5, 6],
        chains: ['A'],
      },
      { entityId: '2', seq: 'MKAA', seqIds: [1, 2, 3, 4], chains: ['B'] },
    ],
  })
  // the load autorun picks the exact match
  expect(model.mappedEntity?.entityId).toBe('2')
  model.setClickedStructureRange({ start: 0, end: 2 })

  model.chooseEntity('1')
  expect(model.mappedEntityId).toBe('1')
  expect(model.mappedEntity?.chains).toEqual(['A'])
  expect(model.pairwiseAlignment?.alns[1].seq.replaceAll('-', '')).toBe(
    'GGGGGG',
  )
  expect(model.clickedStructureRange).toBeUndefined()
})

test('a persisted mappedEntityId survives a reload alongside its alignment', () => {
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: 'MKAA',
        pairwiseAlignment,
        mappedEntityId: '2',
      },
    ],
  })
  const model = parent.structures[0]!
  model.setStructureData({
    entities: [
      { entityId: '1', seq: 'GGGG', seqIds: [1, 2, 3, 4], chains: ['A'] },
      { entityId: '2', seq: 'MKAA', seqIds: [1, 2, 3, 4], chains: ['B'] },
    ],
  })
  expect(model.mappedEntity?.entityId).toBe('2')
})

test('initialResidues seeds the selection by author numbering once the mapped entity is known', () => {
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: 'MKAA',
        initialResidues: { start: 96, end: 97 },
      },
    ],
  })
  const model = parent.structures[0]!
  // nothing to resolve against yet
  expect(model.clickedStructureRange).toBeUndefined()
  model.setStructureData({
    entities: [
      // a decoy first entity numbered the same way, as 1TUP's DNA strands are
      {
        entityId: '1',
        seq: 'GGGG',
        seqIds: [1, 2, 3, 4],
        authSeqIds: [94, 95, 96, 97],
        chains: ['D'],
      },
      {
        entityId: '2',
        seq: 'MKAA',
        seqIds: [1, 2, 3, 4],
        authSeqIds: [94, 95, 96, 97],
        chains: ['A'],
      },
    ],
  })
  // the alignment autorun has picked entity 2, and the seed resolved on it
  expect(model.mappedEntityId).toBe('2')
  expect(model.clickedStructureRange).toEqual({ start: 2, end: 4 })
  // the seed fires once: clearing the selection afterwards sticks
  model.setClickedStructureRange(undefined)
  expect(model.clickedStructureRange).toBeUndefined()
})

test('label names the structure by id so stacked panels can be told apart', () => {
  const parent = TestParent.create({
    structures: [{ pdbId: '1TUP' }, { uniprotId: 'P04637' }, { data: 'ATOM' }],
  })
  expect(parent.structures.map(s => s.label)).toEqual([
    '1TUP',
    'AlphaFold P04637',
    'Uploaded structure',
  ])
})

test('hoverString reads out the aligned transcript residue beside the structure residue', () => {
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: 'PPMKAA',
        pairwiseAlignment: {
          consensus: '  ||||',
          alns: [
            { id: 'a', seq: 'PPMKAA' },
            { id: 'b', seq: '--MKAA' },
          ],
        },
      },
    ],
  })
  const model = parent.structures[0]!
  model.setHoveredPosition({ structureSeqPos: 1 })
  expect(model.hoverString).toBe('2, Transcript residue: 4')
})

test('hoverString uses the author number and drops the transcript residue when they agree', () => {
  // a 1TUP-like construct: label ids 1..4 for a chain the authors numbered
  // from 3, which is also where it sits in the transcript
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: 'PPMKAA',
        pairwiseAlignment: {
          consensus: '  ||||',
          alns: [
            { id: 'a', seq: 'PPMKAA' },
            { id: 'b', seq: '--MKAA' },
          ],
        },
      },
    ],
  })
  const model = parent.structures[0]!
  model.setStructureData({
    entities: [
      {
        entityId: '1',
        seq: 'MKAA',
        seqIds: [1, 2, 3, 4],
        authSeqIds: [3, 4, 5, 6],
        chains: ['A'],
      },
    ],
  })
  model.setHoveredPosition({ structureSeqPos: 1 })
  expect(model.residueNumber(1)).toBe(4)
  expect(model.hoverString).toBe('4, Structure: K')
})
