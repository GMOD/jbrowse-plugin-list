import { expect, test } from 'vitest'

import { checkResidueQuery, parseResidueQuery } from './residueQuery'

import type { Entity } from 'p2s_mapper'

// a construct whose label ids run 1..4, numbered by its authors from 247
const CONSTRUCT: Entity = {
  entityId: '1',
  seq: 'MRKA',
  seqIds: [1, 2, 3, 4],
  authSeqIds: [247, 248, 249, 250],
  chains: ['A', 'B'],
}

function problemOf(text: string) {
  const checked = checkResidueQuery(text, CONSTRUCT)
  return 'problem' in checked ? checked.problem : undefined
}

test('reads a residue, a lettered residue, a chain and a range', () => {
  expect(parseResidueQuery(' 248 ')).toEqual({
    chain: undefined,
    start: { letter: undefined, number: 248 },
    end: { letter: undefined, number: 248 },
  })
  expect(parseResidueQuery('r248')).toMatchObject({
    start: { letter: 'R', number: 248 },
  })
  expect(parseResidueQuery('A:248')).toMatchObject({ chain: 'A' })
  expect(parseResidueQuery('A: 248')).toMatchObject({
    chain: 'A',
    start: { number: 248 },
  })
  expect(parseResidueQuery('A:R248 - K249')).toEqual({
    chain: 'A',
    start: { letter: 'R', number: 248 },
    end: { letter: 'K', number: 249 },
  })
  expect(parseResidueQuery('-3--1')).toMatchObject({
    start: { number: -3 },
    end: { number: -1 },
  })
})

test('reads nothing from text that names no residue', () => {
  expect(parseResidueQuery('')).toBeUndefined()
  expect(parseResidueQuery('Arg248')).toBeUndefined()
  expect(parseResidueQuery('248-')).toBeUndefined()
  expect(parseResidueQuery('82A')).toBeUndefined()
})

test('a residue the mapped entity holds comes back as its query', () => {
  expect(checkResidueQuery('B:R248-A250', CONSTRUCT)).toEqual({
    query: {
      chain: 'B',
      start: { letter: 'R', number: 248 },
      end: { letter: 'A', number: 250 },
    },
  })
  expect(problemOf('248')).toBeUndefined()
  expect(problemOf('240-248')).toBeUndefined()
})

test('names what is wrong with a residue the entity does not hold', () => {
  expect(problemOf('Arg248')).toBe(
    'Type a residue number such as 248, R248, A:248 or 245-250',
  )
  expect(checkResidueQuery('248', undefined)).toEqual({
    problem: 'The structure has not loaded',
  })
  expect(problemOf('250-248')).toBe('250-248 ends before it starts')
  expect(problemOf('C:248')).toBe(
    'Chain C is not a chain of the mapped entity (A, B)',
  )
  expect(problemOf('H175')).toBe('No residue numbered H175 in this structure')
  expect(problemOf('H248')).toBe('Residue 248 is R248, not H248')
})

// 1A0Q-style numbering puts 82A between 82 and 83
test('an insertion code is refused by name rather than misread', () => {
  const unsupported =
    'Insertion codes such as 82A are not supported; type the number alone'
  expect(problemOf('82A')).toBe(unsupported)
  expect(problemOf('1A: 82A')).toBe(unsupported)
  expect(problemOf('80-82A')).toBe(unsupported)
  expect(problemOf('1A:248')).toBe(
    'Chain 1A is not a chain of the mapped entity (A, B)',
  )
})
