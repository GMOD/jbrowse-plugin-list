import { exonStretches } from '@jbrowse/bandage-core/genes/exonOutline'
import { genesOverNode } from '@jbrowse/bandage-core/genes/geneNames'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/keyColumn'
import { NO_FOLD } from '@jbrowse/bandage-core/levelOfDetail'
import { MAX_ZOOM } from '@jbrowse/bandage-core/zoomLimits'
import { readConfObject } from '@jbrowse/core/configuration'
import { autorun, reaction } from 'mobx'

import { mockRpcCall, mockSession } from './modelTestMocks'
import { attachedModel, fakeRenderer } from './modelTestSupport'
import stateModelFactory from './viewModel'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

// GRCh38 walks r1 r2 r3 over chr1:1000-1030; each of eight haplotypes walks r1,
// a node of its own, and r3, from 5000 on its contig CM1
const SAMPLES = [
  'HG00097',
  'HG00099',
  'HG00128',
  'HG00133',
  'HG01109',
  'HG01123',
  'HG01960',
  'HG02055',
]
const GFA = [
  'S\tr1\tAAAAAAAAAA',
  'S\tr2\tCCCCCCCCCC',
  'S\tr3\tGGGGGGGGGG',
  ...SAMPLES.map((_, i) => `S\th${i}\tTTTTTTTTTT`),
  'L\tr1\t+\tr2\t+\t0M',
  'L\tr2\t+\tr3\t+\t0M',
  ...SAMPLES.flatMap((_, i) => [
    `L\tr1\t+\th${i}\t+\t0M`,
    `L\th${i}\t+\tr3\t+\t0M`,
  ]),
  'W\tGRCh38\t0\tchr1\t1000\t1030\t>r1>r2>r3',
  ...SAMPLES.map((s, i) => `W\t${s}\t1\tCM1\t5000\t5030\t>r1>h${i}>r3`),
  '',
].join('\n')

const SYMBOLS = ['CFH', 'CFHR1', 'CFHR2', 'CFHR3', 'CFHR4']
const UNNAMED = 'ENSG00000289697'
const gene = (name: string, refName: string, start: number, end: number) => ({
  type: 'gene',
  name,
  refName,
  start,
  end,
  strand: 1,
  subfeatures: [{ type: 'exon', start, end }],
})

// the reference's genes lie whole in the cut but CFHR4, which runs past it;
// each haplotype's lie whole in its walk, over its own node and the
// reference's either side, and only some haplotypes carry NBPF26
const REFERENCE_GENES = [
  ...SYMBOLS.map(name =>
    name === 'CFHR4'
      ? gene(name, 'chr1', 1015, 1045)
      : gene(name, 'chr1', 1005, 1025),
  ),
  gene(UNNAMED, 'chr1', 1005, 1025),
]
const haplotypeGenes = (sample: string) => [
  ...SYMBOLS.map(name => gene(name, 'CM1', 5005, 5025)),
  gene(UNNAMED, 'CM1', 5005, 5025),
  ...(['HG00128', 'HG01123'].includes(sample)
    ? [gene('NBPF26', 'CM1', 5011, 5019)]
    : []),
]

const bySlot = (obj: Record<string, unknown>, key?: unknown) => obj[String(key)]
const adapterOnly = (obj: Record<string, unknown>, key?: unknown) =>
  key === 'adapter' ? obj.adapter : undefined

