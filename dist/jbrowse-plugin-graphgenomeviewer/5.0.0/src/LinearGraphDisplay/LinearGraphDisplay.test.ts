import PluginManager from '@jbrowse/core/PluginManager'
import {
  ConfigurationSchema,
  readConfObject,
} from '@jbrowse/core/configuration'
import TrackType from '@jbrowse/core/pluggableElementTypes/TrackType'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import {
  createBaseTrackConfig,
  createBaseTrackModel,
} from '@jbrowse/core/pluggableElementTypes/models'
import { LAUNCH_LABEL } from '@jbrowse/core/ui'
import { getSnapshot, types } from '@jbrowse/mobx-state-tree'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'

import LinearGraphDisplayF from './index'
import GbzBaseSyntenyAdapterF from '../GbzBaseSyntenyAdapter/index'
import graphGenomeViewModel from '../GraphGenomeView/viewModel'
import GraphTrackF from '../GraphTrack/index'
import RgfaTabixAdapterF from '../RgfaTabixAdapter/index'

import type { LinearGraphDisplayModel } from './model'
import type { SubgraphRegion, SubgraphTier } from '../GetSubgraph'
import type { Renderer } from '@jbrowse/bandage-core/renderer/types'
import type { MenuItem } from '@jbrowse/core/ui'

const REF = 'chr1'
const ASM = 'hg38'
const CONTIG = 10_000_000
const WIDTH_PX = 1000
const COARSE_ABOVE_BP_PER_PX = 1000
// the linear view's coarse blocks settle behind a debounce
const SETTLE_MS = 700

// A backbone of `step`-long segments with a small allele bubble on every
// second one; past 1.5 Mb the fine tier's bubbles run eight ranks deep, so a
// re-cut there has more rows than one before it. `paths` walks the reference
// and one haplotype through every bubble, for the tube map.
function syntheticGraph(
  tier: SubgraphTier,
  region: SubgraphRegion,
  paths = false,
) {
  const step = tier === 'fine' ? 10_000 : 250_000
  const lines = ['H\tVN:Z:1.0']
  const ref: string[] = []
  const alt: string[] = []
  const first = Math.floor(region.start / step)
  const last = Math.ceil(region.end / step)
  for (let k = first; k < last; k++) {
    const id = `${tier[0]}${k}`
    ref.push(`${id}+`)
    alt.push(`${id}+`)
    lines.push(
      `S\t${id}\t*\tLN:i:${step}\tSN:Z:${REF}\tSO:i:${k * step}\tSR:i:0`,
    )
    if (k > first) {
      lines.push(`L\t${tier[0]}${k - 1}\t+\t${id}\t+\t0M`)
    }
    if (k % 2 === 0 && k + 1 < last) {
      const deep = tier === 'fine' && k * step >= 1_500_000 ? 8 : 1
      let from = id
      for (let rank = 1; rank <= deep; rank++) {
        const allele = `${id}r${rank}`
        alt.push(`${allele}+`)
        lines.push(
          `S\t${allele}\t*\tLN:i:100\tSN:Z:HG${rank}#1#${REF}\tSO:i:${k * step}\tSR:i:${rank}`,
          `L\t${from}\t+\t${allele}\t+\t0M`,
        )
        from = allele
      }
      lines.push(`L\t${from}\t+\t${tier[0]}${k + 1}\t+\t0M`)
    }
  }
  if (paths) {
    lines.push(`P\t${REF}\t${ref.join(',')}\t*`, `P\tHG1\t${alt.join(',')}\t*`)
  }
  return lines.join('\n')
}

interface Cut {
  tier: SubgraphTier
  region: SubgraphRegion
  snarls?: string
}

const FORCE_LAYOUT = {
  nodePositions: {
    'f100+': [
      { x: 0, y: 0 },
      { x: 400, y: 0 },
    ],
    'f101+': [
      { x: 500, y: 300 },
      { x: 900, y: 300 },
    ],
  },
}

