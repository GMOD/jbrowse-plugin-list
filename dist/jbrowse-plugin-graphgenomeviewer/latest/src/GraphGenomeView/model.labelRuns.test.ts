import { readConfObject } from '@jbrowse/core/configuration'
import { destroy } from '@jbrowse/mobx-state-tree'
import { reaction } from 'mobx'

import { legendSections } from './legendSections'
import { mockRpcCall, mockSession } from './modelTestMocks'
import { fakeRenderer } from './modelTestSupport'
import { VIEWPORT_DEBOUNCE_MS } from './pane/paneBase'
import { READ_WAIT_MS } from './pane/renderingActions'
import stateModelFactory from './viewModel'

import type { GraphLayers } from './graphLayers'
import type { LabelLayoutSource } from '@jbrowse/bandage-core/labelLayout'

const runs = vi.hoisted(() => ({ onLaidOutGraph: 0 }))

vi.mock(import('@jbrowse/bandage-core/labelLayout'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    layoutLabels: (m: LabelLayoutSource) => {
      runs.onLaidOutGraph += m.nodePositions ? 1 : 0
      return actual.layoutLabels(m)
    },
  }
})
vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

// GRCh38 walks r1 r2 r3 over chr1:1000-1030 and a haplotype walks r1, a node
// of its own and r3, from 5000 on its contig CM1. The reference's genes and the
// haplotype's arrive after the drawing, as they do over the network.
const GFA = [
  'S\tr1\tAAAAAAAAAA',
  'S\tr2\tCCCCCCCCCC',
  'S\tr3\tGGGGGGGGGG',
  'S\th0\tTTTTTTTTTT',
  'L\tr1\t+\tr2\t+\t0M',
  'L\tr2\t+\tr3\t+\t0M',
  'L\tr1\t+\th0\t+\t0M',
  'L\th0\t+\tr3\t+\t0M',
  'W\tGRCh38\t0\tchr1\t1000\t1030\t>r1>r2>r3',
  'W\tHG00097\t1\tCM1\t5000\t5030\t>r1>h0>r3',
  '',
].join('\n')

const gene = (name: string, refName: string, start: number, end: number) => ({
  type: 'gene',
  name,
  refName,
  start,
  end,
  strand: 1,
  subfeatures: [{ type: 'exon', start, end }],
})

const later = <T>(value: T, ms: number) =>
  new Promise<T>(resolve =>
    setTimeout(() => {
      resolve(value)
    }, ms),
  )

const reads = {
  reference: (): Promise<unknown> =>
    later([gene('CFH', 'chr1', 1005, 1025)], 20),
  haplotype: (): Promise<unknown> =>
    later([gene('CFHR3', 'CM1', 5011, 5019)], 40),
}
const ordinaryReads = { ...reads }

const bySlot = (obj: Record<string, unknown>, key?: unknown) => obj[String(key)]
const adapterOnly = (obj: Record<string, unknown>, key?: unknown) =>
  key === 'adapter' ? obj.adapter : undefined

beforeEach(() => {
  runs.onLaidOutGraph = 0
  Object.assign(reads, ordinaryReads)
  vi.mocked(readConfObject).mockImplementation(bySlot)
  mockSession.assemblyNames = ['hg38', 'HG00097']
  mockSession.tracks = [
    { trackId: 'graph', assemblyNames: [], adapter: {} },
    {
      trackId: 'refseq',
      name: 'RefSeq genes',
      assemblyNames: ['hg38'],
      adapter: { type: 'Gff3TabixAdapter', which: 'hg38' },
    },
    {
      trackId: 'HG00097_genes',
      name: 'HG00097 genes',
      assemblyNames: ['HG00097'],
      adapter: { type: 'Gff3TabixAdapter', which: 'HG00097' },
    },
  ]
  mockRpcCall.mockReset()
  mockRpcCall.mockImplementation(
    (
      _sid: unknown,
      method: string,
      args: { adapterConfig?: { which?: string } },
    ) =>
      method === 'GetSubgraph'
        ? Promise.resolve(GFA)
        : method === 'CoreGetFeatures'
          ? args.adapterConfig?.which === 'hg38'
            ? reads.reference()
            : reads.haplotype()
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
})

afterEach(() => {
  vi.mocked(readConfObject).mockImplementation(adapterOnly)
  mockSession.tracks = []
  mockSession.assemblyNames = []
})

type Model = ReturnType<ReturnType<typeof stateModelFactory>['create']>

// What the page's key does: it tells the model how to say what it draws,
// and once the browser has laid it out measures it, a 15 px line per row and
// heading
function measureKeyAsDrawn(model: Model, afterMs = 1) {
  model.setKeyShapeOf(() => JSON.stringify(legendSections(model)))
  return reaction(
    () => model.keyShape,
    shape => {
      const lines = legendSections(model).reduce(
        (sum, section) => sum + section.rows.length + (section.heading ? 1 : 0),
        0,
      )
      setTimeout(() => {
        model.setLegendSize({ width: 220, height: lines * 15 }, shape)
      }, afterMs)
    },
    { fireImmediately: true },
  )
}

function picture(model: Model, labels: Model['overlayLabels']) {
  return {
    canvasHeight: model.canvasHeight,
    legendSize: model.legendSize,
    transform: [model.scale, model.translateX, model.translateY],
    chips: labels.genes.map(({ text, x, y }) => [text, x, y]),
    sizes: labels.sizes.map(({ text, x, y }) => [text, x, y]),
    bubbles: labels.bubbles.map(({ text, x, y }) => [text, x, y]),
  }
}

async function settledView(layers?: GraphLayers) {
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    loadedTrackId: 'graph',
    ...(layers ? { layers } : {}),
  })
  model.setWidth(1200)
  model.startRenderingBackend(fakeRenderer())
  const labels: unknown[] = []
  const stopLabels = reaction(
    () => model.overlayLabels,
    layout => labels.push(layout),
    { fireImmediately: true },
  )
  const stopKey = measureKeyAsDrawn(model)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  await vi.waitFor(() => {
    expect(model.genePins).toHaveLength(2)
  })
  await later(undefined, 100)
  const settled = {
    model,
    runs: runs.onLaidOutGraph,
    labels: model.overlayLabels,
  }
  stopLabels()
  stopKey()
  return settled
}

