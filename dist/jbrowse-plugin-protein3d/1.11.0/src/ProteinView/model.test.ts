import { expect, test, vi } from 'vitest'

import { COMPACT_TRACK_HEIGHT, NORMAL_TRACK_HEIGHT } from './constants'
import stateModelFactory from './model'
import { removeMolstarStructure } from './removeStructure'
import { PERSISTED_SETTINGS } from './storedSettings'

import type { ProteinStructureSpec } from './proteinViewSpec'
import type { PersistedSetting, PersistedSettings } from './storedSettings'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

vi.mock('./removeStructure', () => ({ removeMolstarStructure: vi.fn() }))
const mockRemove = vi.mocked(removeMolstarStructure)

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

const ProteinView = stateModelFactory()

// One cast, where a stand-in stands in for the whole Mol* plugin: the view only
// hands it to removeMolstarStructure, which is mocked.
const plugin = {} as unknown as PluginContext

function makeView(settings: PersistedSettings = {}) {
  return ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }, { url: 'b.cif' }],
    ...settings,
  })
}

type View = ReturnType<typeof makeView>

function toggleOf(view: View, key: PersistedSetting) {
  const toggle = view.displayToggles.find(t => t.key === key)
  if (!toggle) {
    throw new Error(`no ${key} toggle`)
  }
  return toggle
}

function stubStorage() {
  const writes: string[] = []
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: (_key: string, value: string) => writes.push(value),
  })
  return writes
}

test('removing a structure leaves the others as they were', () => {
  const view = makeView()
  const [first, second] = view.structures
  second!.setClickedStructureRanges([{ start: 3, end: 7 }])

  view.removeStructure(first!)
  expect(view.structures.length).toBe(1)
  expect(view.structures[0]!.url).toBe('b.cif')
  expect(view.structures[0]!.clickedStructureRanges).toEqual([
    {
      start: 3,
      end: 7,
    },
  ])
  // the pivot a superposition aligned against is gone, so the rest re-align
  expect(view.superposedCount).toBe(0)
})

// The removal settles after the action has returned, so reporting its failure
// by writing to `self` throws inside MST where nothing catches it.
test('a removal that fails reports through the error action', async () => {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  const view = makeView()
  mockRemove.mockRejectedValueOnce(new Error('plugin disposed'))
  view.setMolstarPluginContext(plugin)
  view.removeStructure(view.structures[0]!)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(view.error).toEqual(new Error('plugin disposed'))
  logged.mockRestore()
})

// The view menu used to repeat the header's four toggles, the colour scheme and
// a third copy of "restore hidden tracks", then bury the rest under "Advanced".
test('the view menu carries actions and the Tune menu carries toggles', () => {
  const view = makeView()
  const labels = view
    .menuItems()
    .map(item => ('label' in item ? item.label : undefined))
  expect(labels).toEqual([
    'Add structure...',
    'Remove structure',
    'Clear selection',
    'Import manual alignment...',
    'Re-align structures (TM-align)',
    'Restore hidden feature tracks',
  ])

  const toggles: string[] = [
    ...view.displayToggles,
    ...view.behaviorToggles,
  ].map(t => t.label)
  expect(toggles).toContain('Show Mol* controls')
  expect(
    labels.some(label => typeof label === 'string' && toggles.includes(label)),
  ).toBe(false)
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
  const entry: ProteinStructureSpec = { pdbId: '1TUP' }
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [entry, entry],
  })
  const messages = view.loadingMessages
  expect(messages.map(m => m.message)).toEqual(['Loading 1TUP', 'Loading 1TUP'])
  expect(new Set(messages.map(m => m.id)).size).toBe(2)
})

test('clearing the selection puts every structure down', () => {
  const view = makeView()
  for (const structure of view.structures) {
    structure.setClickedStructureRanges([{ start: 1, end: 2 }])
    structure.setSelectedFeatureId('feature-1')
  }

  view.clearSelection()
  for (const structure of view.structures) {
    expect(structure.clickedStructureRanges).toEqual([])
    expect(structure.selectedFeatureId).toBeUndefined()
  }
})

test('a selection made in one alignment panel puts the other structures down', () => {
  const view = makeView()
  const [first, second] = view.structures
  second!.setClickedStructureRanges([{ start: 1, end: 2 }])

  first!.selectResidues(3, 7)
  expect(first!.clickedStructureRanges).toEqual([{ start: 3, end: 7 }])
  expect(second!.clickedStructureRanges).toEqual([])
})

test('one alignment panel is open: the seeded structure, else the first', () => {
  const plain = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }, { url: 'b.cif' }, { url: 'c.cif' }],
  })
  expect(plain.alignmentStructure?.url).toBe('a.cif')

  const seeded = ProteinView.create({
    type: 'ProteinView',
    structures: [
      { url: 'a.cif' },
      { url: 'b.cif', initialResidues: { start: 248, end: 248 } },
    ],
  })
  expect(seeded.alignmentStructure?.url).toBe('b.cif')

  seeded.openAlignmentOf(seeded.structures[0]!)
  expect(seeded.alignmentStructure?.url).toBe('a.cif')
})

test('removing a structure keeps the open panel on the structure it was on', () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }, { url: 'b.cif' }, { url: 'c.cif' }],
  })
  view.openAlignmentOf(view.structures[2]!)
  view.removeStructure(view.structures[0]!)
  expect(view.alignmentStructure?.url).toBe('c.cif')

  view.removeStructure(view.structures[1]!)
  expect(view.alignmentStructure?.url).toBe('b.cif')
})

