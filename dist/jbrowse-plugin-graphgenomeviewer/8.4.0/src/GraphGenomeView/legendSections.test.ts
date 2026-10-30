import {
  legendSections,
  rowPitch,
  swatchHeight,
  swatchWidth,
  tubeMapRows,
} from './legendSections'

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
    referenceRampDrawsOffReference: false,
    bubbleHalos: [],
    genePins: [],
    pathLegend: [],
    tubeMapKeys: {},
  }
  const [ramp] = legendSections(model as unknown as GraphPaneModel)
  german.mockRestore()
  expect(ramp!.rows[0]!.under).toBe('1,000-123,457 (122 kb)')
})

function widthModel(over: Record<string, unknown>) {
  return {
    walkLift: undefined,
    referenceRampDomain: undefined,
    bubbleHalos: [],
    genePins: [],
    pathLegend: [],
    tubeMapKeys: {},
    deletions: [],
    graph: {
      nodes: [{ depth: 1 }, { depth: 26 }],
      edges: [],
      paths: Array.from({ length: 26 }, () => ({})),
    },
    drawsNodes: true,
    walkRowBars: undefined,
    nodeWidth: 'depth',
    contigThickness: 6,
    depthRange: { min: 1, max: 26, mean: 8 },
    linkWidth: 'uniform',
    connectorThickness: 2,
    busiestLink: 26,
    ...over,
  } as unknown as GraphPaneModel
}

function widthLegend(
  over: Record<string, unknown>,
  testid = 'graph-width-legend',
) {
  return legendSections(widthModel(over)).find(s => s.testid === testid)?.rows
}

test('the width key names what node thickness counts, thickest first', () => {
  const rows = widthLegend({})!
  expect(rows.map(r => r.label)).toEqual(['26 walks', '8 walks', '1 walk'])
  const [thick, mean, thin] = rows.map(r => swatchHeight(r.swatch!))
  expect(mean).toBe(6)
  expect(thick).toBeGreaterThan(mean!)
  expect(thin).toBeLessThan(mean!)
})

test('a walk count reads whole, and a mean that rounds onto an end is dropped', () => {
  expect(
    widthLegend({ depthRange: { min: 1, max: 3, mean: 1.9 } })!.map(
      r => r.label,
    ),
  ).toEqual(['3 walks', '2 walks', '1 walk'])
  expect(
    widthLegend({ depthRange: { min: 1, max: 3, mean: 1.2 } })!.map(
      r => r.label,
    ),
  ).toEqual(['3 walks', '1 walk'])
})

test('a node a walk loops through keys passes, not walks', () => {
  const looped = { nodes: [], edges: [], paths: [{}, {}, {}] }
  expect(
    widthLegend({
      graph: looped,
      depthRange: { min: 1, max: 9, mean: 3 },
    })!.map(r => r.label),
  ).toEqual(['9 walk passes', '3 walk passes', '1 walk pass'])
})

test('colour keys are square chips, unlike the thickness bars', () => {
  const model = {
    walkLift: undefined,
    graph: undefined,
    referenceRampDomain: { start: 0, end: 1000 },
    referenceRampDrawsOffReference: true,
    bubbleHalos: [],
    genePins: [],
    pathLegend: [],
    tubeMapKeys: {},
  }
  const [ramp] = legendSections(model as unknown as GraphPaneModel)
  const off = ramp!.rows.find(r => r.key === 'off')!.swatch!
  expect(swatchWidth(off)).toBe(swatchHeight(off))
})

test('a frequency width keys shares of haplotypes, or AF where tagged', () => {
  expect(widthLegend({ nodeWidth: 'frequency' })!.map(r => r.label)).toEqual([
    '100% of haplotypes',
    '50% of haplotypes',
    '10% of haplotypes',
  ])
  const tagged = { nodes: [{ depth: 1, frequency: 0.4 }], edges: [] }
  expect(
    widthLegend({ nodeWidth: 'frequency', graph: tagged })![0]!.label,
  ).toBe('AF 100%')
})

test('uniform widths, or one depth everywhere, draw no width key', () => {
  expect(widthLegend({ nodeWidth: 'uniform' })).toBeUndefined()
  expect(
    widthLegend({ depthRange: { min: 3, max: 3, mean: 3 } }),
  ).toBeUndefined()
})

test('links by walks key the busiest link and a single walk', () => {
  const rows = widthLegend(
    { nodeWidth: 'uniform', linkWidth: 'walks' },
    'graph-link-width-legend',
  )!
  expect(rows.map(r => r.label)).toEqual(['26 walks', '1 walk'])
})

test('a key of several groups heads each once, a key of one stays bare', () => {
  const both = legendSections(widthModel({ linkWidth: 'walks' }))
  expect(both.map(s => s.heading)).toEqual(['Node thickness', 'Link thickness'])
  const one = legendSections(widthModel({}))
  expect(one.map(s => s.heading)).toEqual([undefined])
})

test('every row of a key shares one pitch, roomy enough for its tallest', () => {
  const rows = widthLegend({})!
  for (const row of rows) {
    expect(rowPitch(rows)).toBeGreaterThanOrEqual(swatchHeight(row.swatch!) + 2)
  }
  expect(rowPitch([{ key: 'a', label: 'a' }])).toBe(15)
})
