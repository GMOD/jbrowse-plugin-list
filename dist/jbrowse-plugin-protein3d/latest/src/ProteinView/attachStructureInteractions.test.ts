import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import { attachStructureInteractions } from './attachStructureInteractions'
import subscribeMolstarInteraction from './subscribeMolstarInteraction'

import type { StructureInteractionHost } from './attachStructureInteractions'
import type { MolstarLocationInfo } from './subscribeMolstarInteraction'
import type { Instance } from '@jbrowse/mobx-state-tree'

vi.mock('./subscribeMolstarInteraction', () => ({ default: vi.fn() }))
const mockSubscribe = vi.mocked(subscribeMolstarInteraction)

// Only what attachStructureInteractions reaches for. The genome navigation a
// real hit triggers is clickProteinToGenome's business, tested with the
// mapping; what is asserted here is which structure state an interaction
// touches.
const TestStructure = types
  .model('TestStructure', {})
  .volatile(() => ({
    molstarPluginContext: {},
    clickedStructureRange: undefined as
      { start: number; end: number } | undefined,
    selectedFeatureId: undefined as string | undefined,
    hovered: undefined as { structureSeqPos?: number } | undefined,
    genomeToTranscriptSeqMapping: undefined,
    pairwiseAlignment: undefined,
    structureSeqToTranscriptSeqPosition: undefined,
    connectedView: undefined,
    zoomToBaseLevel: false,
  }))
  .actions(self => ({
    setClickedStructureRange(range?: { start: number; end: number }) {
      self.clickedStructureRange = range
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
      return info.modelId === 'mine' ? 7 : undefined
    },
  }))

type TestStructureInstance = Instance<typeof TestStructure>

// One cast, at the seam where the stand-in stands in for a real structure
const asInteractionHost = (structure: TestStructureInstance) =>
  structure as unknown as StructureInteractionHost

const location = (modelId: string): MolstarLocationInfo => ({
  labelSeqId: 8,
  code: 'ARG',
  chain: 'A',
  entityId: '1',
  modelId,
})

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

async function attach() {
  const handlers = new Map<
    string,
    (info: MolstarLocationInfo | undefined) => void
  >()
  mockSubscribe.mockImplementation(({ kind, onUpdate }) => {
    handlers.set(kind, onUpdate)
    return Promise.resolve(() => {})
  })
  const structure = TestStructure.create()
  attachStructureInteractions(asInteractionHost(structure))
  await tick()
  return {
    structure,
    click: handlers.get('click')!,
    hover: handlers.get('hover')!,
  }
}

beforeEach(() => {
  mockSubscribe.mockReset()
})

// Clicking empty canvas is how Mol* itself drops a selection, and the model
// used to ignore a click with no hit — leaving the magenta residues and the
// selected feature bar lit with no way to put them down but selecting
// something else.
test('a click on the background clears the selection of every structure', async () => {
  const { structure, click } = await attach()
  structure.setClickedStructureRange({ start: 3, end: 9 })
  structure.setSelectedFeatureId('domain-1')

  click(undefined)

  expect(structure.clickedStructureRange).toBeUndefined()
  expect(structure.selectedFeatureId).toBeUndefined()
})

// A click that landed on a neighbouring structure is that structure's to
// answer: clearing here would mean opening a second structure silently
// unselects the first.
test('a click on another structure leaves this one selected', async () => {
  const { structure, click } = await attach()
  structure.setClickedStructureRange({ start: 3, end: 9 })
  structure.setSelectedFeatureId('domain-1')

  click(location('someone-elses'))

  expect(structure.clickedStructureRange).toEqual({ start: 3, end: 9 })
  expect(structure.selectedFeatureId).toBe('domain-1')
})

test('a hover on this structure reports its position, and off it clears', async () => {
  const { structure, hover } = await attach()

  hover(location('mine'))
  expect(structure.hovered?.structureSeqPos).toBe(7)

  hover(undefined)
  expect(structure.hovered).toBeUndefined()
})
