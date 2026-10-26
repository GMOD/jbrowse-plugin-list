import { expect, test } from 'vitest'

import { cssScaleOf } from './colorScale'
import { resolvedColor } from './proteinColor'
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

test('an end from the data past the given end moves to one beyond it', () => {
  const values = [1, 2, 3]
  const painted = paintedColor(
    { field: 'values', values, domainMin: 10 },
    { domain: valueDomain(values) },
  )
  expect(painted).toMatchObject({ domainMin: 10, domainMax: 11 })
})

// values all 0 with domainMax 0 made a zero-width ramp, and its NaN position
// indexed no stop, so the header threw while drawing the key
test('a zero-width ramp paints its low color', () => {
  const values = [0, 0, 0, 0]
  const painted = resolvedColor(
    paintedColor(
      { field: 'values', values, domainMin: 0, domainMax: 0 },
      { domain: valueDomain(values) },
    ),
  )
  if (!painted) {
    throw new Error('a values color resolves to a scale')
  }
  const paint = cssScaleOf(painted)
  expect(paint(0)).toBe(paint(-5))
})
