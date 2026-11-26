import { readFileSync } from 'node:fs'

import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import { nodeInk } from '@jbrowse/bandage-core/nodeWidths'
import { getSnapshot } from '@jbrowse/mobx-state-tree'

import { mockRpcCall } from './modelTestMocks'
import {
  createAnchoredModel,
  createModel,
  fakeRenderer,
} from './modelTestSupport'
import stateModelFactory from './viewModel'

import type { GraphLayers } from './graphLayers'
import type { GraphPaneModel } from './model'
import type { MenuItem } from './modelTestSupport'
import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

const GAP571 = readFileSync(
  require.resolve('../../test_data/hprc2/hprc_gap571.gfa'),
  'utf8',
)

// chr1:27,851,829-27,856,000 laid out by the reference, with node lengths
// written, as the canvas draws it at the fit
async function drawnGap571(layers: GraphLayers = { lengths: true }) {
  mockRpcCall.mockImplementation(
    (_session: unknown, method: string, request: EngineRequest) =>
      method === 'GraphComputeLayout'
        ? layoutEngine(request)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = createAnchoredModel({ layers })
  model.setWidth(1200)
  await model.loadGFA(GAP571, 'gap571')
  model.setLegendSize({ width: 150, height: 60 })
  model.zoomToFit()
  draw(model)
  return model
}

// the batch the canvas holds
function draw(model: GraphPaneModel) {
  const { batch, view } = model.buildDrawing(undefined, false)!
  model.setGeometryMetrics(0, batch, view)
}

// A reference of two 5 kb nodes, and between them two stretches the cut did
// not load, each walked by a haplotype: one of 2 bp and one of 400 bp. A
// not-loaded stretch is drawn at the layout's least length whatever its bp,
// so the fold measures it by its bp at the reference's px a bp, about 0.09
// at the force layout's fit: 0.2 px for the 2 bp stretch, under the line,
// and 38 px for the 400 bp one. Each states its length on the drawing.
const PLACEHOLDERS = [
  'S\tr1\t*\tLN:i:5000',
  'S\tr2\t*\tLN:i:5000',
  'S\tsmall\t*\tLN:i:2\tnl:i:1',
  'S\tlarge\t*\tLN:i:400\tnl:i:1',
  'L\tr1\t+\tr2\t+\t0M',
  'L\tr1\t+\tsmall\t+\t0M',
  'L\tsmall\t+\tr2\t+\t0M',
  'L\tr1\t+\tlarge\t+\t0M',
  'L\tlarge\t+\tr2\t+\t0M',
  'W\tGRCh38\t0\tchr1\t0\t10000\t>r1>r2',
  'W\tA\t1\tctg\t0\t5002\t>r1>small>r2',
  'W\tB\t1\tctg\t0\t5400\t>r1>large>r2',
  '',
].join('\n')

async function drawnPlaceholders() {
  mockRpcCall.mockImplementation(
    (_session: unknown, method: string, request: EngineRequest) =>
      method === 'GraphComputeLayout'
        ? layoutEngine(request)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = createModel()
  model.setWidth(1200)
  await model.loadGFA(PLACEHOLDERS, 'placeholders')
  model.setLegendSize({ width: 150, height: 60 })
  model.zoomToFit()
  draw(model)
  return model
}

test('the labels are laid out without the nodes the drawing on the canvas folds', async () => {
  const model = await drawnPlaceholders()
  model.setLayer('lengths', true)
  expect([...model.folded]).toEqual(['small+'])
  // the reference's nodes carry no length
  expect(model.overlayLabels.sizes.map(l => [l.node, l.text])).toEqual([
    ['large+', '400 bp'],
  ])
})

// a halo along nothing drawn, or along reference the fold draws as one even
// stroke, marks a site the drawing leaves out
function haloOnFold(model: GraphPaneModel) {
  const fold = model.drawnFold
  return (halo: { nodeIds: string[] }) =>
    halo.nodeIds.some(id => fold?.nodes.has(id)) ||
    halo.nodeIds.every(id => fold?.within.has(id))
}

test('a bubble is ringed along its drawn nodes, and not at all where the drawing folds it whole, until a zoom draws it again', async () => {
  const model = await drawnGap571({ bubbles: true })
  const onFold = haloOnFold(model)
  expect(model.drawnFold?.sites.length).toBeGreaterThan(0)
  expect(model.bubbleHalos.filter(onFold)).toEqual([])
  expect(model.overlayLabels.ticks.map(t => t.item).filter(onFold)).toEqual([])
  expect(model.bubbleHalos.length).toBeLessThan(model.bubbles.length)
  while (model.drawnFold?.sites.length) {
    model.zoom(2, 600, 200)
    draw(model)
  }
  expect(model.bubbleHalos).toHaveLength(model.bubbles.length)
})

test('a node the drawing folds is not lit as selected, nor ringed from the walk strip', async () => {
  const model = await drawnPlaceholders()
  const folded = 'small+'
  const drawn = 'large+'
  expect(model.folded.has(folded)).toBe(true)
  expect(model.folded.has(drawn)).toBe(false)
  const highlights = vi.fn()
  const renderer = { ...fakeRenderer(), setNodeHighlights: highlights }
  model.setSelectedNode(folded)
  model.applySelection(renderer)
  expect(highlights).toHaveBeenLastCalledWith(new Map())
  model.setSelectedNode(drawn)
  model.applySelection(renderer)
  expect([...highlights.mock.lastCall![0].keys()]).toEqual([drawn])
  model.setStripHover({ row: 'GRCh38', offset: 0 })
  model.setHoveredNode(folded)
  expect(model.walkStripLocator).toBeUndefined()
  model.setHoveredNode(drawn)
  expect(model.walkStripLocator).toBeDefined()
})

test('a node inside a run of folded sites is hit and outlined as wide as the run draws it', async () => {
  const model = await drawnGap571()
  const through = [...model.drawnFold!.through.keys()]
  const own = nodeInk(
    model.drawnGraph,
    model.nodeById,
    model.contigThickness,
    model.nodeWidth,
  )
  const widened = through.filter(
    id => model.nodeInk.halfWidthPx(id) !== own.halfWidthPx(id),
  )
  expect(widened.length).toBeGreaterThan(0)
  const drawn = nodeInk(
    model.drawnGraph,
    model.nodeById,
    model.contigThickness,
    model.nodeWidth,
    0,
    model.drawnFold!.through,
  )
  for (const id of through) {
    expect(model.nodeInk.halfWidthPx(id)).toBe(drawn.halfWidthPx(id))
  }
})

test('Show small sites is off by default; turned on, it draws every node and keys as not drawn only the skips too short on screen to arch, on screen and in the SVG, and is saved with the session', async () => {
  const model = await drawnGap571()
  const item = () =>
    (model.showMenuItems() as MenuItem[]).find(
      i => i.label === 'Show small sites',
    )!
  expect(item().checked).toBe(false)
  expect(model.drawnFold?.sites.length).toBeGreaterThan(0)
  expect(model.graphKey.map(s => s.id)).toContain('too-small')
  expect(model.figure()).toMatch(/under \d+ bp not drawn/)
  item().onClick!()
  draw(model)
  expect(item().checked).toBe(true)
  expect(model.drawnFold?.sites).toEqual([])
  expect(
    model.graphKey.find(s => s.id === 'too-small')?.entries.map(e => e.text),
  ).toEqual(['2 skips under 3 bp not drawn'])
  expect(model.figure()).toMatch(/2 skips under 3 bp not drawn/)
  expect(model.figure()).not.toMatch(/nodes? (and \d+ skips? )?under/)
  const snapshot = getSnapshot(model)
  expect(snapshot.layers).toEqual({ lengths: true, smallSites: true })
  expect(stateModelFactory().create(snapshot).smallSites).toBe('nodes')
})

// BandageJS's chrM:8,000-8,300: a skip drawn at one fit was too short to
// draw at the next, and a key column that followed the key back and forth
// re-fitted the drawing without end
test('while fitted, a key that shrinks keeps the column and the floor its fit was made beside; once the user moves the view, they follow it', async () => {
  const model = await drawnGap571()
  expect(model.viewportOwner).toBe('fit')
  model.setLegendSize({ width: 300, height: 400 })
  const column = model.keyColumnPx
  const floor = model.canvasFloor
  model.setLegendSize({ width: 150, height: 60 })
  expect(model.keyColumnPx).toBe(column)
  expect(model.canvasFloor).toBe(floor)
  model.setLegendSize({ width: 320, height: 420 })
  expect(model.keyColumnPx).toBeGreaterThan(column)
  model.setTransform(model.scaleX * 2, model.translateX, model.translateY)
  expect(model.viewportOwner).not.toBe('fit')
  model.setLegendSize({ width: 150, height: 60 })
  expect(model.keyColumnPx).toBeLessThan(column)
})