function fakeRenderer() {
  return {
    resize: () => {},
    uploadGeometry: () => {},
    updateTransform: () => {},
    render: () => {},
    setNodeHighlights: () => {},
    setEdgeHighlight: () => {},
    dispose: () => {},
  } as unknown as Renderer
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function createEnvironment({ tiered = true, paths = false } = {}) {
  console.warn = vi.fn()
  const pluginManager = new PluginManager()
  RgfaTabixAdapterF(pluginManager)
  GbzBaseSyntenyAdapterF(pluginManager)
  // the track types a 4.0 config names its graph on
  for (const name of ['FeatureTrack', 'SyntenyTrack']) {
    pluginManager.addTrackType(() => {
      const trackConfigSchema = ConfigurationSchema(
        name,
        {},
        {
          baseConfiguration: createBaseTrackConfig(pluginManager),
          explicitIdentifier: 'trackId',
        },
      )
      return new TrackType({
        name,
        configSchema: trackConfigSchema,
        stateModel: createBaseTrackModel(
          pluginManager,
          name,
          trackConfigSchema,
        ),
      })
    })
  }
  LinearGraphDisplayF(pluginManager)
  GraphTrackF(pluginManager)
  pluginManager.addViewType(
    () =>
      new ViewType({
        name: 'LinearGenomeView',
        stateModel: linearGenomeViewStateModelFactory(pluginManager),
        ReactComponent: () => null,
      }),
  )
  pluginManager.createPluggableElements()
  pluginManager.configure()

  const LinearGenomeModel =
    pluginManager.getViewType('LinearGenomeView').stateModel
  const trackSchema = pluginManager.pluggableConfigSchemaType('track')
  const trackConfig = trackSchema.create(
    {
      type: 'GraphTrack',
      trackId: 'graph',
      name: 'graph',
      assemblyNames: [ASM],
      adapter: {
        type: 'RgfaTabixAdapter',
        uri: 'graph',
        ...(tiered
          ? {
              coarse: {
                uri: 'graph.tier10000',
                aboveBpPerPx: COARSE_ABOVE_BP_PER_PX,
              },
            }
          : {}),
      },
      displays: [
        { type: 'LinearGraphDisplay', displayId: 'graph-LinearGraphDisplay' },
      ],
    },
    { pluginManager },
  )
  const gbzTrackConfig = trackSchema.create(
    {
      type: 'GraphTrack',
      trackId: 'walks',
      name: 'walks',
      assemblyNames: [ASM, 'HG1.1', 'HG2.1'],
      adapter: { type: 'GbzBaseSyntenyAdapter', assemblyNames: [ASM] },
      displays: [
        { type: 'LinearGraphDisplay', displayId: 'walks-LinearGraphDisplay' },
      ],
    },
    { pluginManager },
  )
  const featureTrackConfig = trackSchema.create(
    {
      type: 'FeatureTrack',
      trackId: 'graph-as-feature',
      name: 'graph as a 4.0 config states it',
      assemblyNames: [ASM],
      adapter: { type: 'RgfaTabixAdapter', uri: 'graph' },
      displays: [
        {
          type: 'LinearGraphDisplay',
          displayId: 'graph-as-feature-LinearGraphDisplay',
        },
      ],
    },
    { pluginManager },
  )
  const trackConfigs = [trackConfig, gbzTrackConfig, featureTrackConfig]

  const assemblyRegions = [
    { refName: REF, start: 0, end: CONTIG, assemblyName: ASM },
  ]
  const assembly = {
    initialized: true,
    regions: assemblyRegions,
    getCanonicalRefName: (refName: string) => refName,
    getCanonicalRefName2: (refName: string) => refName,
    getGeneticCodeId: () => undefined,
    getRegionForRefName: (refName: string) =>
      assemblyRegions.find(r => r.refName === refName),
    configuration: { sequence: undefined },
  }

  const cuts: Cut[] = []
  const errors: string[] = []
  const addedViews: [string, unknown][] = []
  // while set, a cut waits for the test to answer it
  let held: ((answer: () => void) => void) | undefined
  const signals: AbortSignal[] = []
  const overviews: { region: SubgraphRegion; bpPerPx: number }[] = []
  // a GBZ cut of more than this many bp fails over its node limit
  let denseAbove = Infinity
  const rpcCall = vi.fn(
    (
      _sid: unknown,
      method: string,
      args: {
        region: SubgraphRegion
        opts?: { tier?: SubgraphTier; snarls?: string }
        signal?: AbortSignal
        bpPerPx?: number
        adapterConfig?: { type?: string }
      },
    ) => {
      if (method === 'GetHaplotypeOverview') {
        overviews.push({ region: args.region, bpPerPx: args.bpPerPx! })
        return Promise.resolve(syntheticOverview(args.region))
      }
      if (
        method === 'GetSubgraph' &&
        args.adapterConfig?.type === 'GbzBaseSyntenyAdapter' &&
        args.region.end - args.region.start > denseAbove
      ) {
        cuts.push({ tier: 'fine', region: args.region })
        const error = new Error(
          'this window reads more than nodeLimit (100,000) graph nodes; zoom in',
        )
        error.name = 'NodeLimitError'
        const hold = held
        return hold
          ? new Promise<string>((_, reject) => {
              hold(() => {
                reject(error)
              })
            })
          : Promise.reject(error)
      }
      if (method === 'GraphComputeLayout') {
        return Promise.resolve({ result: FORCE_LAYOUT, duration: 1 })
      }
      if (method === 'CoreGetFeatures') {
        return Promise.resolve([])
      }
      if (method !== 'GetSubgraph') {
        return Promise.reject(new Error(`Unexpected RPC: ${method}`))
      }
      const cut = {
        tier: args.opts?.tier ?? 'fine',
        region: args.region,
        snarls: args.opts?.snarls,
      }
      cuts.push(cut)
      if (args.signal) {
        signals.push(args.signal)
      }
      const gfa = syntheticGraph(cut.tier, cut.region, paths)
      const hold = held
      return hold
        ? new Promise<string>(resolve => {
            hold(() => {
              resolve(gfa)
            })
          })
        : Promise.resolve(gfa)
    },
  )
  const answers: (() => void)[] = []
  function holdCuts() {
    held = answer => answers.push(answer)
    return answers
  }

  const Session = types
    .model({
      name: 'testSession',
      view: types.maybe(LinearGenomeModel),
      configuration: types.map(types.frozen()),
    })
    .volatile(() => ({
      rpcManager: { call: rpcCall },
      assemblyManager: {
        get: (name: string) => (name === ASM ? assembly : undefined),
        has: (name: string) => name === ASM,
        waitForAssembly: () => Promise.resolve(assembly),
        isValidRefName: () => true,
      },
      hovered: undefined,
    }))
    .views(self => ({
      getTrackById(id: string) {
        return trackConfigs.find(t => readConfObject(t, 'trackId') === id)
      },
      get tracks() {
        return trackConfigs
      },
      get assemblies() {
        return []
      },
      get views() {
        return self.view ? [self.view] : []
      },
      getDisplayTypeDefault(): unknown {
        return undefined
      },
    }))
    .actions(self => ({
      setView(view: InstanceType<typeof LinearGenomeModel>) {
        self.view = view
        return view
      },
      notify() {},
      notifyError(message: string) {
        errors.push(message)
      },
      queueDialog() {},
      addView(type: string, snapshot: unknown) {
        addedViews.push([type, snapshot])
      },
    }))

  const session = Session.create({ configuration: {} }, { pluginManager })
  const view = session.setView(
    LinearGenomeModel.create({ type: 'LinearGenomeView', tracks: [] }),
  )
  view.setWidth(WIDTH_PX)
  view.setDisplayedRegions(assemblyRegions)
  return {
    session,
    view,
    cuts,
    errors,
    addedViews,
    holdCuts,
    signals,
    rpcCall,
    overviews,
    setDenseAbove(bp: number) {
      denseAbove = bp
    },
  }
}

// Two haplotypes and the reference in 4 kb bins over the region, the second
// haplotype variant in every bin
function syntheticOverview(region: SubgraphRegion) {
  const bin = 4096
  const first = Math.floor(region.start / bin)
  const count = Math.ceil(region.end / bin) - first
  const cells = new Uint8Array(count * 3)
  for (let b = 0; b < count; b++) {
    cells.set([1, 3, 1], b * 3)
  }
  return {
    level: 0,
    bin,
    rows: ['HG1.1', 'HG2.1', 'GRCh38#0'],
    pinned: [0],
    reference: [2],
    bins: Array.from({ length: count }, (_, b) => ({
      start: (first + b) * bin,
      end: (first + b + 1) * bin,
      classes: [0, 2, 0, 1],
      excursions: 1,
      variants: 1,
      longestExcursion: 60,
    })),
    cells,
  }
}

function lgvX(view: { bpPerPx: number; offsetPx: number }, bp: number) {
  return bp / view.bpPerPx - view.offsetPx
}

function graphX(model: { scale: number; translateX: number }, bp: number) {
  return bp * model.scale + model.translateX
}

async function shownGraph({
  windowStart = 1_000_000,
  windowBp = 60_000,
  tiered = true,
  paths = false,
} = {}) {
  const env = createEnvironment({ tiered, paths })
  const { view } = env
  view.zoomTo(windowBp / WIDTH_PX)
  view.scrollTo(windowStart / view.bpPerPx)
  view.showTrack('graph')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  return { ...env, display, pane: display }
}

test('showing the track cuts the window with a margin each side, and x is the view', async () => {
  const { view, pane, cuts } = await shownGraph()
  expect(cuts).toHaveLength(1)
  expect(cuts[0]!.tier).toBe('fine')
  expect(cuts[0]!.region.start).toBeLessThan(1_000_000)
  expect(cuts[0]!.region.end).toBeGreaterThan(1_060_000)
  expect(pane.host).toBe(view)
  expect(pane.hostPlacesX).toBe(true)
  expect(pane.viewportOwner).toBe('host')
  expect(pane.scale).toBeCloseTo(1 / view.bpPerPx)
  for (const bp of [1_000_000, 1_030_000, 1_060_000]) {
    expect(graphX(pane, bp)).toBeCloseTo(lgvX(view, bp), 6)
  }
})

test('a pan inside the cut moves x and fetches nothing; one past it re-cuts once', async () => {
  const { view, pane, cuts } = await shownGraph()
  view.horizontalScroll(100)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(graphX(pane, 1_010_000)).toBeCloseTo(lgvX(view, 1_010_000), 6)
  view.scrollTo(2_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  expect(pane.recuts).toBe(2)
  expect(graphX(pane, 2_030_000)).toBeCloseTo(lgvX(view, 2_030_000), 6)
})

test('zooming out past the handover cuts the coarse tier, and back in the fine one', async () => {
  const { view, pane, cuts } = await shownGraph()
  view.zoomTo(3_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.tier).toBe('coarse')
  expect(pane.cutTier).toBe('coarse')
  expect(pane.hostPlacesX).toBe(true)
  view.zoomTo(60_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.tier).toBe('fine')
  expect(pane.cutTier).toBe('fine')
})

test('with no coarse tier the margins narrow to the cap, past it the track is too large, and force load cuts it', async () => {
  const { view, pane, cuts } = await shownGraph({ tiered: false })
  view.zoomTo(pane.maxRegionBp / 2 / WIDTH_PX)
  await wait(SETTLE_MS)
  const wide = cuts.at(-1)!.region
  expect(wide.end - wide.start).toBeLessThanOrEqual(pane.maxRegionBp)
  view.zoomTo((pane.maxRegionBp * 2) / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.region).toEqual(wide)
  expect(pane.displayPhase).toBe('tooLarge')
  expect(pane.regionTooLargeReason).toMatch(/max 5 Mb/)
  const seen = pane.settledWindow!
  pane.forceLoad()
  await wait(0)
  expect(pane.displayPhase).not.toBe('tooLarge')
  expect(cuts.at(-1)!.region).toMatchObject({
    start: seen.start,
    end: seen.end,
  })
})

test('the ramp spans the graph on screen until the next cut lands', async () => {
  const { view, pane, holdCuts } = await shownGraph()
  const first = pane.graphRegion
  expect(pane.rampDomain).toEqual(first)
  const answers = holdCuts()
  view.scrollTo(2_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(pane.cutRegion).not.toEqual(first)
  expect(pane.rampDomain).toEqual(first)
  answers[0]!()
  await wait(0)
  expect(pane.rampDomain).toEqual(pane.cutRegion)
})

test('a canceled re-cut keeps the graph under it, and the next move cuts again', async () => {
  const { view, pane, cuts, holdCuts } = await shownGraph()
  const answers = holdCuts()
  view.scrollTo(2_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  pane.cancelFetchByUser()
  expect(pane.displayPhase).toBe('canceled')
  expect(pane.hasGraph).toBe(true)
  view.horizontalScroll(10)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(3)
  answers[1]!()
  await vi.waitFor(() => {
    expect(pane.displayPhase).toBe('ready')
  })
})

test('removing the track aborts its cut', async () => {
  const { view, holdCuts, signals } = createEnvironment()
  holdCuts()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('graph')
  await wait(SETTLE_MS)
  expect(signals).toHaveLength(1)
  view.hideTrack('graph')
  expect(signals[0]!.aborted).toBe(true)
})

test('the phase is loading until the graph is drawn, and a failed cut is an error the track shows', async () => {
  const { view, holdCuts, rpcCall } = createEnvironment()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const answers = holdCuts()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('graph')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(display.displayPhase).toBe('loading')
  answers[0]!()
  await vi.waitFor(() => {
    expect(display.displayPhase).toBe('ready')
  })
  // the chrome shows a ready track's status as background progress
  expect(display.statusMessage).toBe('')
  rpcCall.mockImplementationOnce(() => Promise.reject(new Error('index gone')))
  display.reload()
  await vi.waitFor(() => {
    expect(display.displayPhase).toBe('error')
  })
  expect(String(display.error)).toMatch(/index gone/)
})

test('a restored session cuts the region it saved', async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  const saved = {
    refName: REF,
    assemblyName: ASM,
    start: 990_000,
    end: 1_070_000,
  }
  view.showTrack('graph', {}, { type: 'LinearGraphDisplay', cutRegion: saved })
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(cuts[0]!.region).toEqual(saved)
})

test('a tube map on its own axis ties each reference box to its bp in the linear view', async () => {
  const { view, pane } = await shownGraph({ paths: true })
  await pane.switchLayout('tubemap')
  await wait(SETTLE_MS)
  expect(pane.hostPlacesX).toBe(false)
  const nodes = new Map(pane.tubeMapReferenceNodes!.map(n => [n.node, n]))
  const frame = pane.tubeMapFrame!
  const connectors = pane.tubeMapConnectors
  expect(connectors.length).toBeGreaterThan(3)
  for (const c of connectors) {
    const n = nodes.get(c.node)!
    expect(c.top0).toBeCloseTo(lgvX(view, n.bp0), 6)
    expect(c.top1).toBeCloseTo(lgvX(view, n.bp1), 6)
    expect(c.bottom0).toBeCloseTo(frame.x(n.x0), 6)
    expect(c.bottom1).toBeCloseTo(frame.x(n.x1), 6)
  }

  const c = connectors[1]!
  const zoneBottom = pane.connectorZoneBottom
  expect(zoneBottom).toBeGreaterThan(0)
  const mid = (c.top0 + c.top1 + c.bottom0 + c.bottom1) / 4
  expect(pane.tubeMapNodeAt(mid, zoneBottom / 2)).toBe(c.node)

  // a frame of a pan moves the tops with the linear view, the boxes stay
  view.horizontalScroll(50)
  expect(pane.tubeMapConnectors[1]).toEqual({
    ...c,
    top0: c.top0 - 50,
    top1: c.top1 - 50,
  })

  // on the reference axis the boxes already sit on their bp
  await pane.switchLayout('tubemapref')
  expect(pane.tubeMapConnectors).toEqual([])
})

test("a folded tube map draws the cut's reference as merged nodes, and the rest as ticks or routes", async () => {
  const { pane } = await shownGraph({ paths: true })
  const labels = () =>
    pane.trackMenuItems().map(item => ('label' in item ? item.label : ''))
  expect(labels()).not.toContain('Fold variants')
  await pane.switchLayout('tubemap')
  await wait(SETTLE_MS)
  expect(labels()).toContain('Fold variants')
  expect(pane.drawnGraph).toBe(pane.graph)
  expect(pane.tubeMapKeys.foldBp).toBeUndefined()

  // the haplotype's three 100 bp insertions fold under 1 kb
  pane.setTubeMapFold(1000)
  await pane.recomputeLayout()
  const [merged] = pane.drawnGraph!.nodes
  expect(pane.drawnGraph!.nodes).toHaveLength(1)
  expect(merged!.stable).toMatchObject({ start: 1_000_000, rank: 0 })
  expect(merged!.length).toBe(60_000)
  expect(pane.nodeById!.get(merged!.id)).toBe(merged)
  expect(pane.tubeMapDeviations).toHaveLength(3)
  expect(pane.tubeMapKeys.foldBp).toBe(1000)
  expect(pane.tubeMapConnectors.map(c => c.node)).toEqual([merged!.id])

  // and stand as their own nodes under 50 bp
  pane.setTubeMapFold(50)
  await pane.recomputeLayout()
  const nodes = pane.drawnGraph!.nodes
  expect(nodes.filter(n => n.stable?.rank === 0)).toHaveLength(4)
  expect(nodes.filter(n => n.stable?.rank === 1)).toHaveLength(3)
  expect(pane.tubeMapDeviations).toEqual([])
  expect(pane.tubeMapKeys.foldBp).toBeUndefined()
})

test('a layout whose x is not reference bp draws its own viewport of the window alone, and still re-cuts', async () => {
  const { view, pane, cuts } = await shownGraph()
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  expect(pane.hostPlacesX).toBe(false)
  expect(pane.viewportOwner).not.toBe('host')
  expect(cuts).toHaveLength(2)
  expect(cuts[1]!.region).toMatchObject({ start: 1_000_000, end: 1_060_000 })
  view.scrollTo(2_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(3)
  expect(cuts[2]!.region.start).toBe(2_000_000)
  expect(Math.abs(cuts[2]!.region.end - 2_060_000)).toBeLessThanOrEqual(1)
  await pane.switchLayout('auto')
  await wait(SETTLE_MS)
  expect(pane.hostPlacesX).toBe(true)
  expect(graphX(pane, 2_030_000)).toBeCloseTo(lgvX(view, 2_030_000), 6)
})

test('walk rows fit their own bars in the track, since a walk can be longer than the window', async () => {
  const { pane } = await shownGraph({ paths: true })
  await pane.switchLayout('walkrows')
  await wait(SETTLE_MS)
  expect(pane.layoutResult?.referenceAxis).toBe(true)
  expect(pane.hostPlacesX).toBe(false)
  expect(pane.drawsGenomicCoordinates).toBe(false)
  expect(pane.viewportOwner).toBe('fit')
})

test('walk rows cut every snarl a walk takes past the window, so a walk comes whole', async () => {
  const { pane, cuts } = await shownGraph({ paths: true })
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  const before = cuts.length
  expect(cuts.at(-1)!.snarls).toBeUndefined()
  await pane.switchLayout('walkrows')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 1)
  expect(cuts.at(-1)!.snarls).toBe('overlapping')
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 2)
  expect(cuts.at(-1)!.snarls).toBeUndefined()
})

test('a launch in the force layout cuts the window alone', async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    {
      type: 'LinearGraphDisplay',
      pane: { layoutMode: 'force' },
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(cuts[0]!.region).toMatchObject({ start: 1_000_000, end: 1_060_000 })
})

test('the drawing is the track height, and resizing the track resizes it', async () => {
  const { display } = await shownGraph()
  expect(display.height).toBe(300)
  expect(display.canvasHeight).toBe(300)
  display.resizeHeight(-100)
  expect(display.canvasHeight).toBe(200)
})

test('side by side grows a track too short for its panels, and a shrink after stays', async () => {
  const { display } = await shownGraph({ paths: true })
  display.resizeHeight(120 - display.height)
  display.liftWalks([REF, 'HG1'])
  display.setFacet('walk')
  expect(display.facetGrid!.total).toBeLessThanOrEqual(display.height)
  expect(display.height).toBeGreaterThan(120)

  display.resizeHeight(-50)
  expect(display.facetGrid!.total).toBeGreaterThan(display.height)
})

test("a launch names the pane's props without its type, and opens in that layout", async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    {
      type: 'LinearGraphDisplay',
      pane: { layoutMode: 'force', colorScheme: 'uniform' },
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.layoutMode).toBe('force')
  expect(display.colorScheme).toBe('uniform')
  expect(display.hostPlacesX).toBe(false)
})

test.each([
  ['force', false],
  ['auto', true],
])(
  'a %s drawing reports whether its x is genomic to the linear view',
  async (layoutMode, genomic) => {
    const { view } = createEnvironment()
    view.zoomTo(60_000 / WIDTH_PX)
    view.scrollTo(1_000_000 / view.bpPerPx)
    view.showTrack(
      'graph',
      {},
      { type: 'LinearGraphDisplay', pane: { layoutMode } },
    )
    const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
    display.startRenderingBackend(fakeRenderer())
    await wait(SETTLE_MS)
    expect(display.drawsGenomicCoordinates).toBe(genomic)
  },
)

test('a launch that states one choice takes the rest from the config', async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    { type: 'LinearGraphDisplay', colorScheme: 'uniform' },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.chosenColorScheme).toBe('uniform')
  expect(display.chosenLayoutMode).toBe('auto')
  expect(display.hostPlacesX).toBe(true)
})