test('minor feature types are omitted until every track is shown', () => {
  const view = makeView()
  const structure = view.structures[0]!
  structure.hideFeatureType('Natural variant')
  expect(structure.omittedFeatureTypes.has('Helix')).toBe(true)
  expect(structure.omittedFeatureTypes.has('Region')).toBe(false)
  expect(structure.omittedFeatureTypes.has('Natural variant')).toBe(true)

  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} })
  view.toggleSetting('showAllFeatureTracks')
  vi.unstubAllGlobals()
  expect(structure.omittedFeatureTypes.has('Helix')).toBe(false)
  expect(structure.omittedFeatureTypes.has('Natural variant')).toBe(true)
})

test('dragging the track handle resizes every lane, within limits', () => {
  const view = makeView()
  const structure = view.structures[0]!
  expect(structure.laneHeight).toBe(9)

  structure.resizeTracks(6)
  expect(view.trackHeight).toBe(14)
  expect(view.structures[1]!.laneHeight).toBe(16)

  structure.resizeTracks(-100)
  expect(structure.trackHeight).toBe(2)
  structure.resizeTracks(1000)
  expect(structure.trackHeight).toBe(40)
})

// A drag writes `trackHeight` and leaves `compactTracks` alone, so the box read
// checked over 40px lanes and its first click gave 12px rather than 8.
test('the compact toggle reads the lane height, not the flag under it', () => {
  const dragged = makeView()
  dragged.structures[0]!.resizeTracks(1000)
  expect(toggleOf(dragged, 'compactTracks').checked).toBe(false)

  const writes = stubStorage()
  toggleOf(dragged, 'compactTracks').toggle()
  expect(dragged.compactTracks).toBe(true)
  expect(dragged.trackHeight).toBeUndefined()
  expect(dragged.structures[0]!.trackHeight).toBe(COMPACT_TRACK_HEIGHT)
  expect(writes).toEqual([JSON.stringify({ compactTracks: true })])

  const declared = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
    trackHeight: 5,
    compactTracks: false,
  })
  expect(toggleOf(declared, 'compactTracks').checked).toBe(true)
  toggleOf(declared, 'compactTracks').toggle()
  vi.unstubAllGlobals()
  expect(declared.trackHeight).toBeUndefined()
  expect(declared.structures[0]!.trackHeight).toBe(NORMAL_TRACK_HEIGHT)
})

const TRACK_TOGGLES = ['showAllFeatureTracks', 'compactTracks'] as const
const PANEL_TOGGLES = ['showProteinTracks', 'autoScrollAlignment'] as const

function disabledKeys(view: View) {
  return view.displayToggles.filter(t => t.disabled).map(t => t.key)
}

// The alignment panel holds the track rows, so with either hidden the toggles
// under it were enabled no-ops that still wrote a preference.
test('a toggle is disabled while a setting it needs is off', () => {
  expect(disabledKeys(makeView())).toEqual([])

  const noPanel = makeView({ showAlignment: false })
  expect(new Set(disabledKeys(noPanel))).toEqual(
    new Set([...PANEL_TOGGLES, ...TRACK_TOGGLES]),
  )

  const noTracks = makeView({ showProteinTracks: false })
  expect(new Set(disabledKeys(noTracks))).toEqual(new Set(TRACK_TOGGLES))
})

test('a disabled toggle changes nothing and stores nothing', () => {
  const view = makeView({ showAlignment: false })
  const writes = stubStorage()
  for (const key of [...PANEL_TOGGLES, ...TRACK_TOGGLES]) {
    const before = view[key]
    toggleOf(view, key).toggle()
    expect(view[key]).toBe(before)
  }
  expect(writes).toEqual([])

  toggleOf(view, 'showAlignment').toggle()
  vi.unstubAllGlobals()
  expect(view.showAlignment).toBe(true)
  expect(writes).toEqual([JSON.stringify({ showAlignment: true })])
})

test('the Tune menu offers exactly the remembered settings', () => {
  expect(new Set(makeView().displayToggles.map(t => t.key))).toEqual(
    new Set(PERSISTED_SETTINGS),
  )
})

// The tutorial links open a multi-chain entry with the panel hidden, where no
// row is the open one and so no row had a picker.
test('every row offers the chain picker while the alignment panel is hidden', () => {
  const structures = [
    { url: 'a.cif', userProvidedTranscriptSequence: 'MEEPQ' },
    { url: 'b.cif', userProvidedTranscriptSequence: 'MEEPQ' },
    { url: 'c.cif' },
  ]
  const shown = ProteinView.create({ type: 'ProteinView', structures })
  expect(shown.structures.map(s => shown.offersChainPicker(s))).toEqual([
    true,
    false,
    true,
  ])

  const hidden = ProteinView.create({
    type: 'ProteinView',
    structures,
    showAlignment: false,
  })
  expect(hidden.structures.map(s => hidden.offersChainPicker(s))).toEqual([
    true,
    true,
    true,
  ])
})

// dragging the resize handle past the top of the canvas used to leave a
// negative height the pointer had to travel all the way back out of
test('the canvas height has a floor', () => {
  const view = makeView()
  view.setHeight(-200)
  expect(view.height).toBe(100)
})
