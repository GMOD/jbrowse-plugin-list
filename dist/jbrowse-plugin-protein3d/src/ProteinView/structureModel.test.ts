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
