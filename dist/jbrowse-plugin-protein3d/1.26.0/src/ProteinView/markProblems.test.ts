import { expect, test } from 'vitest'

import { checkedLayers, distanceProblems, markProblems } from './markProblems'

test('a partner chain drawn as its own cartoon passes', () => {
  expect(
    markProblems(
      [
        {
          site: 'G:*',
          mark: 'cartoon',
          encoding: { color: { value: '#2e9e6b' } },
        },
        { site: 'A:1101', mark: 'spheres' },
      ],
      [{ chains: ['B'] }],
    ),
  ).toEqual([])
})

test('the spelling 1.24 read is migrated to the encoding spelling', () => {
  expect(
    checkedLayers(
      {
        marks: [{ site: 'A:220', style: 'sticks', color: '#d1007a' }],
        distances: [{ a: 'A:46', b: 'A:80', color: '#111111' }],
      },
      [{}],
    ),
  ).toEqual({
    marks: [
      {
        site: 'A:220',
        mark: 'sticks',
        encoding: { color: { value: '#d1007a' } },
      },
    ],
    distances: [
      { a: 'A:46', b: 'A:80', encoding: { color: { value: '#111111' } } },
    ],
  })
})

test('a color that is not a string is left for the check to name', () => {
  expect(markProblems([{ site: 'A:1', color: { value: '#d1007a' } }])).toEqual([
    "marks[0].color is now encoding: { color: { value: '#rrggbb' } }",
  ])
})

test('a site, mark or color that does not parse is named', () => {
  expect(
    markProblems([
      { site: 'not a site!', mark: { type: 'cartoon' } },
      { site: 'A:12', encoding: { color: { value: 'green' } } },
    ]),
  ).toEqual([
    'marks[0].site is a site such as A:248, A:248@NH2, MOV or G:*, not not a site!',
    'marks[0].mark is one of spheres, sticks, cartoon, not {"type":"cartoon"}',
    'marks[1].encoding.color.value is a #rrggbb color, not "green"',
  ])
})

test('a cartoon over a chain the structure already draws is refused', () => {
  const mark = { site: 'G:*', mark: 'cartoon' }
  const message =
    'marks[0] draws chain G as a cartoon over the one the structure draws; list the other chains in chains'
  expect(markProblems([mark], [{ chains: ['B', 'G'] }])).toEqual([message])
  expect(markProblems([mark], [{}])).toEqual([message])
  expect(markProblems([mark], [{ chains: ['B'] }])).toEqual([])
  // a filtered structure draws part of G, so a cartoon of the whole chain
  // adds the rest rather than covering it
  expect(
    markProblems(
      [mark],
      [{ chains: ['G'], filter: [{ field: 'residue', lte: 184 }] }],
    ),
  ).toEqual([])
})

test('checkedLayers throws every problem at once', () => {
  expect(() =>
    checkedLayers({
      marks: [{ site: 'A:1', style: 'balls' }],
      distances: [{ a: 'A:1', b: '??' }],
    }),
  ).toThrow(
    'marks[0].mark is one of spheres, sticks, cartoon, not "balls"; distances[0].b is a site such as A:248, A:248@NH2, MOV or G:*, not ??',
  )
})

test('a distance needs both sites', () => {
  expect(distanceProblems([{ a: 'A:46@NZ' }])).toEqual([
    'distances[0].b is a site such as A:248, A:248@NH2, MOV or G:*, not undefined',
  ])
})
