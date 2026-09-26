import { SimpleFeature } from '@jbrowse/core/util'
import JexlF from '@jbrowse/core/util/jexl'
import { expect, test } from 'vitest'

import { jexlBandColor, thresholdBandColor } from './wiggleBandColors'
import { PLDDT_BANDS, plddtColor } from '../../ProteinView/residueTracks'

const jexl = JexlF()

function evalColor(expression: string, score: number) {
  const feature = new SimpleFeature({
    uniqueId: 'f',
    refName: 'P1',
    start: 0,
    end: 1,
    score,
  })
  return jexl.eval(expression.replace(/^jexl:/, ''), { feature })
}

test('the v4 callback paints each pLDDT score the colour the strip does', () => {
  const expression = jexlBandColor('score', PLDDT_BANDS)
  for (const score of [10, 50, 50.01, 70, 80, 90, 95]) {
    expect(evalColor(expression, score)).toBe(plddtColor(score))
  }
})

test('the v4 callback survives being evaluated without a feature', () => {
  const expression = jexlBandColor('score', PLDDT_BANDS).replace(/^jexl:/, '')
  expect(jexl.eval(expression, {})).toBe('#cccccc')
})

test('the v5 threshold scale keeps each bound in its own band', () => {
  const { domain, range } = thresholdBandColor('score', PLDDT_BANDS)
  const color = (value: number) =>
    range[domain.filter(cut => value >= cut).length]
  for (const score of [10, 50, 50.01, 70, 80, 90, 95]) {
    expect(color(score)).toBe(plddtColor(score))
  }
})
