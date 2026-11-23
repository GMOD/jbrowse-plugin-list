import { MAX_PATH_COLORS } from '@jbrowse/bandage-core/pathColors'
import { types } from '@jbrowse/mobx-state-tree'
import { reaction } from 'mobx'

import stateModelFactory from './viewModel'

import type {
  RenderBatch,
  Renderer,
} from '@jbrowse/bandage-core/renderer/types'

const mockRpcCall = vi.fn()
const mockSession = {
  assemblyManager: { has: () => false, get: () => undefined },
  tracks: [] as { trackId: string; [key: string]: unknown }[],
  rpcManager: { call: mockRpcCall },
  assemblyNames: [] as string[],
  views: [] as unknown[],
  addView() {
    return { id: 'view-1' }
  },
}

vi.mock('@jbrowse/core/util', () => ({
  getSession: () => mockSession,
  getContainingView: () => {
    throw new Error('no containing view found')
  },
  getContainingTrack: () => {
    throw new Error('not in a track')
  },
  getRpcSessionId: () => 'test',
  isSessionModelWithWidgets: () => false,
  parseLocString: () => ({}),
  getEnv: () => ({}),
  useWidthSetter: () => {},
  measureText: () => 0,
  IntervalTree: class {},
  getSnapshot: () => ({}),
  applySnapshot: () => {},
  objectHash: () => '',
}))

// Partial, not wholesale: core modules pulled in transitively (BaseFeatureWidget's
// config schema) call ConfigurationSchema at module-eval time.
vi.mock(import('@jbrowse/core/configuration'), async importOriginal => ({
  ...(await importOriginal()),
  readConfObject: vi.fn(),
}))

const GFA = 'H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGGCC\nL\t1\t+\t2\t+\t0M\n'

// A layout whose extent dwarfs the pane, which is what every real force layout
// produces: bandageAutoScale sizes a drawing in tens of thousands of FMMM units
// and zoom-to-fit is what brings it on screen.
const WIDE_LAYOUT = {
  nodePositions: {
    '1+': [
      { x: 0, y: 0 },
      { x: 40000, y: 0 },
    ],
    '1-': [
      { x: 0, y: 30000 },
      { x: 40000, y: 30000 },
    ],
    '2+': [
      { x: 50000, y: 0 },
      { x: 90000, y: 0 },
    ],
    '2-': [
      { x: 50000, y: 30000 },
      { x: 90000, y: 30000 },
    ],
  },
}

function fakeRenderer(uploads: RenderBatch[]) {
  const renderer: Renderer = {
    resize: () => {},
    uploadGeometry: (batch: RenderBatch) => {
      uploads.push(batch)
    },
    updateTransform: () => {},
    render: () => {},
    setNodeHighlights: () => {},
    setEdgeHighlight: () => {},
    destroy: () => {},
  } as unknown as Renderer
  return renderer
}

