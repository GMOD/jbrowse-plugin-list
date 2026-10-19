import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import subscribeMolstarInteraction from './subscribeMolstarInteraction'
import { attachViewInteractions } from './viewInteractions'

import type { MolstarLocationInfo } from './subscribeMolstarInteraction'
import type { ViewInteractionHost } from './viewInteractions'
import type { Instance } from '@jbrowse/mobx-state-tree'

vi.mock('./subscribeMolstarInteraction', () => ({ default: vi.fn() }))
const mockSubscribe = vi.mocked(subscribeMolstarInteraction)

// Only what the interactions reach for. The genome navigation a real hit
// triggers is clickProteinToGenome's business, tested with the mapping; what
// is asserted here is which structure state an interaction touches.
const TestStructure = types
  .model('TestStructure', { modelId: types.string })
  .volatile(() => ({
    clickedStructureRanges: [] as readonly { start: number; end: number }[],
    selectedFeatureId: undefined as string | undefined,
    hovered: undefined as { structureSeqPos?: number } | undefined,
    genomeToTranscriptSeqMapping: undefined,
    pairwiseAlignment: undefined,
    structureSeqToTranscriptSeqPosition: undefined,
    connectedView: undefined,
    zoomToBaseLevel: false,
  }))
  .actions(self => ({
    setClickedStructureRanges(
      ranges: readonly { start: number; end: number }[],
    ) {
      self.clickedStructureRanges = ranges
    },
    setSelectedFeatureId(uniqueId?: string) {
      self.selectedFeatureId = uniqueId
    },
    setHoveredPosition(arg?: { structureSeqPos?: number }) {
      self.hovered = arg
    },
    setViewError(_e: unknown) {},
    // every structure of a view hears every interaction, so this is what says
    // whether one landed on this one
    interactionPosition(info: MolstarLocationInfo) {
      return info.modelId === self.modelId ? 7 : undefined
    },
  }))

const TestView = types
  .model('TestView', { structures: types.array(TestStructure) })
  .volatile(() => ({ molstarPluginContext: {} }))
  .actions(self => ({
    addStructure(modelId: string) {
      self.structures.push({ modelId })
    },
  }))

// One cast, at the seam where the stand-in stands in for a real view
const asViewHost = (view: Instance<typeof TestView>) =>
  view as unknown as ViewInteractionHost

const location = (modelId: string): MolstarLocationInfo => ({
  labelSeqId: 8,
  code: 'ARG',
  chain: 'A',
  entityId: '1',
  modelId,
})

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

async function attach(...modelIds: string[]) {
  const handlers = new Map<
    string,
    (info: MolstarLocationInfo | undefined) => void
  >()
  mockSubscribe.mockImplementation(({ kind, onUpdate }) => {
    handlers.set(kind, onUpdate)
    return Promise.resolve(() => {})
  })
  const view = TestView.create({
    structures: modelIds.map(modelId => ({ modelId })),
  })
  attachViewInteractions(asViewHost(view))
  await tick()
  return {
    view,
    click: handlers.get('click')!,
    hover: handlers.get('hover')!,
  }
}

beforeEach(() => {
  mockSubscribe.mockReset()
})

// Each structure used to hold two subscriptions of its own, so a view of N
// structures ran the same location extraction N times per pointer move.
test('a view subscribes once per kind, however many structures it holds', async () => {
  await attach('a', 'b', 'c')
  expect(mockSubscribe.mock.calls.map(([args]) => args.kind)).toEqual([
    'click',
    'hover',
  ])
})

// Clicking empty canvas is how Mol* itself drops a selection, and the model
// used to ignore a click with no hit — leaving the magenta residues and the
// selected feature bar lit with no way to put them down but selecting
// something else.
test('a click on the background clears the selection of every structure', async () => {
  const { view, click } = await attach('a', 'b')
  for (const structure of view.structures) {
    structure.setClickedStructureRanges([{ start: 3, end: 9 }])
    structure.setSelectedFeatureId('domain-1')
  }

  click(undefined)

  for (const structure of view.structures) {
    expect(structure.clickedStructureRanges).toEqual([])
    expect(structure.selectedFeatureId).toBeUndefined()
  }
})

// A click is one selection for the view. Keeping the neighbour's left two
// structures lit after the user picked a residue on one, and a declared seed
// on a superposed structure could only be put down from the menu.
test('a click on one structure puts its neighbour down', async () => {
  const { view, click } = await attach('a', 'b')
  const [a, b] = view.structures
  b!.setClickedStructureRanges([{ start: 3, end: 9 }])
  b!.setSelectedFeatureId('domain-1')

  click(location('a'))

  expect(a!.hovered?.structureSeqPos).toBe(7)
  expect(a!.clickedStructureRanges).toEqual([{ start: 7, end: 8 }])
  expect(b!.clickedStructureRanges).toEqual([])
  expect(b!.selectedFeatureId).toBeUndefined()
})

// 1TUP's DNA wraps the residues a p53 seed lights, so a click there is the
// likeliest click on the canvas, and it names no mapped residue.
test('a click on a chain no structure maps puts every selection down', async () => {
  const { view, click } = await attach('a', 'b')
  for (const structure of view.structures) {
    structure.setClickedStructureRanges([{ start: 3, end: 9 }])
  }

  click(location('dna'))

  for (const structure of view.structures) {
    expect(structure.clickedStructureRanges).toEqual([])
  }
})

test('a hover reports its position on its own structure only, and off it clears', async () => {
  const { view, hover } = await attach('a', 'b')
  const [a, b] = view.structures

  hover(location('b'))
  expect(a!.hovered).toBeUndefined()
  expect(b!.hovered?.structureSeqPos).toBe(7)

  hover(undefined)
  expect(b!.hovered).toBeUndefined()
})

test('a structure added later hears the next hover', async () => {
  const { view, hover } = await attach('a')
  view.addStructure('b')

  hover(location('b'))

  expect(view.structures[1]!.hovered?.structureSeqPos).toBe(7)
  expect(mockSubscribe).toHaveBeenCalledTimes(2)
})
