import { expect, test, vi } from 'vitest'

import {
  PERSISTED_SETTINGS,
  readStoredSettings,
  storeSetting,
  withStoredSettings,
} from './storedSettings'

import type { PersistedSettings } from './storedSettings'

const bare: { type: string } & PersistedSettings = { type: 'ProteinView' }

test('a stored preference fills in a setting the snapshot leaves unsaid', () => {
  expect(withStoredSettings(bare, { showAlignment: false })).toEqual({
    type: 'ProteinView',
    showAlignment: false,
  })
})

test('a declared value wins even when it equals the property default', () => {
  expect(
    withStoredSettings(
      { type: 'ProteinView', showAlignment: true },
      { showAlignment: false },
    ),
  ).toEqual({ type: 'ProteinView', showAlignment: true })
})

// What a click does is not a layout preference: a stored zoomToBaseLevel used
// to follow the reader into every later view, including one whose spec had
// said nothing about it.
test('a behavior setting is never restored from storage', () => {
  expect(PERSISTED_SETTINGS).toEqual([
    'showAlignment',
    'showProteinTracks',
    'showControls',
    'autoScrollAlignment',
    'compactTracks',
    'showAllFeatureTracks',
  ])
  const stored: Record<string, boolean> = {
    zoomToBaseLevel: false,
    showHighlight: true,
  }
  expect(withStoredSettings(bare, stored)).toEqual({
    type: 'ProteinView',
  })
})

test('no stored preference leaves the snapshot alone', () => {
  const snapshot = { type: 'ProteinView', showAlignment: false }
  expect(withStoredSettings(snapshot, undefined)).toBe(snapshot)
})

test('storing a menu choice keeps the other stored choices and adds nothing else', () => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
  })
  storeSetting('compactTracks', false)
  storeSetting('showAlignment', true)
  expect(readStoredSettings()).toEqual({
    compactTracks: false,
    showAlignment: true,
  })
  vi.unstubAllGlobals()
})

// a non-boolean copied into the snapshot fails MST's type check, and the view
// would not open at all
test('a stored value that is not a boolean is dropped', () => {
  const store = new Map([
    [
      'proteinView-settings',
      JSON.stringify({ showAlignment: 'yes', compactTracks: true, extra: 1 }),
    ],
  ])
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
  })
  expect(readStoredSettings()).toEqual({ compactTracks: true })
  vi.unstubAllGlobals()
})