test("a 4.0 session's pane state still loads, and is not reported as an unknown key", () => {
  const { view, errors } = createEnvironment()
  view.showTrack(
    'graph',
    {},
    {
      type: 'LinearGraphDisplay',
      pane: { type: 'GraphGenomeView', layoutMode: 'force' },
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  expect(display.chosenLayoutMode).toBe('force')
  expect(errors).toEqual([])
  expect(getSnapshot(display).pane).toBeUndefined()
})

test('closing a drawn track reads nothing of the dead display', async () => {
  const { view } = await shownGraph()
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  view.hideTrack('graph')
  await wait(SETTLE_MS)
  expect(warn.mock.calls.map(c => String(c[0])).join('\n')).not.toMatch(
    /findParentThat|no longer part of a state tree/,
  )
})

// every hosted config and share link through 4.0.7 names the graph on a
// FeatureTrack, and a store update reaches them all at once
test('a 4.0 FeatureTrack config still opens as the graph', async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('graph-as-feature', {}, { type: 'LinearGraphDisplay' })
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  expect(display.type).toBe('LinearGraphDisplay')
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.hasGraph).toBe(true)
})

test('a GBZ track cuts for the lanes it names', async () => {
  const { view } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  expect(display.type).toBe('LinearGraphDisplay')
  expect(display.chosenHaplotypes).toEqual(['HG1.1', 'HG2.1'])
})

