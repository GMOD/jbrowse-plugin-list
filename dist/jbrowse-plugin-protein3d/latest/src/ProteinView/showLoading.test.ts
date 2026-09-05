import { expect, test } from 'vitest'

import { showLoading } from './showLoading'

const pending = { loadedToMolstar: false }
const loaded = { loadedToMolstar: true }

test('an empty view is not loading', () => {
  expect(
    showLoading({ minimized: false, error: undefined, structures: [] }),
  ).toBe(false)
})

test('a structure not yet in Molstar is loading, and loaded is not', () => {
  const base = { minimized: false, error: undefined }
  expect(showLoading({ ...base, structures: [loaded, pending] })).toBe(true)
  expect(showLoading({ ...base, structures: [loaded, loaded] })).toBe(false)
})

test('a minimized or errored view is not waiting on anything', () => {
  expect(
    showLoading({ minimized: true, error: undefined, structures: [pending] }),
  ).toBe(false)
  expect(
    showLoading({
      minimized: false,
      error: new Error('x'),
      structures: [pending],
    }),
  ).toBe(false)
})
