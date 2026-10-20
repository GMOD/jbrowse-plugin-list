import { expect, test } from 'vitest'

import { cssScaleOf, keyEntriesOf, rampKeyOf, rgbScaleOf } from './colorScale'
import { RESIDUE_COLORS } from './residueColors'

test("pLDDT's bands put a score on a cut in the band above it", () => {
  const plddt = cssScaleOf(RESIDUE_COLORS.plddt)
  expect([30, 49.99, 50, 60, 70, 80, 90, 95].map(plddt)).toEqual([
    '#ff7d45',
    '#ff7d45',
    '#ffdb13',
    '#ffdb13',
    '#65cbf3',
    '#65cbf3',
    '#0053d6',
    '#0053d6',
  ])
  expect(plddt(undefined)).toBeUndefined()
  expect(keyEntriesOf(RESIDUE_COLORS.plddt).map(e => e.label)).toEqual([
    'very low <50',
    'low 50-70',
    'confident 70-90',
    'very high >90',
  ])
})

test('hydrophobicity diverges from near-white at zero, clamped at its ends', () => {
  const hydrophobicity = cssScaleOf(RESIDUE_COLORS.hydrophobicity)
  expect(hydrophobicity(-4.5)).toBe('rgb(51, 102, 204)')
  expect(hydrophobicity(0)).toBe('rgb(247, 247, 247)')
  expect(hydrophobicity(4.5)).toBe('rgb(230, 140, 40)')
  expect(hydrophobicity(-100)).toBe('rgb(51, 102, 204)')
  expect(hydrophobicity(100)).toBe('rgb(230, 140, 40)')
  expect(rampKeyOf(RESIDUE_COLORS.hydrophobicity)).toEqual({
    minLabel: 'Hydrophilic',
    maxLabel: 'Hydrophobic',
    colors: ['rgb(51, 102, 204)', 'rgb(247, 247, 247)', 'rgb(230, 140, 40)'],
  })
})

test('AlphaMissense runs blue through white at 0.5 to red', () => {
  const alphaMissense = rgbScaleOf(RESIDUE_COLORS.alphaMissense)
  expect(alphaMissense(0)).toEqual([0x2c, 0x7b, 0xb6])
  expect(alphaMissense(0.5)).toEqual([255, 255, 255])
  expect(alphaMissense(1)).toEqual([0xd7, 0x19, 0x1c])
  expect(alphaMissense(0.75)).toEqual([235, 140, 142])
  expect(alphaMissense(-1)).toEqual(alphaMissense(0))
  expect(alphaMissense(2)).toEqual(alphaMissense(1))
})

// The middle stop sits at domainMid and the farther end reaches its color, so
// equal distances from the middle take equal depths of color
test('an off-center domainMid keeps both sides on one scale', () => {
  const ramp = rgbScaleOf({
    field: 'x',
    scale: 'linear',
    domainMin: -1,
    domainMax: 3,
    domainMid: 0,
    range: ['#0000ff', '#ffffff', '#ff0000'],
  })
  expect(ramp(0)).toEqual([255, 255, 255])
  expect(ramp(3)).toEqual([255, 0, 0])
  expect(ramp(1.5)).toEqual([255, 128, 128])
  expect(ramp(-1)).toEqual([170, 170, 255])
})

test('the ClinVar count darkens per substitution and caps at four', () => {
  const clinvar = cssScaleOf(RESIDUE_COLORS.clinvarPathogenicCount)
  const steps = [0, 1, 2, 3, 4].map(clinvar)
  expect(steps).toEqual(RESIDUE_COLORS.clinvarPathogenicCount.range)
  expect(clinvar(9)).toBe(clinvar(4))
  expect(
    keyEntriesOf(RESIDUE_COLORS.clinvarPathogenicCount).map(e => e.label),
  ).toEqual(['0', '1', '2', '3', '4 or more'])
})
