import { getSnapshot, types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import { structuresSettled } from './frameSelection'
import Structure from './structureModel'
import { parseStructure } from '../test_data/molstarStructure'

import type * as JBrowseCoreUtil from '@jbrowse/core/util'
import type { AlignmentAlgorithm } from 'p2s_mapper'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

// an RCSB url makes the model ask PDBe for SIFTS; an empty answer, so nothing
// retries past the test
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}')),
  )
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
  .volatile(() => ({ viewErrors: new Array<unknown>(), superposedCount: 0 }))
  .views(self => ({
    get settled() {
      return structuresSettled(self)
    },
  }))
  .actions(self => ({
    setError(e: unknown) {
      self.viewErrors.push(e)
    },
    setSuperposedCount(n: number) {
      self.superposedCount = n
    },
    clearSelection() {
      for (const structure of self.structures) {
        structure.setClickedStructureRanges([])
        structure.setSelectedFeatureId(undefined)
      }
    },
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
  // strand included because the connected-hover autorun maps this feature
  // through g2p_mapper, which rejects a strandless one
  const feature = {
    uniqueId: 'tx1',
    refName: 'chr1',
    start: 0,
    end: 9,
    strand: 1,
  }
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

// The accession is kept rather than spelled into a filename: which files
// AlphaFold DB holds for it is the prediction API's answer, and the structure
// loader asks before it opens one.
test('keeps a uniprotId shorthand for the loader, and names the structure by it', () => {
  const parent = TestParent.create({ structures: [{ uniprotId: 'P04637' }] })
  const s = parent.structures[0]!
  expect(s.url).toBeUndefined()
  expect(s.uniprotId).toBe('P04637')
  expect(s.label).toBe('AlphaFold P04637')
})

// The loader may open an isoform file for a canonical accession, and reading
// the accession back off that url would save P04637-2 — which UniProt's GFF
// endpoint does not serve, so the reopened session would lose its feature
// tracks and its entry link.
test('a saved session keeps the accession that was asked for, not the file its model came from', () => {
  const parent = TestParent.create({ structures: [{ uniprotId: 'P04637' }] })
  const structure = parent.structures[0]!
  structure.setUrl(
    'https://alphafold.ebi.ac.uk/files/AF-P04637-2-F1-model_v6.cif',
  )

  const reopened = TestParent.create({
    structures: [getSnapshot(parent).structures[0]!],
  })
  expect(reopened.structures[0]!.uniprotId).toBe('P04637')
  expect(reopened.structures[0]!.url).toBe(
    'https://alphafold.ebi.ac.uk/files/AF-P04637-2-F1-model_v6.cif',
  )
})

// A grey canvas for the seconds a fetch, a parse, an alignment and a SIFTS
// lookup take says nothing about which of them is running.
test('names the step it is on while it settles', () => {
  const parent = TestParent.create({
    structures: [{ uniprotId: 'P04637' }, { url: 'x.cif' }, { pdbId: '1TUP' }],
  })
  const [pending, loading, pdb] = parent.structures
  expect(pending!.loadingMessage).toBe('Resolving AlphaFold model for P04637')
  expect(loading!.loadingMessage).toBe('Loading x.cif')

  // an RCSB entry is still settling until SIFTS answers: that is what unmaps a
  // fusion partner and places the UniProt tracks
  pdb!.setLoadedToMolstar(true)
  expect(pdb!.loadingMessage).toBe('Mapping 1TUP to UniProt')
  pdb!.setUniProtMappings([])
  expect(pdb!.loading).toBe(false)
  expect(pdb!.loadingMessage).toBeUndefined()
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
  model.setClickedStructureRanges([{ start: 0, end: 2 }])

  model.chooseEntity('1')
  expect(model.mappedEntityId).toBe('1')
  expect(model.mappedEntity?.chains).toEqual(['A'])
  expect(model.pairwiseAlignment?.alns[1].seq.replaceAll('-', '')).toBe(
    'GGGGGG',
  )
  expect(model.clickedStructureRanges).toEqual([])
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

// A receptor with a partner protein fused into one of its loops, as in 2RH1:
// the alignment bridges the insert, and SIFTS says residues 5-8 are the
// partner's
const FUSED_ALIGNMENT = {
  consensus: '||||    ||||',
  alns: [
    { id: 'a', seq: 'MKAAQRSTWYVL' },
    { id: 'b', seq: 'MKAAGGGGWYVL' },
  ],
}

async function loadFusedReceptor(snapshot: {
  alignmentImported?: boolean
  initialTranscriptResidues?: { start: number; end: number }
}) {
  const segment = (start: number, end: number, unpStart: number) => ({
    entity_id: 1,
    chain_id: 'A',
    start: { residue_number: start },
    end: { residue_number: end },
    unp_start: unpStart,
    unp_end: unpStart + end - start,
  })
  const sifts = {
    '9zzz': {
      UniProt: {
        RECEPTOR: { mappings: [segment(1, 4, 1), segment(9, 12, 9)] },
        PARTNER: { mappings: [segment(5, 8, 2)] },
      },
    },
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(sifts))),
  )
  const parent = TestParent.create({
    structures: [
      {
        url: 'https://files.rcsb.org/download/9ZZZ.cif',
        userProvidedTranscriptSequence: 'MKAAQRSTWYVL',
        pairwiseAlignment: FUSED_ALIGNMENT,
        mappedEntityId: '1',
        ...snapshot,
      },
    ],
  })
  const model = parent.structures[0]!
  model.setStructureData({
    entities: [
      {
        entityId: '1',
        seq: 'MKAAGGGGWYVL',
        seqIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        chains: ['A'],
      },
    ],
  })
  expect(model.structureSeqToTranscriptSeqPosition?.[5]).toBe(5)
  await vi.waitFor(() => {
    expect(model.uniProtMappings).toBeDefined()
  })
  return model
}

test('residues SIFTS assigns to a fused partner leave the mapping, the stored alignment untouched', async () => {
  const model = await loadFusedReceptor({ alignmentImported: false })
  const s2t = model.structureSeqToTranscriptSeqPosition!
  expect([4, 5, 6, 7].map(p => s2t[p])).toEqual([
    undefined,
    undefined,
    undefined,
    undefined,
  ])
  expect(s2t[8]).toBe(8)
  expect(model.alignmentQuality?.aligned).toBe(8)
  expect(model.pairwiseAlignment).toEqual(FUSED_ALIGNMENT)
})

// the manual import, and a spec or older session carrying its own alignment
test('an imported alignment is used as given, fusion partner included', async () => {
  const fromSpec = await loadFusedReceptor({})
  expect(fromSpec.alignmentImported).toBe(true)
  expect(fromSpec.structureSeqToTranscriptSeqPosition?.[5]).toBe(5)

  const computed = await loadFusedReceptor({ alignmentImported: false })
  computed.setAlignment(FUSED_ALIGNMENT, true)
  expect(computed.structureSeqToTranscriptSeqPosition?.[5]).toBe(5)
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
  expect(model.clickedStructureRanges).toEqual([])
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
  expect(model.clickedStructureRanges).toEqual([{ start: 2, end: 4 }])
  // the seed fires once: clearing the selection afterwards sticks
  model.setClickedStructureRanges([])
  expect(model.clickedStructureRanges).toEqual([])
})

test('a structure is loading until it is in Mol*, aligned, and SIFTS has answered for a PDB entry', async () => {
  const parent = TestParent.create({
    structures: [
      {
        url: 'https://example.org/model.cif',
        userProvidedTranscriptSequence: 'MKAA',
      },
      { pdbId: '1TUP', userProvidedTranscriptSequence: 'MKAA' },
    ],
  })
  const [model, entry] = parent.structures
  // nothing downloaded yet, so no sequence and no pending alignment either
  expect(model!.alignmentPending).toBe(false)
  expect(model!.loading).toBe(true)

  const entities = [
    { entityId: '1', seq: 'MKAA', seqIds: [1, 2, 3, 4], chains: ['A'] },
  ]
  for (const s of [model!, entry!]) {
    s.setStructureData({ entities })
    s.setLoadedToMolstar(true)
  }
  expect(model!.pairwiseAlignment).toBeDefined()
  expect(model!.loading).toBe(false)
  expect(entry!.loading).toBe(true)

  await vi.waitFor(() => {
    expect(entry!.uniProtMappings).toBeDefined()
  })
  expect(entry!.loading).toBe(false)
})

// Two AlphaFold models superposed in one view: both are entity 1 and both hear
// every hover on the shared plugin. Measured on TP53 with mouse P02340 before
// this: hovering mouse residue 100 lit human residue 100 and its chr17 codon.
test('a Mol* interaction on another structure of the view names no position here', async () => {
  const parent = TestParent.create({
    structures: [
      { userProvidedTranscriptSequence: 'MKAA', pairwiseAlignment },
      { url: 'https://example.org/ortholog.cif' },
    ],
  })
  const entities = [
    { entityId: '1', seq: 'MKAA', seqIds: [1, 2, 3, 4], chains: ['A'] },
  ]
  const chain = { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }
  const [human, mouse] = parent.structures
  const humanStructure = await parseStructure([chain])
  const mouseStructure = await parseStructure([chain])
  // the human entry as an NMR ensemble: a hover on its second model is its own
  human!.setStructureData({
    entities,
    molstarStructures: [humanStructure],
    modelIds: [humanStructure.model.id, 'human-model-2'],
  })
  mouse!.setStructureData({
    entities,
    molstarStructures: [mouseStructure],
    modelIds: [mouseStructure.model.id],
  })

  const hover = (s: typeof humanStructure) => ({
    labelSeqId: 3,
    code: 'ALA',
    chain: 'A',
    entityId: '1',
    modelId: s.model.id,
  })
  expect(human!.interactionPosition(hover(humanStructure))).toBe(2)
  expect(
    human!.interactionPosition({
      ...hover(humanStructure),
      modelId: 'human-model-2',
    }),
  ).toBe(2)
  expect(human!.interactionPosition(hover(mouseStructure))).toBeUndefined()
  // the unmapped ortholog still answers its own hovers, and only those
  expect(mouse!.interactionPosition(hover(mouseStructure))).toBe(2)
  expect(mouse!.interactionPosition(hover(humanStructure))).toBeUndefined()
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

test('initialTranscriptResidues seeds the selection through the alignment once the structure settles', () => {
  const parent = TestParent.create({
    structures: [
      {
        url: 'https://example.org/model.cif',
        userProvidedTranscriptSequence: 'MKLVA',
        initialTranscriptResidues: { start: 3, end: 5 },
      },
    ],
  })
  const model = parent.structures[0]!
  // a fragment missing the first residue and the V, numbered from 94
  model.setStructureData({
    entities: [
      {
        entityId: '1',
        seq: 'KLA',
        seqIds: [1, 2, 3],
        authSeqIds: [94, 95, 96],
        chains: ['A'],
      },
    ],
  })
  expect(model.alignment).toBeDefined()
  expect(model.clickedStructureRanges).toEqual([])
  model.setLoadedToMolstar(true)
  // L and A are positions 1 and 2; the V between them is not modeled
  expect(model.clickedStructureRanges).toEqual([{ start: 1, end: 3 }])
  model.setClickedStructureRanges([])
  expect(model.clickedStructureRanges).toEqual([])
})

// 2RH1's shape: a range across the loop the partner is fused into used to
// select min..max of the matched positions, the partner included
test('initialTranscriptResidues across a fusion selects the receptor either side, not the partner', async () => {
  const model = await loadFusedReceptor({
    alignmentImported: false,
    initialTranscriptResidues: { start: 3, end: 10 },
  })
  model.setLoadedToMolstar(true)
  expect(model.clickedStructureRanges).toEqual([
    { start: 2, end: 4 },
    { start: 8, end: 10 },
  ])
  expect(model.selectLabelSeqIds).toEqual([3, 4, 9, 10])
})

test('a seed takes several ranges, and a saved single range keeps its shape', () => {
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: 'MKAA',
        pairwiseAlignment,
        initialSelection: { start: 0, end: 1 },
        initialResidues: [
          { start: 96, end: 96 },
          { start: 94, end: 94 },
        ],
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
        authSeqIds: [94, 95, 96, 97],
        chains: ['A'],
      },
    ],
  })
  model.setMappedEntityId('1')
  expect(model.clickedStructureRanges).toEqual([
    { start: 0, end: 1 },
    { start: 2, end: 3 },
  ])
  expect(model.clickAlignmentRanges).toEqual([
    { start: 0, end: 0 },
    { start: 2, end: 2 },
  ])
  expect(getSnapshot(model).initialSelection).toEqual({ start: 0, end: 1 })
})

const NUMBERED_FROM_94 = [
  {
    entityId: '1',
    seq: 'MKAA',
    seqIds: [1, 2, 3, 4],
    authSeqIds: [94, 95, 96, 97],
    chains: ['A'],
  },
]

function twoNumberedStructures() {
  const spec = {
    userProvidedTranscriptSequence: 'MKAA',
    pairwiseAlignment,
    mappedEntityId: '1',
  }
  return TestParent.create({ structures: [spec, spec] })
}

function settle(parent: ReturnType<typeof twoNumberedStructures>) {
  for (const s of parent.structures) {
    s.setStructureData({ entities: NUMBERED_FROM_94 })
    s.setLoadedToMolstar(true)
  }
  parent.setSuperposedCount(parent.structures.length)
}

test('focusResidues waits for the view to settle, superposition included', async () => {
  const parent = twoNumberedStructures()
  const [a, b] = parent.structures
  let runs: unknown
  const pending = a!.focusResidues({ residues: { start: 95, end: 95 } })
  pending.then(r => (runs = r)).catch(() => {})
  for (const s of parent.structures) {
    s.setStructureData({ entities: NUMBERED_FROM_94 })
    s.setLoadedToMolstar(true)
  }
  await Promise.resolve()
  expect(runs).toBeUndefined()
  expect(a!.clickedStructureRanges).toEqual([])
  parent.setSuperposedCount(2)
  expect(await pending).toEqual([{ start: 1, end: 2 }])
  expect(b!.clickedStructureRanges).toEqual([])
})

test('focusResidues rejects when the structure never settles', async () => {
  const parent = twoNumberedStructures()
  await expect(
    parent.structures[0]!.focusResidues(
      { residues: { start: 95, end: 95 } },
      { timeout: 10 },
    ),
  ).rejects.toThrow(/did not finish loading/)
})

// "show me this one" is one selection for the view, as a click in Mol* is
test('focusResidues puts every other structure down', async () => {
  const parent = twoNumberedStructures()
  settle(parent)
  const [a, b] = parent.structures
  b!.setClickedStructureRanges([{ start: 0, end: 2 }])
  b!.setSelectedFeatureId('domain-1')
  await a!.focusResidues({
    transcriptResidues: [
      { start: 1, end: 1 },
      { start: 4, end: 4 },
    ],
  })
  expect(a!.clickedStructureRanges).toEqual([
    { start: 0, end: 1 },
    { start: 3, end: 4 },
  ])
  expect(b!.clickedStructureRanges).toEqual([])
  expect(b!.selectedFeatureId).toBeUndefined()
})

// selectLabelSeqIds lights the whole alignment when nothing is selected;
// framing that would show the whole chain for a residue the entry lacks
test('a target naming no residue selects nothing and frames nothing', async () => {
  const parent = twoNumberedStructures()
  settle(parent)
  const [a] = parent.structures
  a!.setClickedStructureRanges([{ start: 0, end: 1 }])
  expect(
    await a!.focusResidues({ residues: { start: 500, end: 600 } }),
  ).toEqual([])
  expect(a!.clickedStructureRanges).toEqual([])
  expect(a!.clickedLabelSeqIds).toEqual([])
})

test('an empty seed declares no selection', () => {
  const parent = TestParent.create({
    structures: [{ url: 'x.cif', initialSelection: [] }],
  })
  expect(parent.structures[0]!.seededSelection).toBe(false)
})

test('a seed that resolves after the user has touched the selection is dropped', () => {
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: 'MKAA',
        initialResidues: { start: 96, end: 96 },
      },
    ],
  })
  const model = parent.structures[0]!
  model.setClickedStructureRanges([{ start: 0, end: 1 }])
  model.setStructureData({ entities: NUMBERED_FROM_94 })
  expect(model.mappedEntityId).toBe('1')
  expect(model.clickedStructureRanges).toEqual([{ start: 0, end: 1 }])
  expect(model.seedLit).toBe(false)
})

