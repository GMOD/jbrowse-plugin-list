import { expect, test, vi } from 'vitest'

import { linearViewTarget } from './linearViewTarget'

function linearView(id: string, assemblyNames: string[]) {
  return {
    id,
    type: 'LinearGenomeView',
    assemblyNames,
    navToLocString: vi.fn(),
  }
}

function syntenyView(id: string, rows: unknown[]) {
  return { id, type: 'LinearSyntenyView', views: rows }
}

test('a top-level linear view resolves by its id', () => {
  const view = linearView('lgv1', ['K12'])
  expect(
    linearViewTarget({
      views: [linearView('lgv2', ['K12']), view],
      connectedViewId: 'lgv1',
      assemblyName: 'K12',
    }),
  ).toBe(view)
})

// A graph launched from a synteny row's rubberband records the row's id, and
// the row lives in the synteny view's own views[], not session.views.
test('a connected id naming a row inside a stack view resolves to that row', () => {
  const row = linearView('row1', ['K12'])
  expect(
    linearViewTarget({
      views: [syntenyView('synteny1', [row, linearView('row2', ['Sakai'])])],
      connectedViewId: 'row1',
      assemblyName: 'K12',
    }),
  ).toBe(row)
})

test('the paired row wins over a top-level view on the same assembly', () => {
  const row = linearView('row1', ['K12'])
  expect(
    linearViewTarget({
      views: [linearView('lgv1', ['K12']), syntenyView('synteny1', [row])],
      connectedViewId: 'row1',
      assemblyName: 'K12',
    }),
  ).toBe(row)
})

test('an unpaired lone row on the assembly is the one candidate', () => {
  const row = linearView('row1', ['K12'])
  expect(
    linearViewTarget({
      views: [syntenyView('synteny1', [row, linearView('row2', ['Sakai'])])],
      connectedViewId: undefined,
      assemblyName: 'K12',
    }),
  ).toBe(row)
})

test('a row on another assembly is not a candidate', () => {
  expect(
    linearViewTarget({
      views: [syntenyView('synteny1', [linearView('row1', ['Sakai'])])],
      connectedViewId: 'row1',
      assemblyName: 'K12',
    }),
  ).toBeUndefined()
})

test('a views member that is not an array is not walked', () => {
  expect(
    linearViewTarget({
      views: [{ id: 'odd', type: 'Other', views: 'nope' }],
      connectedViewId: 'odd',
      assemblyName: 'K12',
    }),
  ).toBeUndefined()
})
