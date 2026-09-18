import { expect, test, vi } from 'vitest'

import {
  PERSISTED_SETTINGS,
  readStoredSettings,
  storeSetting,
  withStoredSettings,
} from './storedSettings'

test('a stored preference fills in a setting the snapshot leaves unsaid', () => {
  expect(
    withStoredSettings({ type: 'ProteinView' }, { showAlignment: false }),
  ).toEqual({ type: 'ProteinView', showAlignment: false })
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
  ])
  const stored = { zoomToBaseLevel: false, showHighlight: true }
  expect(withStoredSettings({ type: 'ProteinView' }, stored)).toEqual({
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
