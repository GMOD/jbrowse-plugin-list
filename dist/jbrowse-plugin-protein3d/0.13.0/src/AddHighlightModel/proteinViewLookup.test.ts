import { expect, test } from 'vitest'

import { getStructuresConnectedTo } from './proteinViewLookup'

const a = { name: 'a', connectedViewId: 'lgv-1' }
const b = { name: 'b', connectedViewId: 'lgv-2' }
const unattached = { name: 'unattached' }

test('takes only the structures declaring this genome view', () => {
  const views = [{ structures: [a, b] }]
  expect(getStructuresConnectedTo(views, 'lgv-1')).toEqual([a])
  expect(getStructuresConnectedTo(views, 'lgv-2')).toEqual([b])
})

test('collects across every protein view, not just the first', () => {
  const views = [{ structures: [a] }, { structures: [b, { ...a, name: 'c' }] }]
  expect(getStructuresConnectedTo(views, 'lgv-1').map(s => s.name)).toEqual([
    'a',
    'c',
  ])
})

test('a structure with no connected view is never highlighted', () => {
  expect(
    getStructuresConnectedTo([{ structures: [unattached] }], 'lgv-1'),
  ).toEqual([])
})

test('no protein views means nothing to highlight', () => {
  expect(getStructuresConnectedTo([], 'lgv-1')).toEqual([])
})
