import { expect, test } from 'vitest'

import { showLoading } from './showLoading'
import { superpositionKeys } from './structureSuperposer'

import type { SuperpositionKey } from './structureSuperposer'

function structure(state: {
  loading: boolean
  variantEffectsPending?: boolean
  loadedToMolstar?: boolean
}) {
  return {
    variantEffectsPending: false,
    loadedToMolstar: !state.loading,
    molstarStructures: [],
    mappedEntity: undefined,
    alignment: undefined,
    ...state,
  }
}

const pending = structure({ loading: true })
const settled = structure({ loading: false })
const valuesOnTheirWay = structure({
  loading: false,
  variantEffectsPending: true,
})
const failed = structure({ loading: false, loadedToMolstar: false })
const noKeys: readonly SuperpositionKey[] = []
const base = {
  minimized: false,
  error: undefined,
  paintsPending: 0,
  superposedKeys: noKeys,
  superposing: false,
}

function superposed(structures: ReturnType<typeof structure>[]) {
  return { ...base, structures, superposedKeys: superpositionKeys(structures) }
}

test('an empty view is not loading', () => {
  expect(showLoading({ ...base, structures: [] })).toBe(false)
})

test('a view is loading while any structure is', () => {
  expect(showLoading({ ...base, structures: [settled, pending] })).toBe(true)
  expect(showLoading(superposed([settled, settled]))).toBe(false)
})

test("a view is loading while a color field's values are on their way", () => {
  expect(showLoading(superposed([settled, valuesOnTheirWay]))).toBe(true)
})

test('a view is loading while a paint is queued', () => {
  expect(
    showLoading({ ...base, paintsPending: 1, structures: [settled] }),
  ).toBe(true)
  expect(
    showLoading({ ...base, paintsPending: 0, structures: [settled] }),
  ).toBe(false)
})

test('a view is loading until its loaded structures are superposed', () => {
  const second = structure({ loading: false })
  expect(showLoading({ ...base, structures: [settled, second] })).toBe(true)
  expect(showLoading(superposed([settled, second]))).toBe(false)
})

test('a structure that failed to load holds no superposition back', () => {
  expect(showLoading({ ...base, structures: [settled, failed] })).toBe(false)
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
  expect(
    showLoading({ ...base, minimized: true, structures: [settled, settled] }),
  ).toBe(false)
})