beforeEach(() => {
  vi.mocked(readConfObject).mockImplementation(bySlot)
  mockSession.assemblyNames = ['hg38', ...SAMPLES]
  mockSession.tracks = [
    { trackId: 'graph', assemblyNames: [], adapter: {} },
    {
      trackId: 'refseq',
      name: 'RefSeq genes',
      assemblyNames: ['hg38'],
      adapter: { type: 'Gff3TabixAdapter', which: 'hg38' },
    },
    ...SAMPLES.map(s => ({
      trackId: `${s}_genes`,
      name: `${s} genes`,
      assemblyNames: [s],
      adapter: { type: 'Gff3TabixAdapter', which: s },
    })),
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
          ? Promise.resolve(
              args.adapterConfig?.which === 'hg38'
                ? REFERENCE_GENES
                : haplotypeGenes(args.adapterConfig?.which ?? ''),
            )
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
})

afterEach(() => {
  vi.mocked(readConfObject).mockImplementation(adapterOnly)
  mockSession.tracks = []
  mockSession.assemblyNames = []
})

async function drawn() {
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    loadedTrackId: 'graph',
  })
  model.setWidth(1600)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  await model.loadOwnGenes()
  return model
}

const chips = (model: Awaited<ReturnType<typeof drawn>>) =>
  model.overlayLabels.genes.map(chip => chip.text).sort()

test("forty pins of eight haplotypes' copies of five genes give five names, each once, on the reference", async () => {
  const model = await drawn()
  const copies = model.genePins.filter(
    pin =>
      SYMBOLS.includes(pin.gene.name) && pin.gene.refName !== 'GRCh38#0#chr1',
  )
  expect(copies).toHaveLength(40)
  expect(chips(model)).toEqual(
    ['CFH', 'CFHR1', 'CFHR2', 'CFHR3', 'CFHR4 · 15 of 30 bp', 'NBPF26'].sort(),
  )
})

test("lifting one walk names that walk's own copies, with its haplotype, and no other's", async () => {
  const model = await drawn()
  model.setWalkLayers([{ walk: 'HG00133#1#CM1' }])
  expect(chips(model)).toEqual(
    [
      'CFH',
      'CFHR1',
      'CFHR2',
      'CFHR3',
      'CFHR4 · 15 of 30 bp',
      ...SYMBOLS.map(name => `${name} · HG00133#1`),
      'NBPF26 · HG00128#1',
    ].sort(),
  )
})

test('a gene only haplotypes carry is named once, on the copy the most walks step, then the first contig by name', async () => {
  const model = await drawn()
  const named = model.overlayLabels.genes.filter(
    chip => chip.item.pin.gene.name === 'NBPF26',
  )
  expect(named.map(chip => chip.item.pin.gene.refName)).toEqual([
    'HG00128#1#CM1',
  ])
})

test('a gene with no symbol is not named, and keeps its outlines and its hover', async () => {
  const model = await drawn()
  expect(chips(model).some(text => text.includes(UNNAMED))).toBe(false)
  const unnamed = model.genePins.filter(pin => pin.gene.name === UNNAMED)
  expect(unnamed).toHaveLength(9)
  expect(exonStretches(unnamed, () => 1).length).toBeGreaterThanOrEqual(9)
  expect(genesOverNode(model.genePins, 'h0+')).toContain(
    `${UNNAMED} · HG00097#1`,
  )
})

test('an exon on a node the drawing folds is not outlined, and its gene stays over the node', async () => {
  const model = await drawn()
  const outlinedOn = (id: string) =>
    model.exonOutlines.filter(s => s.key.endsWith(`-${id}`))
  expect(outlinedOn('h0+').length).toBeGreaterThan(0)
  const { batch, view } = model.buildDrawing(undefined, false)!
  model.setGeometryMetrics(
    0,
    { ...batch, collapsed: { ...NO_FOLD, nodes: new Set(['h0+']) } },
    view,
  )
  expect(outlinedOn('h0+')).toEqual([])
  expect(outlinedOn('h1+').length).toBeGreaterThan(0)
  expect(genesOverNode(model.genePins, 'h0+')).toContain('CFH · HG00097#1')
})

