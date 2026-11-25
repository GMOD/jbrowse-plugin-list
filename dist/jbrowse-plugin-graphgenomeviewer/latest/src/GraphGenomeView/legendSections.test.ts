import { COMPRESSED_KEY } from '@jbrowse/bandage-core/bubbleSpreads'
import { drawnMarks, graphKey } from '@jbrowse/bandage-core/graphKey'
import { LIFT_BACKDROP_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { walkLift } from '@jbrowse/bandage-core/walkHighlight'

import {
  facetKeyRows,
  legendSections,
  rowPitch,
  swatchHeight,
  swatchWidth,
  tubeMapRows,
  walkRowSwatch,
} from './legendSections'

import type { GraphPaneModel } from './model'
import type { GraphKeyOptions } from '@jbrowse/bandage-core/graphKey'
import type { Graph } from '@jbrowse/bandage-core/types'

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

// a drawing of nodes of more than one thickness, and plain links, and no
// other mark
const MARKS = {
  ...drawnMarks([]),
  plainNode: true,
  plainLink: true,
  widthsVary: true,
}

// A pane model holding bandage-core's key for `graph`, as model.graphKey
// builds it
function keyModel(
  graph: Graph,
  options: Partial<GraphKeyOptions> = {},
  layout: { compressed?: true } = {},
) {
  return {
    walkLift: undefined,
    bubbleHalos: [],
    pathLegend: [],
    tubeMapKeys: {},
    graphKey: graphKey(graph, layout, {
      marks: MARKS,
      ...options,
    }),
  } as unknown as GraphPaneModel
}

const node = (id: string, depth: number) => ({
  id,
  name: id,
  length: 10,
  depth,
})

const DEPTHS: Graph = {
  name: 'depths',
  nodes: [node('a', 1), node('b', 26)],
  edges: [{ from: 'a', to: 'b', pathIds: ['p', 'q'] }],
  paths: Array.from({ length: 26 }, (_, i) => ({
    name: `w${i}`,
    nodeIds: ['a'],
  })),
}

function rowsOf(model: GraphPaneModel, testid: string) {
  return legendSections(model).find(s => s.testid === testid)?.rows
}

// toLocaleString with no locale writes 1.000 for a German viewer
test("the ramp key's bp read the same in every locale", () => {
  const format = Number.prototype.toLocaleString
  const german = vi
    .spyOn(Number.prototype, 'toLocaleString')
    .mockImplementation(function (this: number, locales, options) {
      return format.call(this, locales ?? 'de-DE', options)
    })
  const model = keyModel(
    { name: 'empty', nodes: [], edges: [] },
    {
      referenceRamp: { start: 999.5, span: 122_457, midpoints: new Map() },
    },
  )
  const [ramp] = legendSections(model)
  german.mockRestore()
  expect(ramp!.rows[0]!.under).toBe('1,001-123,457 (122 kb)')
})

test("the legend draws bandage-core's key, each section under the plugin's testid", () => {
  const model = keyModel(DEPTHS, { edgeWidth: 'walks' }, { compressed: true })
  expect(rowsOf(model, 'graph-width-legend')!.map(r => r.label)).toEqual([
    '26 walks',
    '1 walk',
  ])
  expect(
    rowsOf(model, 'graph-width-legend')!.map(r => swatchHeight(r.swatch!)),
  ).toEqual(
    model.graphKey[0]!.entries.map(e =>
      e.swatch?.kind === 'width' ? e.swatch.px : 0,
    ),
  )
  expect(rowsOf(model, 'graph-link-width-legend')!.map(r => r.label)).toEqual([
    '2 walks',
    '1 walk',
  ])
  expect(rowsOf(model, 'graph-compressed-legend')!.map(r => r.label)).toEqual([
    COMPRESSED_KEY,
  ])
})

test('colour keys are square chips, unlike the thickness bars', () => {
  const model = keyModel(
    { name: 'off', nodes: [node('x', 1)], edges: [] },
    {
      referenceRamp: { start: 0, span: 1000, midpoints: new Map() },
      marks: { ...MARKS, offReference: true },
    },
  )
  const [ramp] = legendSections(model)
  const off = ramp!.rows.find(r => r.key === 'off')!.swatch!
  expect(swatchWidth(off)).toBe(swatchHeight(off))
})

test('a key of several groups heads each once, a key of one stays bare', () => {
  const both = legendSections(keyModel(DEPTHS, { edgeWidth: 'walks' }))
  expect(both.map(s => s.heading)).toEqual(['Node thickness', 'Link thickness'])
  const one = legendSections(keyModel(DEPTHS))
  expect(one.map(s => s.heading)).toEqual([undefined])
})

test('every row of a key shares one pitch, roomy enough for its tallest', () => {
  const rows = rowsOf(keyModel(DEPTHS), 'graph-width-legend')!
  for (const row of rows) {
    expect(rowPitch(rows)).toBeGreaterThanOrEqual(swatchHeight(row.swatch!) + 2)
  }
  expect(rowPitch([{ key: 'a', label: 'a' }])).toBe(15)
})

test("a lifted lane's heads are keyed with a swatch of the lane and its head", () => {
  const lift = walkLift(DEPTHS, [{ walk: 'w0' }])
  for (const haloed of [false, true]) {
    const rows = rowsOf(
      keyModel(DEPTHS, {
        lift,
        marks: { ...MARKS, headsAlong: true, headsHaloed: haloed },
      }),
      'graph-walk-readout',
    )!
    const heads = rows.find(r => r.key === 'lane-heads')!
    expect(heads.swatch).toMatchObject({
      kind: 'heads',
      heads: expect.stringMatching(haloed ? /^M[^M]+ZM[^M]+Z$/ : /^M[^M]+Z$/),
    })
    expect(swatchHeight(heads.swatch!)).toBeGreaterThan(0)
    expect(rowPitch(rows)).toBeGreaterThanOrEqual(swatchHeight(heads.swatch!))
  }
})

test("the key, and a faceted pane's key line, end with what the drawing folds and the bp it folds under", () => {
  const marks = {
    ...MARKS,
    foldedNodes: new Set(Array.from({ length: 38 }, (_, i) => `n${i}`)),
    foldedSkips: new Set([1, 2, 3, 4]),
    foldedUnderBp: 19,
  }
  const line = '38 nodes and 4 skips under 19 bp not drawn'
  const model = keyModel(DEPTHS, { marks })
  expect(
    legendSections(model)
      .at(-1)!
      .rows.map(r => r.label),
  ).toEqual([line])
  const faceted = Object.assign(keyModel(DEPTHS, { marks }), {
    facetPanels: [],
  })
  expect(facetKeyRows(faceted).map(r => r.label)).toContain(line)
  expect(
    legendSections(keyModel(DEPTHS)).flatMap(s => s.rows.map(r => r.label)),
  ).not.toContainEqual(expect.stringMatching(/not drawn/))
})

test("a walk row key's hollow bar keeps its rim round its fill", () => {
  expect(
    walkRowSwatch({
      kind: 'bar',
      fill: 'rgb(250, 240, 214)',
      rim: 'rgb(217, 164, 65)',
    }),
  ).toEqual({
    kind: 'fill',
    stops: [{ offset: 0, color: 'rgb(250, 240, 214)' }],
    height: expect.any(Number),
    rim: 'rgb(217, 164, 65)',
  })
  expect(walkRowSwatch({ kind: 'bar', fill: '#3c4148' })).not.toHaveProperty(
    'rim',
  )
})

test("a walk row key's swatch for a stretch walked against the reference carries the rows' chevrons", () => {
  expect(
    walkRowSwatch({ kind: 'bar', fill: '#9e9e9e', chevrons: true }),
  ).toMatchObject({ kind: 'fill', chevrons: true })
  expect(walkRowSwatch({ kind: 'bar', fill: '#3c4148' })).not.toHaveProperty(
    'chevrons',
  )
})

function stripLegend(over: Record<string, unknown>) {
  return rowsOf(
    Object.assign(keyModel(DEPTHS), {
      referenceStripShown: true,
      referenceStripFaded: true,
      liftedWalksLabel: 'these walks',
      ...over,
    }),
    'graph-reference-strip-legend',
  )
}

test('a strip of several walks keys its grey in the colour of a row that breaks', () => {
  const walk = (reference: boolean) => ({
    name: reference ? 'ref' : 'alt',
    reference,
    encoding: { field: 'walk', scheme: 'blues' },
    colors: new Map(),
    nodeIds: new Set(),
  })
  const rows = stripLegend({
    walkLift: { walks: [walk(true), walk(false)] },
    walkLabel: (name: string) => name,
    graph: undefined,
    referenceStripBlocks: [
      { colors: ['red', 'blue'] },
      { colors: ['red', LIFT_BACKDROP_CSS] },
    ],
  })
  expect(rows?.map(r => r.label)).toEqual([
    'reference each walk passes through',
    'grey where a walk does not pass through',
  ])
  const swatch = rows?.[1]?.swatch
  expect(
    swatch?.kind === 'bands' ? swatch.bands[0]?.map(s => s.color) : undefined,
  ).toEqual([
    'blue',
    'blue',
    LIFT_BACKDROP_CSS,
    LIFT_BACKDROP_CSS,
    'blue',
    'blue',
  ])
})

test('a strip with no walk lifted keys its grey as outside the open bubble', () => {
  const rows = stripLegend({
    effectiveColorScheme: 'depth',
    referenceStripBlocks: [{ colors: ['red'] }],
  })
  expect(rows?.map(r => r.label)).toEqual([
    'reference',
    'reference outside the open bubble',
  ])
})
