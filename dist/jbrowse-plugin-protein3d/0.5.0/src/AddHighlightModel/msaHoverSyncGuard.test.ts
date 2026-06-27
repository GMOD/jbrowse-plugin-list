import { autorun, observable, untracked } from 'mobx'
import { expect, test } from 'vitest'

// Mirrors the guard pattern in ProteinToMsaHoverSync.tsx so regressions to the
// logic (removing untracked, removing a guard) will break these tests.
function setupSyncAutorun(
  msaView: { mouseoveredColumn: number | undefined },
  structure: {
    alignmentHoverRange: { start: number; end: number } | undefined
  },
  onHighlight: (col: number) => void,
  onClear: () => void,
) {
  return autorun(() => {
    const col = msaView.mouseoveredColumn
    if (!untracked(() => structure.alignmentHoverRange)) {
      if (col === undefined) {
        onClear()
      } else {
        onHighlight(col)
      }
    }
  })
}

test('calls highlight when col is set and no feature is hovered', () => {
  const msaView = observable({
    mouseoveredColumn: undefined as number | undefined,
  })
  const structure = observable({
    alignmentHoverRange: undefined as
      | { start: number; end: number }
      | undefined,
  })
  const highlights: number[] = []

  const dispose = setupSyncAutorun(
    msaView,
    structure,
    col => highlights.push(col),
    () => {},
  )
  msaView.mouseoveredColumn = 5
  expect(highlights).toEqual([5])
  dispose()
})

test('suppresses highlight when feature range is active', () => {
  const msaView = observable({
    mouseoveredColumn: undefined as number | undefined,
  })
  const structure = observable({
    alignmentHoverRange: undefined as
      | { start: number; end: number }
      | undefined,
  })
  const highlights: number[] = []

  const dispose = setupSyncAutorun(
    msaView,
    structure,
    col => highlights.push(col),
    () => {},
  )
  structure.alignmentHoverRange = { start: 5, end: 15 }
  msaView.mouseoveredColumn = 7
  expect(highlights).toEqual([])
  dispose()
})

test('resumes highlight after feature range is cleared', () => {
  const msaView = observable({
    mouseoveredColumn: undefined as number | undefined,
  })
  const structure = observable({
    alignmentHoverRange: { start: 5, end: 15 },
  })
  const highlights: number[] = []

  const dispose = setupSyncAutorun(
    msaView,
    structure,
    col => highlights.push(col),
    () => {},
  )
  msaView.mouseoveredColumn = 7
  expect(highlights).toEqual([]) // suppressed

  structure.alignmentHoverRange = undefined
  msaView.mouseoveredColumn = 8
  expect(highlights).toEqual([8])
  dispose()
})

test('calls clear when col becomes undefined and no feature is hovered', () => {
  const msaView = observable({ mouseoveredColumn: 5 })
  const structure = observable({
    alignmentHoverRange: undefined as
      | { start: number; end: number }
      | undefined,
  })
  const clears: number[] = []

  const dispose = setupSyncAutorun(
    msaView,
    structure,
    () => {},
    () => clears.push(1),
  )
  msaView.mouseoveredColumn = undefined
  expect(clears.length).toBe(1)
  dispose()
})

test('suppresses clear when col is undefined but feature range is active', () => {
  const msaView = observable({ mouseoveredColumn: 5 })
  const structure = observable({
    alignmentHoverRange: { start: 5, end: 15 },
  })
  const clears: number[] = []

  const dispose = setupSyncAutorun(
    msaView,
    structure,
    () => {},
    () => clears.push(1),
  )
  msaView.mouseoveredColumn = undefined
  expect(clears).toEqual([])
  dispose()
})

test('alignmentHoverRange changes do not retrigger the autorun', () => {
  // Verifies that untracked() works: alignmentHoverRange must not be a
  // tracked dependency, otherwise feature mouseenter/mouseleave would
  // spuriously re-fire the autorun and potentially clear the range highlight.
  const msaView = observable({ mouseoveredColumn: 5 })
  const structure = observable({
    alignmentHoverRange: undefined as
      | { start: number; end: number }
      | undefined,
  })
  const highlights: number[] = []

  const dispose = setupSyncAutorun(
    msaView,
    structure,
    col => highlights.push(col),
    () => {},
  )
  expect(highlights).toEqual([5]) // initial autorun fires once

  structure.alignmentHoverRange = { start: 0, end: 10 }
  structure.alignmentHoverRange = undefined
  expect(highlights).toEqual([5]) // no extra fires
  dispose()
})