test('an exon on a reference node that only the lanes across a folded site draw is not outlined', async () => {
  const model = await drawn()
  const outlinedOn = (id: string) =>
    model.exonOutlines.filter(s => s.key.endsWith(`-${id}`))
  expect(outlinedOn('h0+').length).toBeGreaterThan(0)
  const { batch, view } = model.buildDrawing(undefined, false)!
  model.setGeometryMetrics(
    0,
    { ...batch, laneOnly: { nodes: new Set(['h0+']), edges: new Set() } },
    view,
  )
  expect(outlinedOn('h0+')).toEqual([])
  expect(outlinedOn('h1+').length).toBeGreaterThan(0)
})

test('pins read again the same, or still none, change nothing a label reads', async () => {
  const model = await drawn()
  const seen: unknown[] = []
  const stop = autorun(() => {
    seen.push(model.genePins)
  })
  await model.loadOwnGenes()
  expect(seen).toHaveLength(1)
  model.setLayer('genes', false)
  expect(seen).toHaveLength(2)
  await model.loadOwnGenes()
  model.setLayer('deletions', !model.showDeletionEdges)
  expect(seen).toHaveLength(2)
  stop()
})

// A transform under which a pane 500 px wide lies along the middle of r2 at
// the deepest zoom, so it shows r2 and the haplotypes' own nodes beside it,
// and not r1 or r3
function alongR2(model: {
  layoutResult?: { nodePositions: Record<string, { x: number }[]> }
}) {
  const xs = model.layoutResult!.nodePositions['r2+']!.map(p => p.x)
  const left = xs.reduce((a, b) => Math.min(a, b))
  const right = xs.reduce((a, b) => Math.max(a, b))
  const scale = MAX_ZOOM
  expect((right - left) * scale).toBeGreaterThan(500)
  return {
    scale,
    translateX: -((left + right) / 2) * scale + 250,
  }
}

// Y-rand-10's pane showed the reference's nodes, which GRCh38 alone walks,
// while the haplotypes' walks stepped nodes off the pane, and the key said
// "7 walks | 1 walk" over a line drawn as one walk is; here the pane shows r2
// and the haplotypes' own nodes, which one walk steps each, and the drawing
// holds r1 and r3, which every walk steps, beyond it
test("the key's node thicknesses are those of the nodes the pane shows", async () => {
  const model = await drawn()
  // depth keys the nodes the pane shows; walks key the graph's one scale
  model.setNodeWidth('depth')
  model.startRenderingBackend(fakeRenderer())
  const thicknesses = () =>
    model.graphKey
      .find(section => section.id === 'node-width')
      ?.entries.map(entry => entry.text)
  expect(thicknesses()).toEqual(['depth 9', 'depth 1'])
  let changes = 0
  const stop = reaction(
    () => model.graphKey,
    () => {
      changes++
    },
  )
  model.setTransform(model.scale, model.translateX + 1, model.translateY)
  expect(changes).toBe(0)
  model.setWidth(500)
  const { scale, translateX } = alongR2(model)
  model.setTransform(scale, translateX, model.translateY)
  expect(thicknesses()).toEqual(['depth 1'])
  stop()
})

// L6-amy's pane, panned, drew a skip's dashes and a thick reference node in
// the strip under the key, and the key listed neither; here r3, which every
// walk steps, lies under a key as wide as the pane less 88 px
test('a node drawn under the key is keyed', async () => {
  const model = await drawn()
  // depth keys the nodes the pane shows; walks key the graph's one scale
  model.setNodeWidth('depth')
  model.startRenderingBackend(fakeRenderer())
  const r2 = model.layoutResult!.nodePositions['r2+']![0]!
  model.setLegendSize({ width: 1500, height: 40 })
  model.setTransform(100, 40 - (r2.x + 1) * 100, model.translateY)
  expect(
    model.graphKey
      .find(section => section.id === 'node-width')
      ?.entries.map(entry => entry.text),
  ).toEqual(['depth 9', 'depth 1'])
})