// 1TUP's entities as its mmCIF declares them: two DNA strands, then the p53
// core domain, author-numbered 94-312
const P53_CORE =
  'SSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNT'
const range = (from: number, n: number) =>
  Array.from({ length: n }, (_, i) => from + i)
const ONE_TUP_ENTITIES = [
  {
    entityId: '1',
    seq: 'TTTCCTAGACTTGCCCAATTA',
    seqIds: range(1, 21),
    chains: ['E'],
    nucleicAcid: true,
  },
  {
    entityId: '2',
    seq: 'ATAATTGGGCAAGTCTAGGAA',
    seqIds: range(1, 21),
    chains: ['F'],
    nucleicAcid: true,
  },
  {
    entityId: '3',
    seq: P53_CORE,
    seqIds: range(1, P53_CORE.length),
    authSeqIds: range(94, P53_CORE.length),
    chains: ['A', 'B', 'C'],
  },
]

function load1tup(snapshot: {
  pairwiseAlignment: {
    consensus: string
    alns: readonly [{ id: string; seq: string }, { id: string; seq: string }]
  }
  mappedEntityId?: string
}) {
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: P53_CORE,
        initialResidues: { start: 248, end: 248 },
        ...snapshot,
      },
    ],
  })
  const model = parent.structures[0]!
  model.setStructureData({ entities: ONE_TUP_ENTITIES })
  return { parent, model }
}

