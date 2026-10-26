import { expect, test } from 'vitest'

import { checkedStructureFilters, filterProblems } from './residueFilter'

test('a filter that reads has no problems', () => {
  expect(filterProblems(undefined)).toEqual([])
  expect(
    filterProblems([
      { field: 'residue', lte: 184 },
      { field: 'chain', oneOf: ['B', 'C'] },
    ]),
  ).toEqual([])
})

test.each([
  [
    "filter is a list of predicates such as [{ field: 'residue', lte: 184 }]",
    'B',
  ],
  [
    "filter is a list of predicates such as [{ field: 'residue', lte: 184 }]",
    { field: 'residue', lte: 4 },
  ],
])('%s', (problem, filter) => {
  expect(filterProblems(filter)).toEqual([problem])
})

test.each([
  [
    "filter[0] is an object such as { field: 'residue', lte: 184 }",
    ['residue <= 184'],
  ],
  ['filter[0].field is residue or chain, not undefined', [{ lte: 184 }]],
  [
    'filter[0].field is residue or chain, not "residues"',
    [{ field: 'residues', lte: 184 }],
  ],
  [
    'filter[0] tests nothing: a predicate takes field and one of equal, lt, lte, gt, gte, range, oneOf',
    [{ field: 'residue' }],
  ],
  [
    'filter[0].below is not an operator: a predicate takes field and one of equal, lt, lte, gt, gte, range, oneOf',
    [{ field: 'residue', below: 184 }],
  ],
  [
    'filter[0].lte is refused: chain is a string, so it takes equal or oneOf',
    [{ field: 'chain', lte: 4 }],
  ],
  ['filter[0].lte is a number, not "184"', [{ field: 'residue', lte: '184' }]],
  ['filter[0].gt is a number, not null', [{ field: 'residue', gt: null }]],
  ['filter[0].equal is a number, not "B"', [{ field: 'residue', equal: 'B' }]],
  ['filter[0].equal is a string, not 2', [{ field: 'chain', equal: 2 }]],
  [
    'filter[0].range is two numbers, the low and high ends, not [4]',
    [{ field: 'residue', range: [4] }],
  ],
  [
    'filter[0].range runs low to high; 9 is above 4',
    [{ field: 'residue', range: [9, 4] }],
  ],
  [
    'filter[0].oneOf is a list of numbers, not []',
    [{ field: 'residue', oneOf: [] }],
  ],
  [
    'filter[0].oneOf is a list of strings, not ["A",2]',
    [{ field: 'chain', oneOf: ['A', 2] }],
  ],
  // the AND of a predicate's own tests, which would draw nothing at all
  [
    'filter[0] selects nothing: its bounds run from 200 to 100',
    [{ field: 'residue', gte: 200, lte: 100 }],
  ],
])('%s', (problem, filter) => {
  expect(filterProblems(filter)).toEqual([problem])
})

test('every problem of every structure is named, under the structure it is on', () => {
  expect(() =>
    checkedStructureFilters([
      { filter: [{ field: 'residue', lte: 184 }] },
      { filter: [{ field: 'chain', gt: 2 }, { field: 'residue' }] },
    ]),
  ).toThrow(
    'structures[1].filter[0].gt is refused: chain is a string, so it takes equal or oneOf; structures[1].filter[1] tests nothing',
  )
})

test('structures with no filter pass through', () => {
  const structures = [
    { url: 'a.cif' },
    { filter: [{ field: 'chain', equal: 'B' }] },
  ]
  expect(checkedStructureFilters(structures)).toBe(structures)
  expect(checkedStructureFilters(undefined)).toEqual([])
})
