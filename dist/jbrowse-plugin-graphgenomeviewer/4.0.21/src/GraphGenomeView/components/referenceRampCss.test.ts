import { rampHue, rampStops } from './referenceRampCss'

const domain = { start: 1000, end: 2000 }

test('the hue runs 0 to 300 across the domain and holds past its ends', () => {
  expect(rampHue(1000, domain)).toBe(0)
  expect(rampHue(1500, domain)).toBe(150)
  expect(rampHue(2000, domain)).toBe(300)
  expect(rampHue(0, domain)).toBe(0)
  expect(rampHue(9000, domain)).toBe(300)
})

test('a span under a degree of hue reads as one flat hue', () => {
  expect(rampStops({ start: 1500, bp: 2 }, domain)).toEqual([150.3])
})

test('stops step at most 30 degrees, from the far end when reversed', () => {
  const forward = rampStops({ start: 1000, bp: 500 }, domain)
  expect(forward).toEqual([0, 30, 60, 90, 120, 150])
  expect(rampStops({ start: 1000, bp: 500, reversed: true }, domain)).toEqual(
    [...forward].reverse(),
  )
})

test('a span reaching past the domain holds its last hue there', () => {
  expect(rampStops({ start: 1800, bp: 400 }, domain)).toEqual([240, 300, 300])
})
