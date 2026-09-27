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
import { getSnapshot, types } from '@jbrowse/mobx-state-tree'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'

import LinearGraphDisplayF from './index'
import GbzBaseSyntenyAdapterF from '../GbzBaseSyntenyAdapter/index'
import GraphTrackF from '../GraphTrack/index'
import RgfaTabixAdapterF from '../RgfaTabixAdapter/index'

import type { LinearGraphDisplayModel } from './model'
import type { SubgraphRegion, SubgraphTier } from '../GetSubgraph'
import type { Renderer } from '../GraphGenomeView/renderer/types'

const REF = 'chr1'
const ASM = 'hg38'
const CONTIG = 10_000_000
const WIDTH_PX = 1000
const COARSE_ABOVE_BP_PER_PX = 1000
// the linear view's coarse blocks settle behind a debounce
const SETTLE_MS = 700

// A backbone of `step`-long segments with a small allele bubble on every
// second one; past 1.5 Mb the fine tier's bubbles run eight ranks deep, so a
// re-cut there has more rows than one before it.
function syntheticGraph(tier: SubgraphTier, region: SubgraphRegion) {
  const step = tier === 'fine' ? 10_000 : 250_000
  const lines = ['H\tVN:Z:1.0']
  const first = Math.floor(region.start / step)
  const last = Math.ceil(region.end / step)
  for (let k = first; k < last; k++) {
    const id = `${tier[0]}${k}`
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
        lines.push(
          `S\t${allele}\t*\tLN:i:100\tSN:Z:HG${rank}#1#${REF}\tSO:i:${k * step}\tSR:i:${rank}`,
          `L\t${from}\t+\t${allele}\t+\t0M`,
        )
        from = allele
      }
      lines.push(`L\t${from}\t+\t${tier[0]}${k + 1}\t+\t0M`)
    }
  }
  return lines.join('\n')
}

interface Cut {
  tier: SubgraphTier
  region: SubgraphRegion
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

function createEnvironment({ tiered = true } = {}) {
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
  // while set, a cut waits for the test to answer it
  let held: ((answer: () => void) => void) | undefined
  const signals: AbortSignal[] = []
  const rpcCall = vi.fn(
    (
      _sid: unknown,
      method: string,
      args: {
        region: SubgraphRegion
        opts?: { tier?: SubgraphTier }
        signal?: AbortSignal
      },
    ) => {
      if (method === 'GraphComputeLayout') {
        return Promise.resolve({ result: FORCE_LAYOUT, duration: 1 })
      }
      if (method === 'CoreGetFeatures') {
        return Promise.resolve([])
      }
      if (method !== 'GetSubgraph') {
        return Promise.reject(new Error(`Unexpected RPC: ${method}`))
      }
      const cut = { tier: args.opts?.tier ?? 'fine', region: args.region }
      cuts.push(cut)
      if (args.signal) {
        signals.push(args.signal)
      }
      const gfa = syntheticGraph(cut.tier, cut.region)
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
    }))

  const session = Session.create({ configuration: {} }, { pluginManager })
  const view = session.setView(
    LinearGenomeModel.create({ type: 'LinearGenomeView', tracks: [] }),
  )
  view.setWidth(WIDTH_PX)
  view.setDisplayedRegions(assemblyRegions)
  return { session, view, cuts, errors, holdCuts, signals, rpcCall }
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
} = {}) {
  const env = createEnvironment({ tiered })
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
