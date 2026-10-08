import { expect, test } from 'vitest'

import { showLoading } from './showLoading'

const pending = { loading: true }
const settled = { loading: false }

test('an empty view is not loading', () => {
  expect(
    showLoading({ minimized: false, error: undefined, structures: [] }),
  ).toBe(false)
})

test('a view is loading while any structure is', () => {
  const base = { minimized: false, error: undefined }
  expect(showLoading({ ...base, structures: [settled, pending] })).toBe(true)
  expect(showLoading({ ...base, structures: [settled, settled] })).toBe(false)
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