// An attached pane keys the view a pan or zoom settles on, so the key, and
// the labels that wait on its measure, hold still through the gesture
test('an attached pane keys the view it settles on, not each step of a pan', async () => {
  const model = attachedModel({ layoutMode: 'auto', loadedTrackId: 'graph' })
  // depth keys the nodes the pane shows; walks key the graph's one scale
  model.setNodeWidth('depth')
  model.setWidth(500)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  model.startRenderingBackend(fakeRenderer())
  const thicknesses = () =>
    model.graphKey
      .find(section => section.id === 'node-width')
      ?.entries.map(entry => entry.text)
  await vi.waitFor(() => {
    expect(model.settledKeyView?.layout).toBe(model.layoutResult)
  })
  expect(thicknesses()).toEqual(['depth 9', 'depth 1'])
  const { scale, translateX } = alongR2(model)
  model.setTransform(scale, translateX, model.translateY)
  expect(thicknesses()).toEqual(['depth 9', 'depth 1'])
  await vi.waitFor(() => {
    expect(thicknesses()).toEqual(['depth 1'])
  })
})

// rand-chr1-1's pane grew by a row and shrank back as a pan brought an
// off-reference node in and out of the key, and moved everything below it
test("a pan or zoom never moves the pane's height, which follows the key a setting changes", async () => {
  const model = attachedModel({ layoutMode: 'auto', loadedTrackId: 'graph' })
  // depth keys the nodes the pane shows; walks key the graph's one scale
  model.setNodeWidth('depth')
  model.setWidth(500)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  model.startRenderingBackend(fakeRenderer())
  model.setKeyShapeOf(() => JSON.stringify(model.graphKey))
  const thicknesses = () =>
    model.graphKey
      .find(section => section.id === 'node-width')
      ?.entries.map(entry => entry.text)
  await vi.waitFor(() => {
    expect(model.settledKeyView?.layout).toBe(model.layoutResult)
  })
  const floorOf = (keyPx: number) =>
    keyPx + 2 * LEGEND_INSET_PX + model.referenceStripZonePx
  model.setLegendSize({ width: 200, height: 420 })
  const height = model.canvasHeight
  expect(height).toBe(floorOf(420))
  const { scale, translateX } = alongR2(model)
  model.setTransform(scale, translateX, model.translateY)
  await vi.waitFor(() => {
    expect(thicknesses()).toEqual(['depth 1'])
  })
  model.setLegendSize({ width: 180, height: 300 })
  expect(model.canvasHeight).toBe(height)
  model.setTransform(scale, translateX - 100, model.translateY)
  await vi.waitFor(() => {
    expect(model.keyView.minX).toBe(model.liveKeyView.minX)
  })
  model.setLegendSize({ width: 190, height: 380 })
  expect(model.canvasHeight).toBe(height)
  model.setNodeWidth('uniform')
  expect(thicknesses()).toBeUndefined()
  model.setLegendSize({ width: 180, height: 250 })
  expect(model.canvasFloor).toBe(floorOf(250))
})

// HG00097's contig here shares GRCh38's coordinates, as a T2T assembly's
// chr1 does, so hg38's genes would land on its bar by offset alone
test("the reference walk row takes the gene track's genes only while x lies along that track's assembly", async () => {
  mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
    method === 'GetSubgraph'
      ? Promise.resolve(GFA.replaceAll('CM1\t5000\t5030', 'CM1\t1000\t1030'))
      : method === 'CoreGetFeatures'
        ? Promise.resolve(REFERENCE_GENES)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'walkrows',
    loadedTrackId: 'graph',
    layers: { genes: true },
  })
  model.setWidth(1600)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  const referenceGenes = () =>
    model.walkRowGenes?.get(model.walkRowBars!.reference.name)
  expect(referenceGenes()?.length).toBeGreaterThan(0)
  model.setReferencePath('HG00097#1#CM1')
  await model.recomputeLayout()
  expect(model.walkRowBars!.reference.name).toContain('HG00097')
  expect(referenceGenes()).toBeUndefined()
})
