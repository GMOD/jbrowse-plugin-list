import { expect, test } from 'vitest'

import { withStoredSettings } from './storedSettings'

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
