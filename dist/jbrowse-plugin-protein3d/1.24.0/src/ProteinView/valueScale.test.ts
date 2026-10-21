import { expect, test } from 'vitest'

import { paintedColor, valueDomain } from './valueScale'

test('the domain trims the extremes of a long list of scores', () => {
  const values = [-20, ...Array.from({ length: 98 }, (_, i) => i / 10), 500]
  expect(valueDomain(values)).toEqual({ min: 0, max: 9.7 })
})

test('a short list keeps its whole range', () => {
  expect(valueDomain([3, -1, 2])).toEqual({ min: -1, max: 3 })
})

test('equal scores still span a ramp', () => {
  expect(valueDomain([2, 2])).toEqual({ min: 2, max: 3 })
})

test('no scores have no domain', () => {
  expect(valueDomain([])).toBeUndefined()
  expect(valueDomain([Number.NaN])).toBeUndefined()
})

test('a linear track fills the ends the session leaves out, and its title', () => {
  const domain = { min: -2, max: 8 }
  expect(
    paintedColor({ field: 'track', trackId: 't' }, { domain, label: 'phyloP' }),
  ).toEqual({
    field: 'track',
    trackId: 't',
    domainMin: -2,
    domainMax: 8,
    title: 'phyloP',
  })
  expect(
    paintedColor(
      { field: 'track', trackId: 't', domainMin: 0, title: 'mine' },
      { domain, label: 'phyloP' },
    ),
  ).toMatchObject({ domainMin: 0, domainMax: 8, title: 'mine' })
})

test('a threshold track takes only the title from the data', () => {
  const color = {
    field: 'track',
    trackId: 't',
    scale: 'threshold',
    domain: [1],
  } as const
  const painted = paintedColor(color, {
    domain: { min: 0, max: 9 },
    label: 'SGE',
  })
  expect(painted).toEqual({ ...color, title: 'SGE' })
})

test('a field that is not a value field passes through', () => {
  const color = { field: 'alphaMissense' } as const
  expect(paintedColor(color, { domain: { min: 0, max: 1 } })).toBe(color)
})
