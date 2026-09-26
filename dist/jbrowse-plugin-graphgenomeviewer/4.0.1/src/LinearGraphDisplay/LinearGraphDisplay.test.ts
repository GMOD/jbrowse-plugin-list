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
import { types } from '@jbrowse/mobx-state-tree'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'

import LinearGraphDisplayF from './index'
import RgfaTabixAdapterF from '../RgfaTabixAdapter/index'

import type { LinearGraphDisplayModel } from './model'
import type { SubgraphTier } from '../GetSubgraph'
import type { Renderer } from '../GraphGenomeView/renderer/types'
import type { SubgraphRegion } from '../launchSubgraph/launchSubgraphView'

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
  pluginManager.addTrackType(() => {
    const trackConfigSchema = ConfigurationSchema(
      'FeatureTrack',
      {},
      {
        baseConfiguration: createBaseTrackConfig(pluginManager),
        explicitIdentifier: 'trackId',
      },
    )
    return new TrackType({
      name: 'FeatureTrack',
      configSchema: trackConfigSchema,
      stateModel: createBaseTrackModel(
        pluginManager,
        'FeatureTrack',
        trackConfigSchema,
      ),
    })
  })
  LinearGraphDisplayF(pluginManager)
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
      type: 'FeatureTrack',
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
  const trackConfigs = [trackConfig]

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
  const rpcCall = vi.fn(
    (
      _sid: unknown,
      method: string,
      args: { region: SubgraphRegion; opts?: { tier?: SubgraphTier } },
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
      return Promise.resolve(syntheticGraph(cut.tier, cut.region))
    },
  )

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
      notifyError() {},
      queueDialog() {},
    }))

  const session = Session.create({ configuration: {} }, { pluginManager })
  const view = session.setView(
    LinearGenomeModel.create({ type: 'LinearGenomeView', tracks: [] }),
  )
  view.setWidth(WIDTH_PX)
  view.setDisplayedRegions(assemblyRegions)
  return { session, view, cuts }
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
  const { view, cuts, session } = createEnvironment({ tiered })
  view.zoomTo(windowBp / WIDTH_PX)
  view.scrollTo(windowStart / view.bpPerPx)
  view.showTrack('graph')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  return { view, display, pane: display.pane, cuts, session }
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

test('with no coarse tier the margins narrow to the cap, and past it the last cut holds', async () => {
  const { view, pane, cuts } = await shownGraph({ tiered: false })
  view.zoomTo(pane.maxRegionBp / 2 / WIDTH_PX)
  await wait(SETTLE_MS)
  const wide = cuts.at(-1)!.region
  expect(wide.end - wide.start).toBeLessThanOrEqual(pane.maxRegionBp)
  view.zoomTo((pane.maxRegionBp * 2) / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.region).toEqual(wide)
  expect(pane.cutNote).toMatch(/Holding the last cut/)
})

test('a layout whose x is not reference bp draws its own viewport, and still re-cuts', async () => {
  const { view, pane, cuts } = await shownGraph()
  await pane.switchLayout('force')
  expect(pane.hostPlacesX).toBe(false)
  expect(pane.viewportOwner).not.toBe('host')
  view.scrollTo(2_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  await pane.switchLayout('auto')
  expect(pane.hostPlacesX).toBe(true)
  expect(graphX(pane, 2_030_000)).toBeCloseTo(lgvX(view, 2_030_000), 6)
})

test('the track is as tall as its rows, up to the configured height', async () => {
  const { display, pane } = await shownGraph()
  expect(display.height).toBe(pane.canvasHeight)
  expect(display.height).toBeLessThanOrEqual(300)
  display.resizeHeight(-100)
  await wait(0)
  expect(display.height).toBe(pane.canvasHeight)
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
  display.pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.pane.layoutMode).toBe('force')
  expect(display.pane.colorScheme).toBe('uniform')
  expect(display.pane.hostPlacesX).toBe(false)
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
