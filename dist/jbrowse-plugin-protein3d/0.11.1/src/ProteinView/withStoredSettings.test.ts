import { expect, test, vi } from 'vitest'

import {
  readStoredSettings,
  storeSetting,
  withStoredSettings,
} from './storedSettings'

test('a stored preference fills in a setting the snapshot leaves unsaid', () => {
  expect(
    withStoredSettings({ type: 'ProteinView' }, { zoomToBaseLevel: false }),
  ).toEqual({ type: 'ProteinView', zoomToBaseLevel: false })
})

test('a declared value wins even when it equals the property default', () => {
  expect(
    withStoredSettings(
      { type: 'ProteinView', zoomToBaseLevel: true },
      { zoomToBaseLevel: false },
    ),
  ).toEqual({ type: 'ProteinView', zoomToBaseLevel: true })
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
