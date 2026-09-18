import { expect, test, vi } from 'vitest'

import stateModelFactory from './model'
import { removeMolstarStructure } from './removeStructure'

import type { StructureRemovalHost } from './removeStructure'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

const ProteinView = stateModelFactory()

// One cast, where a stand-in stands in for the whole Mol* plugin: the view only
// reaches the structure hierarchy through removeMolstarStructure.
const asPluginContext = (stub: StructureRemovalHost) =>
  stub as unknown as PluginContext

function makeView() {
  return ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }, { url: 'b.cif' }],
  })
}

test('removing a structure leaves the others as they were', () => {
  const view = makeView()
  const [first, second] = view.structures
  second!.setClickedStructureRange({ start: 3, end: 7 })

  view.removeStructure(first!)
  expect(view.structures.length).toBe(1)
  expect(view.structures[0]!.url).toBe('b.cif')
  expect(view.structures[0]!.clickedStructureRange).toEqual({
    start: 3,
    end: 7,
  })
  // the pivot a superposition aligned against is gone, so the rest re-align
  expect(view.superposedCount).toBe(0)
})

// The removal settles after the action has returned, so reporting its failure
// by writing to `self` throws inside MST where nothing catches it.
test('a removal that fails reports through the error action', async () => {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  const view = makeView()
  view.setMolstarPluginContext(
    asPluginContext({
      managers: {
        structure: {
          hierarchy: {
            findStructure: () => ({ kind: 'structure' }),
            remove: () => Promise.reject(new Error('plugin disposed')),
          },
        },
      },
    }),
  )
  view.removeStructure(view.structures[0]!)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(view.error).toEqual(new Error('plugin disposed'))
  logged.mockRestore()
})

// Removing the structure node alone would leave the download, trajectory and
// model behind, and an ensemble's other models with them.
test('a removal takes out the trajectory the structure came from', async () => {
  const trajectory = { kind: 'trajectory' }
  const structureRef = { kind: 'structure', model: { trajectory } }
  const removed: unknown[] = []
  await removeMolstarStructure({
    plugin: {
      managers: {
        structure: {
          hierarchy: {
            findStructure: () => structureRef,
            remove: (refs: unknown[]) => {
              removed.push(...refs)
              return undefined
            },
          },
        },
      },
    },
    molstarStructure: undefined,
  })
  expect(removed).toEqual([trajectory])
})

// The view menu used to repeat the header's four toggles, the colour scheme and
// a third copy of "restore hidden tracks", then bury the rest under "Advanced".
test('the view menu carries actions and the Tune menu carries toggles', () => {
  const view = makeView()
  const labels = view.menuItems().map(item => item.label)
  expect(labels).toEqual([
    'Add structure...',
    'Remove structure',
    'Clear selection',
    'Import manual alignment...',
    'Re-align structures (TM-align)',
    'Restore hidden feature tracks',
  ])

  const toggles = [...view.displayToggles, ...view.behaviorToggles].map(
    t => t.label,
  )
  expect(toggles).toContain('Show Mol* controls')
  expect(labels.some(label => toggles.includes(label))).toBe(false)
})

test('a behavior toggle changes this view and is not remembered', () => {
  const view = makeView()
  const stored: string[] = []
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: (k: string) => stored.push(k),
  })
  view.behaviorToggles[0]!.toggle()
  expect(view.showHighlight).toBe(true)
  expect(stored).toEqual([])
  vi.unstubAllGlobals()
})

// A view-wide banner reading "Failed to fetch" names neither which structure
// nor what it was fetching, and a structure stuck at loading never settles.
test('a failed structure reports on its own line and stops being pending', () => {
  const view = makeView()
  const [first, second] = view.structures
  first!.setError(new Error('HTTP 404 fetching a.cif'))

  expect(first!.statusMessage).toBe('HTTP 404 fetching a.cif')
  expect(first!.loading).toBe(false)
  expect(second!.statusMessage).toBeUndefined()
  expect(view.error).toBeUndefined()
})

// Two copies of one entry are a real thing to open, and their loading lines
// read the same; keyed on the text, React logs a duplicate key, which the e2e
// console gate fails on.
test('two structures loading the same file get one overlay line each', () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ pdbId: '1TUP' }, { pdbId: '1TUP' }],
  })
  const messages = view.loadingMessages
  expect(messages.map(m => m.message)).toEqual(['Loading 1TUP', 'Loading 1TUP'])
  expect(new Set(messages.map(m => m.id)).size).toBe(2)
})

test('clearing the selection puts every structure down', () => {
  const view = makeView()
  for (const structure of view.structures) {
    structure.setClickedStructureRange({ start: 1, end: 2 })
    structure.setSelectedFeatureId('feature-1')
  }

  view.clearSelection()
  for (const structure of view.structures) {
    expect(structure.clickedStructureRange).toBeUndefined()
    expect(structure.selectedFeatureId).toBeUndefined()
  }
})