// Regression: a graph whose layout is much larger than the pane drew a blank
// canvas on the whole-file import path. buildGeometry culls to a viewport
// derived from the *current* transform, read untracked, so the build that runs
// before zoom-to-fit lands sees a pane-sized window of a 90,000-unit drawing
// and discards every node. Whether anything rebuilt afterwards decided whether
// the user saw the graph or an empty white pane, and on the 4,749-node HPRC
// chrM pggb graph they saw the pane.
test('a layout larger than the pane still uploads geometry', async () => {
  mockRpcCall.mockImplementation((_id: string, method: string) =>
    method === 'GraphComputeLayout'
      ? Promise.resolve({ result: WIDE_LAYOUT, duration: 5 })
      : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = stateModelFactory().create({ type: 'GraphGenomeView' })
  const uploads: RenderBatch[] = []
  // The mount order the app actually has: the canvas is rendered only once
  // `hasGraph` is true, so the graph and its layout exist *before* any autorun
  // is installed, and the width lands after the canvas is measured.
  await model.loadGFA(GFA, 'wide')
  model.startRenderingBackend(fakeRenderer(uploads))
  model.setWidth(1000)
  // past the pan/zoom debounce, so any rebuild it would have scheduled has run
  await new Promise(resolve => setTimeout(resolve, 400))

  expect(uploads.length).toBeGreaterThan(0)
  expect(uploads.at(-1)!.nodeStrokes.length).toBeGreaterThan(0)
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function drawnModel() {
  mockRpcCall.mockImplementation((_id: string, method: string) =>
    method === 'GraphComputeLayout'
      ? Promise.resolve({ result: WIDE_LAYOUT, duration: 5 })
      : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  // attached, so afterAttach settles the build window as the app's does
  const model = types
    .model({ view: stateModelFactory() })
    .create({ view: { type: 'GraphGenomeView' } }).view
  await model.loadGFA(GFA, 'wide')
  model.startRenderingBackend(fakeRenderer([]))
  model.setWidth(1000)
  // past the zoom-to-fit autorun and the pan/zoom debounce, so the transform
  // has stopped moving on its own before a test moves it
  await sleep(400)
  return model
}

// jbrowse-components' `installClearHoverOnViewportChange` rule, on this view's
// own three axes. A hover is set by a mousemove; a wheel zoom, a toolbar zoom
// and a pan all move the drawing under a stationary cursor and fire no pointer
// event, so without this the tooltip goes on naming a node that has moved away
// and `hoverHighlight` goes on publishing its span to the paired linear view.
test('a zoom drops a hover the pointer can no longer be over', async () => {
  const model = await drawnModel()
  model.setHover('everything')
  model.setHoveredNode('1+')
  model.setHoveredEdge(0)
  expect(model.hoveredEdge).toBe(0)
  model.setSelectedNode('1+')

  model.zoom(1.5, 100, 100)

  expect(model.hoveredNode).toBeNull()
  expect(model.hoveredEdge).toBeNull()
  // A click is a choice, and the content moving does not unmake it.
  expect(model.selectedNode).toBe('1+')
})

test('a pan drops it too, and the tube or walk row under the pointer', async () => {
  const model = await drawnModel()
  model.setHoveredNode('1+')
  model.setHoveredTube({ track: 1 })
  model.setHoveredWalkRow('A#1#ctg')
  model.setTransform(model.scale, model.translateX + 40, model.translateY)
  expect(model.hoveredNode).toBeNull()
  expect(model.hoveredTube).toBeNull()
  expect(model.hoveredWalkRow).toBeNull()
})

// The two signals name different events and are read by different consumers:
// `buildView` moves when the window onto the drawing leaves what was built,
// `positionsVersion` when the drawing itself does. Conflating them rebuilt a
// 12k-edge hit index on the first mousemove after every pan, for an index that
// is in layout units and had not changed.
test('a pan past the built window moves the build window and a node drag moves the positions one', async () => {
  const model = await drawnModel()
  // zoomed in, so a pan of several panes still leaves the drawing on screen
  model.zoom(8, model.width / 2, 0)
  await sleep(300)
  const view = model.buildView
  const positions = model.positionsVersion

  model.setTransform(model.scale, model.translateX - 3 * model.width, 0)
  await sleep(300)
  expect(model.buildView).not.toBe(view)
  expect(model.positionsVersion).toBe(positions)

  model.moveNode('1+', 10, 10)
  await sleep(100)
  expect(model.positionsVersion).toBe(positions + 1)
})

// A zoom held over several debounce periods rebuilds once, when it rests: each
// step restarts the wait, so the geometry is not rebuilt under a moving gesture
test('a long zoom rebuilds once it rests, not while it moves', async () => {
  const model = await drawnModel()
  const before = model.builtViewport
  for (let step = 0; step < 20; step++) {
    model.zoom(1.05, 100, 100)
    await sleep(50)
  }
  expect(model.builtViewport).toBe(before)
  await sleep(400)
  expect(model.builtViewport).not.toBe(before)
  expect(model.buildViewSettled).toBe(true)
})

// A build covers a pane on every side of the one shown, so an ordinary pan is
// a repaint of strokes already uploaded: no debounce, no blank margin, no
// rebuild. A zoom changes what the strokes are and rebuilds however small.
test('a pan inside the built window rebuilds nothing, a zoom always does', async () => {
  const model = await drawnModel()
  const view = model.buildView

  model.setTransform(model.scale, model.translateX + 40, model.translateY + 40)
  await sleep(300)
  expect(model.buildView).toBe(view)

  model.zoom(1.01, 100, 100)
  await sleep(300)
  expect(model.buildView).not.toBe(view)
})

// The three consumers of a path colour disagreed about how many paths is too
// many: only the node stripes stopped. A Minigraph-Cactus cut writes one W
// record per haplotype and walks every backbone link with all of them, so the
// two that did not stop drew a stroke per path per edge — measured at 99,800
// strokes and 64 ms of geometry for 200 paths over 499 links — under a key
// hundreds of rows tall, naming stripes that were not drawn.
function pathGFA(count: number) {
  const paths = Array.from(
    { length: count },
    (_, i) => `P\tHG${i}#1#chr\t1+,2+\t*`,
  ).join('\n')
  return `H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGGCC\nL\t1\t+\t2\t+\t0M\n${paths}\n`
}

async function pathModel(count: number) {
  mockRpcCall.mockImplementation((_id: string, method: string) =>
    method === 'GraphComputeLayout'
      ? Promise.resolve({ result: WIDE_LAYOUT, duration: 5 })
      : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = stateModelFactory().create({ type: 'GraphGenomeView' })
  await model.loadGFA(pathGFA(count), 'paths')
  model.setLayer('paths', true)
  return model
}

test('at the colour cap the paths are drawn and named', async () => {
  const model = await pathModel(MAX_PATH_COLORS)
  expect(model.pathCount).toBe(MAX_PATH_COLORS)
  expect(model.effectiveDrawPaths).toBe(true)
  expect(model.pathLegend).toHaveLength(MAX_PATH_COLORS)
})

test('past it the whole of drawPaths resolves off, key included', async () => {
  const model = await pathModel(MAX_PATH_COLORS + 1)
  expect(model.pathCount).toBe(MAX_PATH_COLORS + 1)
  // the switch keeps the user's choice; what the drawing does with it is here
  expect(model.drawPaths).toBe(true)
  expect(model.effectiveDrawPaths).toBe(false)
  expect(model.pathLegend).toEqual([])
})

// The fit settles the build window in its own action, so the upload never
// builds the window the fit left; and the canvas is sized by the paint, so a
// key measured after the build grows the pane without building again
const WALKED_GFA = `${GFA}W\tGRCh38\t0\tchr1\t0\t8\t>1>2\nW\tA\t1\tctg\t0\t8\t>1>2\n`

async function countedModel() {
  mockRpcCall.mockImplementation((_id: string, method: string) =>
    method === 'GraphComputeLayout'
      ? Promise.resolve({ result: WIDE_LAYOUT, duration: 5 })
      : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const uploads: RenderBatch[] = []
  const model = types
    .model({ view: stateModelFactory() })
    .create({ view: { type: 'GraphGenomeView' } }).view
  model.setWidth(1000)
  await model.loadGFA(WALKED_GFA, 'wide')
  model.startRenderingBackend(fakeRenderer(uploads))
  await sleep(400)
  return { model, uploads }
}

test('a first draw builds the drawing once', async () => {
  const { uploads } = await countedModel()
  expect(uploads).toHaveLength(1)
})

test('a key that grows the pane after the build builds nothing again', async () => {
  const { model, uploads } = await countedModel()
  model.setLegendSize({ width: 150, height: 40 })
  await sleep(400)
  const built = uploads.length
  const height = model.canvasHeight
  model.setLegendSize({ width: 150, height: 900 })
  await sleep(400)
  expect(model.canvasHeight).toBeGreaterThan(height)
  expect(uploads).toHaveLength(built)
})

test('a layout switch builds the drawing once', async () => {
  const { model, uploads } = await countedModel()
  await model.switchLayout('ordered')
  await sleep(400)
  expect(model.drawnLayoutMode).toBe('ordered')
  expect(uploads).toHaveLength(2)
})

// 3 bp between 1 and 2, laid a hair's width long, so the fit folds it and
// the key gains a row saying so
const FOLDED_GFA = `${GFA}S\t3\tACG\nL\t1\t+\t3\t+\t0M\nL\t3\t+\t2\t+\t0M\nW\tGRCh38\t0\tchr1\t0\t8\t>1>2\nW\tA\t1\tctg\t0\t11\t>1>3>2\n`
const at = (x0: number, x1: number, y: number) => [
  { x: x0, y },
  { x: x1, y },
]
const FOLDED_LAYOUT = {
  nodePositions: {
    '1+': at(0, 40000, 0),
    '1-': at(0, 40000, 30000),
    '3+': at(40000, 40001, 0),
    '3-': at(40000, 40001, 30000),
    '2+': at(40001, 80000, 0),
    '2-': at(40001, 80000, 30000),
  },
}

test('a key widened by what the build folds is measured, and the fit made beside it, before the build', async () => {
  mockRpcCall.mockImplementation((_id: string, method: string) =>
    method === 'GraphComputeLayout'
      ? Promise.resolve({ result: FOLDED_LAYOUT, duration: 5 })
      : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const uploads: RenderBatch[] = []
  const model = types
    .model({ view: stateModelFactory() })
    .create({ view: { type: 'GraphGenomeView' } }).view
  model.setWidth(1000)
  // the legend as GraphCanvas measures it, a frame after its key changes,
  // a row wider for what is folded
  model.setKeyShapeOf(() => JSON.stringify(model.graphKey))
  reaction(
    () => model.keyShape,
    () => {
      setTimeout(() => {
        const shape = model.keyShape
        model.setLegendSize(
          { width: shape?.includes('not drawn') ? 240 : 200, height: 40 },
          shape,
        )
      }, 10)
    },
    { fireImmediately: true },
  )
  await model.loadGFA(FOLDED_GFA, 'folded')
  model.startRenderingBackend(fakeRenderer(uploads))
  await sleep(400)
  expect(model.keyShape).toContain('not drawn')
  expect(model.legendSize.width).toBe(240)
  expect(uploads).toHaveLength(1)
})
