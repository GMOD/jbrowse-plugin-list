import { legendSections, tubeMapRows } from './legendSections'

import type { GraphPaneModel } from './model'

function labels(readsShown: { shown: number; total: number } | undefined) {
  const model = {
    tubeMapKeys: {
      logWidths: false,
      foldBp: undefined,
      forwardReads: true,
      reverseReads: false,
      substitution: false,
      insertion: false,
      deletion: false,
    },
    readsShown,
  }
  return tubeMapRows(model as unknown as GraphPaneModel).map(r => r.label)
}

test('a sampled read set says how many of its reads are drawn', () => {
  expect(labels({ shown: 5000, total: 12_345 })).toContain(
    '5,000 of 12,345 reads shown',
  )
})

test('a read set drawn whole says nothing of its count', () => {
  expect(labels({ shown: 40, total: 40 }).join()).not.toMatch(/reads shown/)
})

// toLocaleString with no locale writes 1.000 for a German viewer
test("the ramp key's bp read the same in every locale", () => {
  const format = Number.prototype.toLocaleString
  const german = vi
    .spyOn(Number.prototype, 'toLocaleString')
    .mockImplementation(function (this: number, locales, options) {
      return format.call(this, locales ?? 'de-DE', options)
    })
  const model = {
    walkLift: undefined,
    referenceRampDomain: { start: 999.5, end: 123_456.5 },
    referenceRampOffKeys: { offReference: false, unplaced: false },
    bubbleHalos: [],
    genePins: [],
    pathLegend: [],
    tubeMapKeys: {},
  }
  const [ramp] = legendSections(model as unknown as GraphPaneModel)
  german.mockRestore()
  expect(ramp!.rows[0]!.label).toBe('1,000-123,457 (122 kb)')
})