async function shownWalks(windowBp: number, setup?: (env: Env) => void) {
  const env = createEnvironment()
  setup?.(env)
  const { view } = env
  view.zoomTo(windowBp / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  return { ...env, display }
}

type Env = ReturnType<typeof createEnvironment>

test('past the bp cap a GBZ track reads the overview for the window and a window each side, and a pan inside it reads nothing', async () => {
  const { view, display, overviews, cuts } = await shownWalks(6_000_000)
  expect(cuts).toHaveLength(0)
  expect(display.showsOverview).toBe(true)
  expect(display.displayPhase).not.toBe('tooLarge')
  expect(overviews).toHaveLength(1)
  const seen = display.settledWindow!
  expect(overviews[0]!.region.start).toBeLessThan(seen.start)
  expect(overviews[0]!.bpPerPx).toBe(view.bpPerPx * 2)
  expect(display.overview?.rows).toEqual(['HG1.1', 'HG2.1', 'GRCh38#0'])
  view.horizontalScroll(10)
  await wait(SETTLE_MS)
  expect(overviews).toHaveLength(1)
  view.zoomTo(60_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(display.showsOverview).toBe(false)
  expect(cuts).toHaveLength(1)
})

test('a GBZ cut over its node limit draws the overview at that span and wider, and zooming in cuts again', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { view, display, overviews, cuts } = await shownWalks(
    1_000_000,
    env => {
      env.setDenseAbove(1_500_000)
    },
  )
  await vi.waitFor(() => {
    expect(display.showsOverview).toBe(true)
  })
  expect(cuts).toHaveLength(1)
  expect(display.dense!.end - display.dense!.start).toBe(1_000_000)
  expect(display.displayPhase).not.toBe('error')
  expect(overviews).toHaveLength(1)
  view.zoomTo(2_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  view.zoomTo(400_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
  expect(display.showsOverview).toBe(false)
})

test('a refused cut stands only near where it was refused: far along the contig the same zoom cuts again', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const env = await shownWalks(1_000_000, e => {
    e.setDenseAbove(1_500_000)
  })
  const { view, display, cuts } = env
  await vi.waitFor(() => {
    expect(display.showsOverview).toBe(true)
  })
  env.setDenseAbove(Infinity)
  view.scrollTo(7_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
  expect(display.showsOverview).toBe(false)
})

test('a cut refused over its node limit still switches when the window moved while it ran', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const env = createEnvironment()
  env.setDenseAbove(500_000)
  const answers = env.holdCuts()
  const { view } = env
  view.zoomTo(1_000_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  view.horizontalScroll(20)
  await wait(SETTLE_MS)
  expect(env.cuts).toHaveLength(1)
  answers.shift()!()
  await vi.waitFor(() => {
    expect(display.showsOverview).toBe(true)
  })
  expect(display.displayPhase).not.toBe('error')
  expect(env.overviews).toHaveLength(1)
})

test('editing the haplotypes past the cap reads the overview again for them', async () => {
  const { display, overviews, cuts } = await shownWalks(6_000_000)
  expect(overviews).toHaveLength(1)
  display.setSubgraphHaplotypes(['HG1.1'])
  void display.cut()
  await vi.waitFor(() => {
    expect(display.overview).toBeDefined()
  })
  expect(overviews).toHaveLength(2)
  expect(cuts).toHaveLength(0)
})

test('an rGFA track past the cap stays too large: only a GBZ track has an overview', async () => {
  const { pane, view, overviews } = await shownGraph({ tiered: false })
  view.zoomTo((pane.maxRegionBp * 2) / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(pane.showsOverview).toBe(false)
  expect(pane.displayPhase).toBe('tooLarge')
  expect(overviews).toHaveLength(0)
})

test('the track menu offers the layouts, colours and the settings dialog', async () => {
  const { display } = await shownGraph()
  const labels = display
    .trackMenuItems()
    .map(item => ('label' in item ? item.label : ''))
  expect(labels).toEqual(
    expect.arrayContaining(['Layout', 'Color', 'Mark bubbles', 'Settings']),
  )
  expect(labels).not.toContain('Zoom in')
})

function graphViewItem(display: LinearGraphDisplayModel) {
  const launch = display
    .trackMenuItems()
    .find(item => 'label' in item && item.label === LAUNCH_LABEL) as
    { subMenu: MenuItem[] } | undefined
  return launch?.subMenu.find(
    item => 'label' in item && item.label === 'Graph genome view',
  ) as { disabled?: boolean; onClick: () => void } | undefined
}

test('the track menu opens the window on screen in a graph genome view, drawn as the track draws it', async () => {
  const { display, addedViews } = await shownGraph()
  display.setLayoutMode('tubemapref')
  const item = graphViewItem(display)!
  expect(item.disabled).toBe(false)

  item.onClick()
  expect(addedViews).toHaveLength(1)
  const [type, spec] = addedViews[0]!
  expect(type).toBe('GraphGenomeView')
  expect(spec).toMatchObject({
    loadedTrackId: 'graph',
    loadedRegion: { refName: REF, assemblyName: ASM },
    layoutMode: 'tubemapref',
    subgraphContext: display.subgraphContext,
  })
  const { loadedRegion } = spec as { loadedRegion: SubgraphRegion }
  expect(loadedRegion.start).toBeCloseTo(1_000_000, -1)
  expect(loadedRegion.end).toBeCloseTo(1_060_000, -1)
  expect(display.cutRegion!.start).toBeLessThan(loadedRegion.start)
  expect(display.cutRegion!.end).toBeGreaterThan(loadedRegion.end)
  expect(() =>
    graphGenomeViewModel().create({
      type: 'GraphGenomeView',
      ...(spec as object),
    }),
  ).not.toThrow()
})

test('zoomed out to the coarse tier, the graph genome view launch is disabled', async () => {
  const { view, display, addedViews } = await shownGraph()
  view.zoomTo(3_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(display.cutTier).toBe('coarse')

  const item = graphViewItem(display)!
  expect(item.disabled).toBe(true)
  item.onClick()
  expect(addedViews).toHaveLength(0)
})
