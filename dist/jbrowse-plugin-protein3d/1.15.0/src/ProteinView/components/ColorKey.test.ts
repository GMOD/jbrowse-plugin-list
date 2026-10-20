import { expect, test } from 'vitest'

import { words } from './ColorKey'

test('splits Mol*’s camelCase names and leaves case-sensitive ones alone', () => {
  expect(words('alphaHelix')).toBe('alpha helix')
  expect(words('threeTenHelix')).toBe('three ten helix')
  expect(['A', 'a', 'RNA', 'ALA', 'Mapped chain'].map(words)).toEqual([
    'A',
    'a',
    'RNA',
    'ALA',
    'Mapped chain',
  ])
})