const coreAlignment = (structureRow = P53_CORE) => ({
  consensus: '',
  alns: [
    { id: 'a', seq: P53_CORE },
    { id: 'b', seq: structureRow },
  ] as const,
})

// Reproduced 2026-09-24 on the real 1TUP.cif: a spec alignment with no
// mappedEntityId mapped the transcript onto DNA strand E, and R248 never lit.
test('a spec alignment without an entity maps onto the chain it spells, not entity 1', () => {
  const { parent, model } = load1tup({ pairwiseAlignment: coreAlignment() })
  expect(model.mappedEntityId).toBe('3')
  expect(model.alignmentImported).toBe(true)
  expect(model.clickedStructureRanges).toEqual([{ start: 154, end: 155 }])
  expect(parent.viewErrors).toEqual([])
})

test('an alignment saved against another chain moves to the chain it spells', () => {
  const { model } = load1tup({
    pairwiseAlignment: coreAlignment(),
    mappedEntityId: '1',
  })
  expect(model.mappedEntityId).toBe('3')
  expect(model.clickedStructureRanges).toEqual([{ start: 154, end: 155 }])
})

test('an alignment that spells no chain is set aside, reported, and replaced by one computed here', () => {
  const { parent, model } = load1tup({
    pairwiseAlignment: coreAlignment(
      `${P53_CORE.slice(0, 100)}W${P53_CORE.slice(101)}`,
    ),
  })
  expect(String(parent.viewErrors)).toContain(
    'is not the sequence of any chain in this structure',
  )
  expect(model.alignmentImported).toBe(false)
  expect(model.mappedEntityId).toBe('3')
  expect(model.structureSeqToTranscriptSeqPosition?.[100]).toBe(100)
})

// An older session's alignment was computed from Mol*'s `label`, which a
// modified residue lengthens; it is recomputed on the chain the user picked,
// not re-chosen, so a paralog picked by hand stays picked.
test('a stale stored alignment is recomputed against its stored protein chain', () => {
  const paralog = `${P53_CORE.slice(0, 50)}AAAA${P53_CORE.slice(54)}`
  const parent = TestParent.create({
    structures: [
      {
        userProvidedTranscriptSequence: P53_CORE,
        pairwiseAlignment: coreAlignment(`${P53_CORE.slice(0, 100)}(S|P)`),
        mappedEntityId: '4',
      },
    ],
  })
  const model = parent.structures[0]!
  model.setStructureData({
    entities: [
      ...ONE_TUP_ENTITIES,
      { entityId: '4', seq: paralog, seqIds: [], chains: ['D'] },
    ],
  })
  expect(String(parent.viewErrors)).toContain(
    'no longer matches its chain and was recomputed',
  )
  expect(model.mappedEntityId).toBe('4')
  expect(model.pairwiseAlignment?.alns[1].seq.replaceAll('-', '')).toBe(paralog)
})