test('a settled view lays its labels out once on the laid-out graph', async () => {
  const { model, runs, labels } = await settledView()
  expect(runs).toBe(1)
  // the picture the labels laid out again until nothing moved settled on
  expect(picture(model, labels)).toEqual({
    canvasHeight: 160,
    legendSize: { width: 220, height: 120 },
    transform: [26.446666666666665, -26312.066666666666, 70],
    chips: [
      ['CFH', 531.2999999999993, 56],
      ['CFHR3', 531.2999999999993, 114],
    ],
    sizes: [['10 bp', 531.2999999999993, 90]],
    bubbles: [],
  })
})

// a rebuild that folds what the last one folded leaves the halos and the
// labels as they were
test('a settled view with bubble halos shown lays its labels out once', async () => {
  const { model, runs } = await settledView({ bubbles: true })
  expect(model.bubbleHalos.length).toBeGreaterThan(0)
  expect(runs).toBe(1)
})

// zoomed in to 100 px a layout unit with chr1:1008 at the pane's middle,
// then moved a pane and a half left, past the drawing the last build covered
async function pannedPastBuild(model: Model) {
  const keep = reaction(
    () => model.overlayLabels,
    () => {},
    { fireImmediately: true },
  )
  model.setTransform(100, 600 - 1008 * 100, 80 - 10 * 100)
  await later(undefined, VIEWPORT_DEBOUNCE_MS + 100)
  const zoomed = model.builtViewport
  runs.onLaidOutGraph = 0
  const to = model.translateX - 1.5 * model.paneWidth
  model.setTransform(model.scale, to, model.translateY)
  await later(undefined, VIEWPORT_DEBOUNCE_MS + 100)
  keep()
  return { zoomed, to }
}

// the rebuild paints on the pane what the build before it did
test('a pan that rebuilds the drawing for the moved view lays its labels out once, for the move', async () => {
  const { model } = await settledView()
  const { zoomed, to } = await pannedPastBuild(model)
  expect(model.translateX).toBe(to)
  expect(model.builtViewport).not.toBe(zoomed)
  expect(runs.onLaidOutGraph).toBe(1)
})

const chipTexts = (model: Model) =>
  model.overlayLabels.genes.map(({ text }) => text).sort()

// every set of chips the labels show from now on, each once in a row
function chipsSeen(model: Model) {
  const seen: string[][] = []
  const stop = reaction(
    () => chipTexts(model),
    texts => seen.push(texts),
    { fireImmediately: true, equals: (a, b) => a.join() === b.join() },
  )
  return { seen, stop }
}

test('a read that never lands holds the labels back no longer than READ_WAIT_MS after the layout', async () => {
  reads.haplotype = () => new Promise<never>(() => {})
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    loadedTrackId: 'graph',
  })
  model.setWidth(1200)
  model.startRenderingBackend(fakeRenderer())
  const stopKey = measureKeyAsDrawn(model)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  await vi.waitFor(
    () => {
      expect(chipTexts(model)).toEqual(['CFH'])
    },
    { timeout: READ_WAIT_MS + 1000, interval: 50 },
  )
  expect(model.featureReadsInFlight).toBeGreaterThan(0)
  expect(runs.onLaidOutGraph).toBe(1)
  stopKey()
})

