import { expect, test } from 'vitest'

import { showLoading } from './showLoading'

const pending = { loading: true, variantEffectsPending: false }
const settled = { loading: false, variantEffectsPending: false }
const valuesOnTheirWay = { loading: false, variantEffectsPending: true }
const base = { minimized: false, error: undefined, paintsPending: 0 }

test('an empty view is not loading', () => {
  expect(showLoading({ ...base, structures: [] })).toBe(false)
})

test('a view is loading while any structure is', () => {
  expect(showLoading({ ...base, structures: [settled, pending] })).toBe(true)
  expect(showLoading({ ...base, structures: [settled, settled] })).toBe(false)
})

test("a view is loading while a color field's values are on their way", () => {
  expect(
    showLoading({ ...base, structures: [settled, valuesOnTheirWay] }),
  ).toBe(true)
})

test('a view is loading while a paint is queued', () => {
  expect(
    showLoading({ ...base, paintsPending: 1, structures: [settled] }),
  ).toBe(true)
  expect(
    showLoading({ ...base, paintsPending: 0, structures: [settled] }),
  ).toBe(false)
})

test('a minimized or errored view is not waiting on anything', () => {
  expect(showLoading({ ...base, minimized: true, structures: [pending] })).toBe(
    false,
  )
  expect(
    showLoading({ ...base, error: new Error('x'), structures: [pending] }),
  ).toBe(false)
  expect(
    showLoading({ ...base, minimized: true, paintsPending: 1, structures: [] }),
  ).toBe(false)
})
