import { expect, test } from 'vitest'

import { thresholdBandColor } from './wiggleBandColors'
import { PLDDT_BANDS, plddtColor } from '../../ProteinView/residueTracks'

test('the threshold scale keeps each bound in its own band', () => {
  const { domain, range } = thresholdBandColor('score', PLDDT_BANDS)
  const color = (value: number) =>
    range[domain.filter(cut => value >= cut).length]
  for (const score of [10, 50, 50.01, 70, 80, 90, 95]) {
    expect(color(score)).toBe(plddtColor(score))
  }
})

test('the key names each band, not its nudged cut', () => {
  expect(thresholdBandColor('score', PLDDT_BANDS).labels).toEqual([
    'very low <50',
    'low 50-70',
    'confident 70-90',
    'very high >90',
  ])
})
