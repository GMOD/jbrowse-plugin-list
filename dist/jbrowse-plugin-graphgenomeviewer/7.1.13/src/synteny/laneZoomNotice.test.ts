import { keptStepsError } from '@jbrowse/graph-walks'

import { laneZoomFold, laneZoomNotice } from './laneZoomNotice.ts'

const BUDGET = 4_000_000

// A lane fetch over `fetchBp` keeping steps at a density whose fitting span
// is `fitsBp`, refused as @jbrowse/graph-walks refuses it
function refusal(fetchBp: number, fitsBp: number) {
  const kept = Math.round((BUDGET * fetchBp) / fitsBp)
  const fragment = { ids: new Int32Array(kept) }
  return keptStepsError(
    [fragment] as never,
    BUDGET,
    { start: 0, end: fetchBp },
    false,
  )
}

// On a 1,000 px canvas the display fetches the 800 px blocks the view touches:
// a 5 Mb view three 4 Mb blocks, a 500 kb view three 400 kb ones
test.each([
  ['5 Mb', 12_000_000, 7_290_000, '7.29Mbp', '1.7'],
  ['500 kb', 1_200_000, 762_000, '762Kbp', '1.6'],
])(
  'a %s view over the step budget is told how far to zoom in, not a span wider than it',
  (_, fetchBp, fitsBp, span, fold) => {
    const error = refusal(fetchBp, fitsBp)!
    expect(error.message).toBe(
      `Zoom in to about ${span}, or choose fewer haplotypes, to see the graph`,
    )
    expect(laneZoomNotice(error, fetchBp)).toMatchObject({
      name: 'NodeLimitError',
      message: `Zoom in about ${fold}×, or choose fewer haplotypes, to see lanes`,
    })
  },
)

test('the fold rounds up, to a tenth below 10 and a whole number above, and asks for at least 1.1', () => {
  expect(laneZoomFold(1_010, 1_000)).toBe(1.1)
  expect(laneZoomFold(1_100, 1_000)).toBe(1.1)
  expect(laneZoomFold(9_910, 1_000)).toBe(10)
  expect(laneZoomFold(32_100, 1_000)).toBe(33)
  expect(laneZoomFold(1_000, 1_200)).toBe(1.1)
})

test('a refusal naming no span keeps its message', () => {
  const error = Object.assign(new Error('Too many haplotype steps here'), {
    name: 'NodeLimitError',
    fitsBp: 1,
  })
  expect(laneZoomNotice(error, 1000)).toMatchObject({
    message: 'Too many haplotype steps here',
  })
})