test('a gene track read again on a settled view keeps the labels it does not touch while it reads, and lays them out again as it lands', async () => {
  const { model } = await settledView()
  const { seen, stop } = chipsSeen(model)
  reads.reference = () => later([gene('CFH', 'chr1', 1005, 1025)], 150)
  const reload = model.reloadGenes()
  await later(undefined, 50)
  expect(model.featureReadsInFlight).toBe(1)
  expect(chipTexts(model)).toEqual(['CFHR3'])
  await reload
  await later(undefined, 50)
  expect(seen).toEqual([['CFH', 'CFHR3'], ['CFHR3'], ['CFH', 'CFHR3']])
  stop()
})

test("a sample filter that reads the rows' genes again leaves the placed labels in place", async () => {
  const { model } = await settledView({ walkStrip: true })
  const rowReads = () => model.walkGeneReads?.reads.map(read => read.row)
  expect(rowReads()).toEqual(['HG00097#1#CM1'])
  const { seen, stop } = chipsSeen(model)
  model.setWalkRowSamples(['GRCh38'])
  expect(rowReads()).toEqual([])
  model.setWalkRowSamples(undefined)
  expect(rowReads()).toEqual(['HG00097#1#CM1'])
  await vi.waitFor(() => {
    expect(model.walkGeneFeatures?.size).toBe(1)
  })
  expect(seen).toEqual([['CFH', 'CFHR3']])
  stop()
})

test('a view closed while a read is on its way is not written to when the read lands', async () => {
  reads.haplotype = () => later([gene('CFHR3', 'CM1', 5011, 5019)], 200)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    loadedTrackId: 'graph',
  })
  model.setWidth(1200)
  model.startRenderingBackend(fakeRenderer())
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  await later(undefined, 60)
  expect(model.featureReadsInFlight).toBeGreaterThan(0)
  destroy(model)
  await later(undefined, 300)
  expect(
    warn.mock.calls.filter(call =>
      String(call[0]).includes('featureReadsInFlight'),
    ),
  ).toEqual([])
  warn.mockRestore()
})

function cutView() {
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    loadedTrackId: 'graph',
  })
  model.setWidth(1200)
  model.startRenderingBackend(fakeRenderer())
  return model
}

const cutWindow = (model: Model) =>
  model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )

test("labels landed before the key is measured wait for the key's measure, and are laid out once at its size", async () => {
  reads.reference = () => Promise.resolve([gene('CFH', 'chr1', 1005, 1025)])
  reads.haplotype = () => Promise.resolve([gene('CFHR3', 'CM1', 5011, 5019)])
  const model = cutView()
  const legendAtLayout: unknown[] = []
  const stopLabels = reaction(
    () => model.overlayLabels,
    layout => {
      if (layout.genes.length > 0) {
        legendAtLayout.push(model.legendSize)
      }
    },
  )
  const stopKey = measureKeyAsDrawn(model, 200)
  await cutWindow(model)
  await later(undefined, 100)
  expect(model.genePins).toHaveLength(2)
  expect(chipTexts(model)).toEqual([])
  await vi.waitFor(() => {
    expect(chipTexts(model)).toEqual(['CFH', 'CFHR3'])
  })
  expect(runs.onLaidOutGraph).toBe(1)
  expect(legendAtLayout).toEqual([model.legendSize])
  stopLabels()
  stopKey()
})

test('labels wait for a track to answer the floor its key sets', async () => {
  const model = cutView()
  const stopKey = measureKeyAsDrawn(model)
  model.setAnsweredKeyFloor(-1)
  await cutWindow(model)
  await later(undefined, 200)
  expect(model.labelFrameSettled).toBe(false)
  expect(chipTexts(model)).toEqual([])
  model.setAnsweredKeyFloor(model.canvasFloor)
  expect(chipTexts(model)).toEqual(['CFH', 'CFHR3'])
  stopKey()
})

test('a read that fails is no longer awaited', async () => {
  reads.haplotype = () => Promise.reject(new Error('no such file'))
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const model = cutView()
  const stopKey = measureKeyAsDrawn(model)
  await cutWindow(model)
  await later(undefined, 200)
  expect(model.featureReadsInFlight).toBe(0)
  expect(chipTexts(model)).toEqual(['CFH'])
  stopKey()
  warn.mockRestore()
})

test("a second cut's labels wait for its own reads again, and are laid out once", async () => {
  const { model } = await settledView()
  runs.onLaidOutGraph = 0
  reads.haplotype = () => later([gene('CFHR3', 'CM1', 5011, 5019)], 200)
  const stopKey = measureKeyAsDrawn(model)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1029 },
  )
  await vi.waitFor(() => {
    expect(chipTexts(model)).toEqual(['CFH', 'CFHR3'])
  })
  expect(runs.onLaidOutGraph).toBe(1)
  stopKey()
})
