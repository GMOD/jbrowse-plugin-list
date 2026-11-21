import { createElement } from 'react'

import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/keyColumn'
import { LAYOUT_ENGINE_VALUES } from '@jbrowse/bandage-core/layoutEngines'
import { LAYOUT_MODE_VALUES } from '@jbrowse/bandage-core/layoutModes'
import { NO_FOLD } from '@jbrowse/bandage-core/levelOfDetail'
import {
  cutScale,
  fittedTranslateY,
  referenceScale,
  windowScale,
} from '@jbrowse/bandage-core/pipeline'
import {
  REFERENCE_STRIP_ZONE_PX,
  stripOverhang,
  stripPixels,
} from '@jbrowse/bandage-core/referenceStrip'
import { TRACK_FIT_LABELS, grownHeight } from '@jbrowse/bandage-core/trackFit'
import PluginManager from '@jbrowse/core/PluginManager'
import {
  ConfigurationReference,
  ConfigurationSchema,
  getSlotDefinition,
  readConfObject,
  slotChoices,
} from '@jbrowse/core/configuration'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import TrackType from '@jbrowse/core/pluggableElementTypes/TrackType'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import {
  BaseDisplay,
  createBaseTrackConfig,
  createBaseTrackModel,
} from '@jbrowse/core/pluggableElementTypes/models'
import { LAUNCH_LABEL } from '@jbrowse/core/ui'
import SimpleFeature from '@jbrowse/core/util/simpleFeature'
import { applyPatch, getType, onAction, types } from '@jbrowse/mobx-state-tree'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { reaction, runInAction } from 'mobx'
import { renderToStaticMarkup } from 'react-dom/server'

import { configSchemaFactory } from './configSchema'
import LinearGraphDisplayF from './index'
import { FOLD_PX, coarseHandover } from './model'
import GbzBaseSyntenyAdapterF from '../GbzBaseSyntenyAdapter/index'
import GraphCanvas from '../GraphGenomeView/components/GraphCanvas'
import LayoutSwitch from '../GraphGenomeView/components/LayoutSwitch'
import { PaneSvgLayer } from '../GraphGenomeView/components/PaneLayer'
import { hostWindow, snappedCut } from '../GraphGenomeView/host'
import { HOVER_HIGHLIGHT_VALUES } from '../GraphGenomeView/hoverHighlight'
import {
  MIN_CANVAS_HEIGHT,
  forceLayouts,
  paneBase,
} from '../GraphGenomeView/pane/paneBase'
import graphGenomeViewModel from '../GraphGenomeView/viewModel'
import GraphTrackF from '../GraphTrack/index'
import RgfaTabixAdapterF from '../RgfaTabixAdapter/index'

import type { LinearGraphDisplayModel } from './model'
import type { SubgraphRegion, SubgraphTier } from '../GetSubgraph'
import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'
import type { Renderer } from '@jbrowse/bandage-core/renderer/types'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Instance } from '@jbrowse/mobx-state-tree'

const REF = 'chr1'
const ASM = 'hg38'
const CONTIG = 10_000_000
const WIDTH_PX = 1000
const COARSE_ABOVE_BP_PER_PX = 1000
const COARSE_TIER: Record<string, unknown> = {
  uri: 'graph.tier10000',
  aboveBpPerPx: COARSE_ABOVE_BP_PER_PX,
}
// the linear view's coarse blocks settle behind a debounce
const SETTLE_MS = 700
// where loopInside hangs its chain, the middle of the windows tests open on
const LOOP_BP = 1_030_000

// A backbone of `step`-long segments with a small allele bubble on every
// second one; past 1.5 Mb the fine tier's bubbles run eight ranks deep, so a
// re-cut there has more rows than one before it. `paths` walks the reference
// and one haplotype through every bubble, for the tube map.
function syntheticGraph(
  tier: SubgraphTier,
  region: SubgraphRegion,
  paths = false,
  loopAtStart = false,
  loopInside = false,
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
  // a chain off the reference node the cut's start runs through, so it
  // hangs outside every window the cut holds
  if (loopAtStart && tier === 'fine') {
    const id = `${tier[0]}${first}`
    let from = id
    for (let rank = 1; rank <= 24; rank++) {
      const allele = `${id}l${rank}`
      lines.push(
        `S\t${allele}\t*\tLN:i:${step}\tSN:Z:HG${rank}#1#${REF}\tSO:i:${first * step}\tSR:i:${rank}`,
        `L\t${from}\t+\t${allele}\t+\t0M`,
      )
      from = allele
    }
  }
  // a chain off the reference node at LOOP_BP, which every window over it
  // shows
  const loopAt = Math.floor(LOOP_BP / step)
  if (loopInside && tier === 'fine' && loopAt > first && loopAt < last - 1) {
    const id = `${tier[0]}${loopAt}`
    let from = id
    for (let rank = 1; rank <= 24; rank++) {
      const allele = `${id}l${rank}`
      lines.push(
        `S\t${allele}\t*\tLN:i:${step}\tSN:Z:HG${rank}#1#${REF}\tSO:i:${loopAt * step}\tSR:i:${rank}`,
        `L\t${from}\t+\t${allele}\t+\t0M`,
      )
      from = allele
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
  hops?: number
}

// The engine's request laid out where it was seeded: the reference along x
// in bp order and each node off it a lane below, each a line short of the
// next seed, but a chain stacked straight up from the node it hangs off. A
// `zigzag` lays each reference node rising that many units up for each along
// and the next falling as far, which no turn of the drawing lays flat.
function fakeEngine({ nodes }: EngineRequest['graph'], zigzag = 0) {
  const seeded = new Map(nodes.map(({ id, x = 0 }) => [id, x]))
  return {
    nodePositions: Object.fromEntries(
      nodes.map(({ id, length, x = 0, y = 0 }) => {
        const step = Number(/l(\d+)[+-]?$/.exec(id)?.[1] ?? 0)
        const rise = length * 0.015
        const from = seeded.get(id.replace(/l\d+(?=[+-]?$)/, '')) ?? x
        return [
          id,
          step > 0
            ? [
                { x: from, y: -rise * (step - 1) },
                { x: from, y: -rise * step },
              ]
            : [
                { x, y: y - zigzag * rise * zigLift(id, false) },
                { x: x + rise, y: y - zigzag * rise * zigLift(id, true) },
              ],
        ]
      }),
    ),
  }
}

// A reference node of even number rises to its end, and one of odd number
// falls from its start; any other node lies flat
function zigLift(id: string, atEnd: boolean) {
  const k = /^[fc](\d+)[+-]?$/.exec(id)?.[1]
  return k === undefined ? 0 : Number(k) % 2 === (atEnd ? 0 : 1) ? 1 : 0
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

// What a gene lane needs for this file: a GFF3 adapter type to name, and a
// display with the `filter` slot the canvas display reads, on a track type of
// its own so no other track here can be shown with it
function addGeneLaneTypes(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'Gff3TabixAdapter',
        configSchema: ConfigurationSchema(
          'Gff3TabixAdapter',
          {},
          { explicitlyTyped: true },
        ),
        getAdapterClass: () => Promise.reject(new Error('read by the RPC')),
      }),
  )
  pluginManager.addDisplayType(() => {
    const configSchema = ConfigurationSchema(
      'GeneLaneDisplay',
      { filter: { type: 'stringArray', defaultValue: [] } },
      { explicitIdentifier: 'displayId', explicitlyTyped: true },
    )
    return new DisplayType({
      name: 'GeneLaneDisplay',
      configSchema,
      stateModel: types.compose(
        'GeneLaneDisplay',
        BaseDisplay,
        types.model({
          type: types.literal('GeneLaneDisplay'),
          configuration: ConfigurationReference(configSchema),
        }),
      ),
      trackType: 'GeneLaneTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: () => null,
    })
  })
}

// K12's annotation over the IS1 at 1,978,503, moved into the cut's window:
// the molecule's source record, the element (named here, so only a filter
// keeps it off), and the transposase gene inside it
const GENE_FEATURES = [
  { type: 'region', name: 'ANONYMOUS', gbkey: 'Src', start: 0, end: CONTIG },
  {
    type: 'mobile_genetic_element',
    name: 'IS1',
    start: 1_010_000,
    end: 1_010_768,
  },
  { type: 'gene', name: 'insB5', start: 1_010_100, end: 1_010_600 },
].map((f, i) => new SimpleFeature({ ...f, uniqueId: `g${i}`, refName: REF }))

function createEnvironment({
  tiered = true,
  coarse = COARSE_TIER,
  paths = false,
  geneLaneFilter = undefined as string[] | undefined,
  contig = CONTIG,
  loopAtStart = false,
  loopInside = false,
  zigzag = 0,
} = {}) {
  console.warn = vi.fn()
  // reduced motion, so a re-cut lands without a morph's frames
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const pluginManager = new PluginManager()
  RgfaTabixAdapterF(pluginManager)
  GbzBaseSyntenyAdapterF(pluginManager)
  addGeneLaneTypes(pluginManager)
  for (const name of ['GeneLaneTrack']) {
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
        ...(tiered ? { coarse } : {}),
      },
      // anchored, the layout whose cut margins and genomic x most tests here
      // pin; a track naming no layout opens force-directed
      displays: [
        {
          type: 'LinearGraphDisplay',
          displayId: 'graph-LinearGraphDisplay',
          layoutMode: 'auto',
        },
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
      // anchored, whose margined cut is what the refusal tests' dense
      // thresholds are set against
      displays: [
        {
          type: 'LinearGraphDisplay',
          displayId: 'walks-LinearGraphDisplay',
          layoutMode: 'auto',
        },
      ],
    },
    { pluginManager },
  )
  const walkIndexedTrackConfig = trackSchema.create(
    {
      type: 'GraphTrack',
      trackId: 'walk-indexed',
      name: 'walk-indexed',
      assemblyNames: [ASM],
      adapter: {
        type: 'RgfaTabixAdapter',
        walksUri: 'chr22',
        defaultHaplotypes: ['HG1', 'HG2#1'],
      },
      displays: [
        {
          type: 'LinearGraphDisplay',
          displayId: 'walk-indexed-LinearGraphDisplay',
        },
      ],
    },
    { pluginManager },
  )
  const bareTrackConfig = trackSchema.create(
    {
      type: 'GraphTrack',
      trackId: 'graph-bare',
      name: 'graph whose display states nothing',
      assemblyNames: [ASM],
      adapter: { type: 'RgfaTabixAdapter', uri: 'graph' },
      displays: [
        {
          type: 'LinearGraphDisplay',
          displayId: 'graph-bare-LinearGraphDisplay',
        },
      ],
    },
    { pluginManager },
  )
  const aliasTrackConfig = trackSchema.create(
    {
      type: 'GraphTrack',
      trackId: 'graph-on-alias',
      name: 'graph on an alias of its reference',
      assemblyNames: ['GRCh38'],
      adapter: { type: 'RgfaTabixAdapter', uri: 'graph' },
      displays: [
        {
          type: 'LinearGraphDisplay',
          displayId: 'graph-on-alias-LinearGraphDisplay',
        },
      ],
    },
    { pluginManager },
  )
  const trackConfigs = [
    trackConfig,
    gbzTrackConfig,
    walkIndexedTrackConfig,
    bareTrackConfig,
    aliasTrackConfig,
  ]
  if (geneLaneFilter) {
    trackConfigs.push(
      trackSchema.create(
        {
          type: 'GeneLaneTrack',
          trackId: 'K12_genes',
          name: 'K12 genes',
          assemblyNames: [ASM],
          adapter: { type: 'Gff3TabixAdapter' },
          displays: [
            {
              type: 'GeneLaneDisplay',
              displayId: 'K12_genes-GeneLaneDisplay',
              filter: geneLaneFilter,
            },
          ],
        },
        { pluginManager },
      ),
    )
  }

  const assemblyRegions = [
    { refName: REF, start: 0, end: contig, assemblyName: ASM },
  ]
  const assembly = {
    name: ASM,
    aliases: ['GRCh38'],
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
  // a GBZ cut of more than this many bp fails over its node limit
  let denseAbove = Infinity
  // a GBZ cut under a forced byte budget of fewer bytes than this fails where
  // no zoom fits
  let unzoomableBytes = 0
  // what a walk-indexed graph's header names
  let haplotypeNames: string[] | undefined = ['HG1#1', 'HG1#2', 'HG2#1']
  const rpcCall = vi.fn(
    (
      _sid: unknown,
      method: string,
      args: {
        region: SubgraphRegion
        opts?: {
          tier?: SubgraphTier
          snarls?: string
          hops?: number
          forcedByteBudget?: number
          links?: string
          walkRows?: boolean
        }
        options?: { engine: string }
        graph?: EngineRequest['graph']
        signal?: AbortSignal
        adapterConfig?: { type?: string }
      },
    ) => {
      if (
        method === 'GetSubgraph' &&
        args.adapterConfig?.type === 'GbzBaseSyntenyAdapter' &&
        unzoomableBytes > (args.opts?.forcedByteBudget ?? 0)
      ) {
        cuts.push({ tier: 'fine', region: args.region })
        return Promise.reject(
          Object.assign(
            new Error('Too much graph here to fetch, even zoomed in'),
            {
              name: 'NodeLimitError',
              regionTooLarge: true,
              zoomHelps: false,
              bytes: unzoomableBytes,
            },
          ),
        )
      }
      if (
        method === 'GetSubgraph' &&
        args.adapterConfig?.type === 'GbzBaseSyntenyAdapter' &&
        args.region.end - args.region.start > denseAbove
      ) {
        cuts.push({ tier: 'fine', region: args.region })
        const error = Object.assign(
          new Error('Zoom in to about 1Mbp to see the graph'),
          { name: 'NodeLimitError', regionTooLarge: true },
        )
        const hold = held
        return hold
          ? new Promise<string>((_, reject) => {
              hold(() => {
                reject(error)
              })
            })
          : Promise.reject(error)
      }
      if (method === 'GetGraphHaplotypes') {
        return Promise.resolve(haplotypeNames)
      }
      if (method === 'GraphComputeLayout' && args.graph) {
        return Promise.resolve({
          result: fakeEngine(args.graph, zigzag),
          duration: 1,
        })
      }
      if (method === 'CoreGetFeatures') {
        return Promise.resolve(
          args.adapterConfig?.type === 'Gff3TabixAdapter' ? GENE_FEATURES : [],
        )
      }
      if (method !== 'GetSubgraph') {
        return Promise.reject(new Error(`Unexpected RPC: ${method}`))
      }
      const cut = {
        tier: args.opts?.tier ?? 'fine',
        region: args.region,
        snarls: args.opts?.snarls,
        hops: args.opts?.hops,
      }
      cuts.push(cut)
      if (args.signal) {
        signals.push(args.signal)
      }
      const gfa = syntheticGraph(
        cut.tier,
        cut.region,
        paths,
        loopAtStart,
        loopInside,
      )
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
      other: types.maybe(LinearGenomeModel),
      configuration: types.map(types.frozen()),
    })
    .volatile(() => ({
      rpcManager: { call: rpcCall },
      assemblyManager: {
        assemblyList: [
          { name: ASM, aliases: ['GRCh38'] },
          { name: 'HG1.1', aliases: ['HG1#1'] },
          { name: 'HG2.1', aliases: ['HG2#1'] },
        ],
        get: (name: string) =>
          name === ASM || assembly.aliases.includes(name)
            ? assembly
            : undefined,
        has: (name: string) => name === ASM || assembly.aliases.includes(name),
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
        return [self.view, self.other].filter(v => v !== undefined)
      },
      getDisplayTypeDefault(): unknown {
        return undefined
      },
    }))
    .actions(self => ({
      setView(view: Instance<typeof LinearGenomeModel>) {
        self.view = view
        return view
      },
      setOther(view: Instance<typeof LinearGenomeModel>) {
        self.other = view
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
    setDenseAbove(bp: number) {
      denseAbove = bp
    },
    setUnzoomableBytes(bytes: number) {
      unzoomableBytes = bytes
    },
    setHaplotypeNames(names: string[] | undefined) {
      haplotypeNames = names
    },
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
  coarse = COARSE_TIER,
  paths = false,
  geneLaneFilter = undefined as string[] | undefined,
} = {}) {
  const env = createEnvironment({ tiered, coarse, paths, geneLaneFilter })
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

test('under a twentieth of a bp per pixel, where the fold rounds to 0 bp, a pan inside the cut fetches nothing', async () => {
  const { view, cuts } = await shownGraph({ windowBp: 30 })
  expect(view.bpPerPx).toBeLessThan(0.05)
  view.horizontalScroll(100)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
})

test('zooming out past the handover cuts the coarse tier, and back in the fine one', async () => {
  const { view, pane, cuts } = await shownGraph()
  view.zoomTo(3_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.tier).toBe('coarse')
  // a tier is the same graph folded, so it is cut the same way
  expect(cuts.at(-1)!.hops).toBe(cuts[0]!.hops)
  expect(pane.cutTier).toBe('coarse')
  expect(pane.hostPlacesX).toBe(true)
  view.zoomTo(60_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.tier).toBe('fine')
  expect(pane.cutTier).toBe('fine')
})

test('a tier stating only foldBelowBp hands over at foldBelowBp / FOLD_PX', async () => {
  const { view, pane, cuts } = await shownGraph({
    coarse: { uri: 'graph.tier10000', foldBelowBp: 10_000 },
  })
  expect(pane.coarseAboveBpPerPx).toBe(10_000 / FOLD_PX)
  view.zoomTo(3_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.at(-1)!.tier).toBe('coarse')
})

test('aboveBpPerPx wins over foldBelowBp', async () => {
  const { pane } = await shownGraph({
    coarse: { uri: 'graph.tier10000', aboveBpPerPx: 700, foldBelowBp: 50_000 },
  })
  expect(pane.coarseAboveBpPerPx).toBe(700)
})

test('coarseHandover', () => {
  expect(coarseHandover(undefined)).toBeUndefined()
  expect(coarseHandover({})).toBeUndefined()
  expect(coarseHandover({ foldBelowBp: 50 })).toBe(5)
  expect(coarseHandover({ foldBelowBp: 0 })).toBeUndefined()
  expect(coarseHandover({ aboveBpPerPx: 1000, foldBelowBp: 50 })).toBe(1000)
  expect(coarseHandover({ aboveBpPerPx: 1000 })).toBe(1000)
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
  rpcCall.mockRejectedValueOnce(new Error('index gone'))
  display.reload()
  await vi.waitFor(() => {
    expect(display.displayPhase).toBe('error')
  })
  expect(String(display.error)).toMatch(/index gone/)
})

test('a canvas marked drawn before its geometry is painted is not painted', () => {
  const { view } = createEnvironment()
  view.showTrack('graph')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.markCanvasDrawn()
  expect(display.canvasDrawn).toBe(true)
  expect(display.geometryPainted).toBe(false)
  expect(display.painted).toBe(false)
})

test('a failed backend is the renderError phase, not the error a cut reports', async () => {
  const { pane } = await shownGraph()
  expect(pane.displayPhase).toBe('ready')
  pane.setRenderError(new Error('context lost'))
  expect(pane.displayPhase).toBe('renderError')
  expect(pane.error).toBeUndefined()
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
  const boxes = new Map(pane.tubeMapConnectedBoxes!.map(b => [b.name, b]))
  const frame = pane.tubeMapFrame!
  const connectors = pane.tubeMapConnectors
  expect(connectors.length).toBeGreaterThan(3)
  for (const c of connectors) {
    const n = boxes.get(c.node)!
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

test('a hosted drawing whose height changes after the host took the pane is placed again', async () => {
  const { pane } = await shownGraph({ paths: true })
  await pane.switchLayout('tubemapref')
  await wait(SETTLE_MS)
  const expected = fittedTranslateY(
    pane.layoutBounds!,
    pane.usableHeight,
    pane.scaleY,
    pane.fitPads.top,
  )
  expect(pane.viewportOwner).toBe('host')
  expect(pane.translateY).toBeCloseTo(expected, 6)
})

test("a folded tube map draws the cut's reference as merged nodes, and the rest as ticks or routes", async () => {
  const { pane } = await shownGraph({ paths: true })
  const labels = () =>
    pane
      .layoutOptionMenuItems()
      .map(item => ('label' in item ? item.label : ''))
  expect(labels()).not.toContain('Fold variants')
  await pane.switchLayout('tubemap')
  await wait(SETTLE_MS)
  expect(labels()).toContain('Fold variants')
  expect(pane.layoutResult?.tubeMap?.coarse).toBeUndefined()
  expect(pane.drawnGraph).toBe(pane.layoutResult?.tubeMap?.graph)
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

test("a pan that changes nothing the tube map's legend says leaves it alone", async () => {
  const { pane } = await shownGraph({ paths: true })
  await pane.switchLayout('tubemap')
  await wait(SETTLE_MS)
  let notified = 0
  const dispose = reaction(
    () => pane.tubeMapKeys,
    () => {
      notified++
    },
  )
  const frame = pane.tubeMapFrame
  pane.setTransform(pane.scale, pane.translateX - 20, pane.translateY)
  expect(pane.tubeMapFrame).not.toBe(frame)
  expect(notified).toBe(0)
  dispose()
})

test('a layout whose x is not reference bp draws its own viewport of the window alone, and still re-cuts', async () => {
  const { view, pane, cuts } = await shownGraph()
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  expect(pane.hostPlacesX).toBe(false)
  expect(pane.viewportOwner).not.toBe('host')
  expect(cuts).toHaveLength(2)
  expect(cuts[1]!.region).toMatchObject({ start: 966_656, end: 1_064_960 })
  view.scrollTo(2_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(3)
  expect(cuts[2]!.region).toMatchObject({ start: 1_982_464, end: 2_080_768 })
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

test('walk rows cut every snarl a GBZ walk takes past the window, so a walk comes whole', async () => {
  const { view, cuts } = createEnvironment({ paths: true })
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const pane = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  const before = cuts.length
  const forced = pane.graph
  expect(cuts.at(-1)!.snarls).toBeUndefined()
  await pane.switchLayout('walkrows')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 1)
  expect(cuts.at(-1)!.snarls).toBe('overlapping')
  // the force cut is kept, so coming back fetches nothing
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 1)
  expect(pane.graph).toBe(forced)
  expect(pane.cutOptions.snarls).toBeUndefined()
})

// A walk file cuts the same whatever the snarl option says
test('walk rows on an rGFA track cut for the step budget, not for snarls', async () => {
  const { pane, cuts } = await shownGraph({ paths: true })
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  const before = cuts.length
  await pane.switchLayout('walkrows')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 1)
  expect(cuts.at(-1)!.snarls).toBeUndefined()
})

test('a launch in the force layout cuts the snapped window', async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    {
      type: 'LinearGraphDisplay',
      layoutMode: 'force',
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(cuts[0]!.region).toMatchObject({ start: 966_656, end: 1_064_960 })
})

async function forceGraph({
  windowStart = 1_000_000,
  windowBp = 60_000,
  paths = false,
  contig = CONTIG,
  track = 'graph',
  loopAtStart = false,
  loopInside = false,
  zigzag = 0,
} = {}) {
  const env = createEnvironment({
    paths,
    contig,
    loopAtStart,
    loopInside,
    zigzag,
  })
  const { view } = env
  view.zoomTo(windowBp / WIDTH_PX)
  view.scrollTo(windowStart / view.bpPerPx)
  view.showTrack(track, {}, { type: 'LinearGraphDisplay', layoutMode: 'force' })
  const pane = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  const layouts = () =>
    env.rpcCall.mock.calls.filter(
      ([, method]) => method === 'GraphComputeLayout',
    ).length
  const panTo = async (start: number) => {
    view.scrollTo(start / view.bpPerPx)
    await wait(SETTLE_MS)
  }
  return { ...env, pane, layouts, panTo }
}

// where the drawing puts reference bp: on the node holding it, inside the
// window whichever end of the window it is
function screenXOf(pane: LinearGraphDisplayModel, bp: number, end = false) {
  const node = pane.graph?.nodes.find(
    n =>
      n.stable?.rank === 0 &&
      (end
        ? n.stable.start < bp && bp <= n.stable.start + n.length
        : n.stable.start <= bp && bp < n.stable.start + n.length),
  )
  const line = node && pane.nodePositions?.[node.id]
  const [a, b] = line ?? []
  return node?.stable && a && b
    ? (a.x + ((b.x - a.x) * (bp - node.stable.start)) / node.length) *
        pane.scale +
        pane.translateX
    : undefined
}

function placement(pane: LinearGraphDisplayModel) {
  return {
    cut: pane.cutRegion,
    layout: pane.layoutResult,
    scale: pane.scale,
    translateX: pane.translateX,
    translateY: pane.translateY,
  }
}

test('a force layout does not cut again for a pan inside its snapped cut', async () => {
  const { view, pane, cuts, layouts, panTo } = await forceGraph()
  expect(cuts).toHaveLength(1)
  const layout = pane.layoutResult
  const laid = layouts()
  await panTo(1_002_000)
  await panTo(980_000)
  view.horizontalScroll(-100)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(layouts()).toBe(laid)
  expect(pane.layoutResult).toBe(layout)
})

test("the reference at the window's centre is drawn at the track's centre at every step of a pan inside the cut, the window's stretch its share of the widest stretch as wide as the view", async () => {
  const { view, pane, cuts } = await forceGraph()
  const { left, right } = pane.fitPads
  const centre = (left + pane.drawingWidth - right) / 2
  const scale = pane.scale
  for (const start of [1_000_000, 1_001_000, 985_000, 975_000, 970_000]) {
    view.scrollTo(start / view.bpPerPx)
    const seen = hostWindow(pane.host!)!
    const x0 = screenXOf(pane, seen.start)!
    const x1 = screenXOf(pane, seen.end, true)!
    expect((x0 + x1) / 2).toBeCloseTo(centre, 6)
    expect(x1 - x0).toBeCloseTo(pane.drawingWidth - left - right, 6)
    expect(pane.scale / scale).toBeCloseTo(1, 12)
    await wait(SETTLE_MS)
  }
  expect(cuts).toHaveLength(1)
})

test("a view past its sequence's start draws the reference's start where the ruler puts bp 0, so a pan there slides the drawing as one inside does", async () => {
  const { view, pane, cuts } = await forceGraph({ windowStart: 0 })
  const { left, right } = pane.fitPads
  const usable = pane.drawingWidth - left - right
  for (const px of [0, 50, 100]) {
    view.scrollTo(-px)
    expect(view.offsetPx).toBeCloseTo(-px, 9)
    expect(screenXOf(pane, 0)).toBeCloseTo(left + (usable * px) / WIDTH_PX, 6)
    await wait(SETTLE_MS)
  }
  expect(cuts).toHaveLength(1)
})

// The window's stretch of the reference and every node off it anchored
// inside the window, in pane px
function windowInk(pane: LinearGraphDisplayModel) {
  const seen = hostWindow(pane.host!)!
  const points: { x: number; y: number }[] = []
  for (const node of pane.graph!.nodes) {
    const line = pane.nodePositions?.[node.id] ?? []
    const start = node.stable?.start ?? -1
    const [a, b] = line
    if (node.stable?.rank === 0 && a && b) {
      const lo = Math.max(seen.start, start)
      const hi = Math.min(seen.end, start + node.length)
      for (const bp of hi > lo ? [lo, hi] : []) {
        const f = (bp - start) / node.length
        points.push(
          pane.toScreen({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }),
        )
      }
    } else if (start >= seen.start && start < seen.end) {
      for (const p of line) {
        points.push(pane.toScreen(p))
      }
    }
  }
  return {
    x0: points.reduce((m, p) => Math.min(m, p.x), Infinity),
    x1: points.reduce((m, p) => Math.max(m, p.x), -Infinity),
    y0: points.reduce((m, p) => Math.min(m, p.y), Infinity),
    y1: points.reduce((m, p) => Math.max(m, p.y), -Infinity),
  }
}

test('a zoom inside one level magnifies the held drawing as the view does, step by step, about the window centre, and clips nothing in the window', async () => {
  for (const paths of [false, true]) {
    const { view, pane, cuts } = await forceGraph({ paths })
    const cut = pane.cutRegion
    const { top, bottom } = pane.fitPads
    const first = pane.scale
    let before = { scale: first, span: 60_000 }
    for (const span of [58_000, 56_000, 54_000, 52_000, 50_000, 48_000]) {
      view.zoomTo(span / WIDTH_PX, WIDTH_PX / 2)
      await wait(SETTLE_MS)
      expect(pane.cutRegion).toEqual(cut)
      expect(pane.scale).toBeGreaterThanOrEqual(before.scale)
      if (!paths) {
        expect(pane.scale / before.scale).toBeCloseTo(before.span / span, 9)
      }
      const ink = windowInk(pane)
      expect(ink.x0).toBeGreaterThanOrEqual(0)
      expect(ink.x1).toBeLessThanOrEqual(pane.drawingWidth)
      expect(ink.y0).toBeGreaterThanOrEqual(top - 1e-6)
      expect(ink.y1).toBeLessThanOrEqual(pane.canvasHeight - bottom + 1e-6)
      before = { scale: pane.scale, span }
    }
    expect(before.scale).toBeGreaterThan(1.1 * first)
    expect(cuts).toHaveLength(1)
  }
}, 30_000)

test('a pan at any one width inside the level is a pure translation, and zoom then pan lands where pan then zoom does', async () => {
  const { view, pane, panTo } = await forceGraph({ paths: true })
  for (const span of [60_000, 54_000, 48_000]) {
    view.zoomTo(span / WIDTH_PX, WIDTH_PX / 2)
    await wait(SETTLE_MS)
    const { scale, translateY } = pane
    for (const start of [1_000_000, 1_002_000, 990_000]) {
      view.scrollTo(start / view.bpPerPx)
      expect(pane.scale / scale).toBeCloseTo(1, 12)
      expect(pane.translateY).toBeCloseTo(translateY, 9)
    }
    await wait(SETTLE_MS)
  }
  const at = (p: LinearGraphDisplayModel) => ({
    scale: p.scale,
    translateX: p.translateX,
    translateY: p.translateY,
  })
  await panTo(1_000_000)
  view.zoomTo(60_000 / WIDTH_PX, WIDTH_PX / 2)
  await wait(SETTLE_MS)
  await panTo(1_001_000)
  const zoomThenPan = at(pane)
  view.zoomTo(54_000 / WIDTH_PX, WIDTH_PX / 2)
  await panTo(995_000)
  view.zoomTo(60_000 / WIDTH_PX, WIDTH_PX / 2)
  await wait(SETTLE_MS)
  await panTo(1_001_000)
  const panThenZoom = at(pane)
  expect(panThenZoom.scale).toBeCloseTo(zoomThenPan.scale, 9)
  expect(panThenZoom.translateX).toBeCloseTo(zoomThenPan.translateX, 6)
  expect(panThenZoom.translateY).toBeCloseTo(zoomThenPan.translateY, 6)
}, 30_000)

// a track as short as it goes leaves the cut's height, rather than its
// width, to set the scale
async function heldSteps(height: number | undefined) {
  const windowBp = 60_000
  const { view, pane, layouts } = await forceGraph({ paths: true })
  if (height) {
    pane.setHeight(height)
  }
  const { top, bottom } = pane.fitPads
  const heightScale = (pane.canvasHeight - top - bottom) / pane.layoutBounds!.h
  const binds = pane.scale < heightScale - 1e-9 ? 'width' : 'height'
  const steps: { scale: number; translateY: number; same: boolean }[] = []
  let layout = pane.layoutResult
  for (let i = 1; i <= 20; i++) {
    view.scrollTo((1_000_000 + i * 0.05 * windowBp) / view.bpPerPx)
    await wait(SETTLE_MS)
    steps.push({
      scale: pane.scale,
      translateY: pane.translateY,
      same: pane.layoutResult === layout,
    })
    layout = pane.layoutResult
  }
  return { binds, steps, layouts: layouts() }
}

test('every held step of a 20-step pan is a pure translation, where the width sets the scale and where the height does', async () => {
  for (const [height, binds] of [
    [undefined, 'width'],
    [MIN_CANVAS_HEIGHT, 'height'],
  ] as const) {
    const held = await heldSteps(height)
    expect(held.binds).toBe(binds)
    const pairs = held.steps
      .slice(1)
      .map((step, i) => ({ step, before: held.steps[i]! }))
      .filter(({ step }) => step.same)
    expect(pairs.length).toBeGreaterThanOrEqual(15)
    for (const { step, before } of pairs) {
      expect(step.scale / before.scale).toBeCloseTo(1, 12)
      expect(step.translateY).toBeCloseTo(before.translateY, 9)
    }
  }
}, 60_000)

test('a force layout draws a window the same way however the view came to it', async () => {
  const { view, pane, cuts, panTo } = await forceGraph({ paths: true })
  await panTo(1_001_000)
  const fromTheLeft = placement(pane)
  await panTo(2_000_000)
  await panTo(1_001_000)
  const fromTheRight = placement(pane)
  expect(fromTheRight.cut).toEqual(fromTheLeft.cut)
  expect(fromTheRight.scale).toBeCloseTo(fromTheLeft.scale, 9)
  expect(fromTheRight.translateX).toBeCloseTo(fromTheLeft.translateX, 6)
  expect(fromTheRight.translateY).toBeCloseTo(fromTheLeft.translateY, 6)
  expect(pane.cutRegion).toMatchObject({ start: 966_656, end: 1_064_960 })
  expect(cuts).toHaveLength(2)

  const centre = view.offsetPx + WIDTH_PX / 2
  view.zoomTo(view.bpPerPx * 4, WIDTH_PX / 2)
  await wait(SETTLE_MS)
  expect(pane.cutRegion).not.toEqual(fromTheLeft.cut)
  view.zoomTo(view.bpPerPx / 4, WIDTH_PX / 2)
  await wait(SETTLE_MS)
  expect(view.offsetPx + WIDTH_PX / 2).toBeCloseTo(centre, 6)
  const zoomedBack = placement(pane)
  expect(zoomedBack.cut).toEqual(fromTheLeft.cut)
  expect(zoomedBack.scale).toBeCloseTo(fromTheLeft.scale, 9)
  expect(zoomedBack.translateX).toBeCloseTo(fromTheLeft.translateX, 6)
  expect(zoomedBack.translateY).toBeCloseTo(fromTheLeft.translateY, 6)
})

test('a snapped cut over the node limit falls back to the window alone, which a view always gets there however it came', async () => {
  const { view, pane, cuts, panTo } = await forceGraph({ paths: true })
  pane.setMaxGraphNodes(12)
  await wait(SETTLE_MS)
  const snappedAt = (start: number) =>
    cuts.filter(c => c.region.start === start).length
  expect(snappedAt(966_656)).toBeGreaterThan(0)
  expect(pane.cutRegion).toMatchObject({ start: 1_000_000, end: 1_060_000 })
  expect(pane.error).toBeUndefined()
  expect(pane.graph!.nodes.length).toBeLessThanOrEqual(12)
  const first = placement(pane)
  const asked = snappedAt(966_656)

  await panTo(1_200_000)
  expect(pane.cutRegion).toMatchObject({ start: 1_200_000, end: 1_260_000 })
  expect(pane.error).toBeUndefined()
  await panTo(1_000_000)
  const back = placement(pane)
  expect(back.cut).toEqual(first.cut)
  expect(back.scale).toBeCloseTo(first.scale, 9)
  expect(back.translateX).toBeCloseTo(first.translateX, 6)
  expect(back.translateY).toBeCloseTo(first.translateY, 6)
  expect(snappedAt(966_656)).toBe(asked)
  expect(view.bpPerPx).toBe(60)

  pane.setMaxGraphNodes(1000)
  await wait(SETTLE_MS)
  expect(pane.cutRegion).toMatchObject({ start: 966_656, end: 1_064_960 })
})

test('a snapped cut the adapter refuses over its node limit falls back to the window alone, with no zoom-in notice', async () => {
  const env = createEnvironment({ paths: true })
  env.setDenseAbove(80_000)
  const { view, cuts } = env
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'walks',
    {},
    { type: 'LinearGraphDisplay', layoutMode: 'force' },
  )
  const pane = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts.map(c => c.region.start)).toEqual([966_656, 1_000_000])
  expect(pane.cutRegion).toMatchObject({ start: 1_000_000, end: 1_060_000 })
  expect(pane.dense).toBeUndefined()
  expect(pane.displayPhase).not.toBe('tooLarge')
  expect(pane.graph).toBeDefined()
})

test('a snapped cut panned back to is drawn again without a fetch or a layout, for the last four cuts', async () => {
  const { pane, cuts, layouts, panTo } = await forceGraph()
  const first = { graph: pane.graph, layout: pane.layoutResult }
  await panTo(1_100_000)
  expect(cuts).toHaveLength(2)
  await panTo(1_000_000)
  expect(cuts).toHaveLength(2)
  expect(layouts()).toBe(2)
  expect(pane.graph).toBe(first.graph)
  expect(pane.layoutResult).toBe(first.layout)

  for (const start of [1_100_000, 1_200_000, 1_300_000, 1_400_000]) {
    await panTo(start)
  }
  expect(cuts).toHaveLength(5)
  await panTo(1_000_000)
  expect(cuts).toHaveLength(6)
  expect(pane.graph).not.toBe(first.graph)
})

test('a pan inside the held cut keeps the reference strip whole and true to the linear view, with edge marks where the graph runs on', async () => {
  const { view, pane, holdCuts } = await forceGraph()
  holdCuts()
  view.horizontalScroll(50)
  await wait(SETTLE_MS)
  const frame = pane.hostBpFrame!
  const blocks = pane.referenceStripBlocks
  expect(pane.referenceStripShown).toBe(true)
  for (const b of blocks) {
    expect(b.bp0 * frame.scale + frame.translateX).toBeCloseTo(
      lgvX(view, b.bp0),
      6,
    )
  }
  const pixels = stripPixels(blocks, frame, pane.paneWidth, 1)
  expect(pixels[0]!.x0).toBeLessThanOrEqual(0)
  expect(pixels.at(-1)!.x1).toBeGreaterThanOrEqual(pane.paneWidth)
  const over = stripOverhang(blocks, frame, pane.paneWidth)
  expect(over.left).toBeGreaterThan(0)
  expect(over.right).toBeGreaterThan(0)
  expect(pane.referenceStripOverhangs).toBe(true)
  expect(pane.graphKey.flatMap(s => s.entries.map(e => e.text))).toContain(
    "graph's reference continues past the pane edge",
  )
})

test('the reference strip draws no line to a selected node the drawing folds', async () => {
  const { pane } = await forceGraph()
  const node = pane.graph!.nodes.find(n => pane.nodeSpan(n.id))!.id
  pane.setSelectedNode(node)
  expect(pane.referenceStripLit?.anchor).toBeDefined()
  const { batch, view } = pane.buildDrawing(undefined, false)!
  pane.setGeometryMetrics(
    0,
    { ...batch, collapsed: { ...NO_FOLD, nodes: new Set([node]) } },
    view,
  )
  expect(pane.referenceStripLit).toMatchObject({ anchor: undefined })
})

test('a drawing placed by its window is clipped at the key column it runs under', async () => {
  const { pane, panTo } = await forceGraph()
  await panTo(970_000)
  pane.setLegendSize({ width: 120, height: 40 })
  await wait(0)
  const key = pane.paneWidth - pane.drawingWidth
  expect(key).toBe(120 + 2 * LEGEND_INSET_PX)
  expect(pane.drawingClip).toBe(`inset(0px ${key}px 0px 0px)`)
  const xs = Object.values(pane.nodePositions ?? {}).flatMap(line =>
    line.map(p => p.x * pane.scale + pane.translateX),
  )
  expect(xs.some(x => x > pane.drawingWidth)).toBe(true)
  await pane.switchLayout('auto')
  await wait(SETTLE_MS)
  expect(pane.drawingClip).toBeUndefined()
})

test("a track's SVG export is the scene its pane shows: the drawing beside the key at the track's height, framed as the screen frames it", async () => {
  const { pane, panTo } = await forceGraph()
  await panTo(970_000)
  pane.setLegendSize({ width: 120, height: 40 })
  await wait(0)
  const svg = pane.figure()!
  expect(svg).toContain(
    `width="${pane.drawingWidth}" height="${pane.canvasHeight}">`,
  )
  expect(pane.canvasHeight).toBeLessThan(pane.paneCeiling)
  const px = (v: number) => +v.toFixed(1)
  const drawnAt = (pane.graph?.nodes ?? [])
    .filter(n => n.stable?.rank === 0)
    .map(n => pane.nodePositions?.[n.id]?.[0])
    .filter(p => p !== undefined)
    .map(
      p =>
        `M${px(p.x * pane.scaleX + pane.translateX)} ${px(p.y * pane.scaleY + pane.translateY)}L`,
    )
  expect(drawnAt.length).toBeGreaterThan(0)
  expect(drawnAt.some(d => svg.includes(d))).toBe(true)
})

test('an rGFA force track folds by its snap level, so a zoom inside one cut folds as a fresh view of it does', async () => {
  const { view, pane, cuts } = await forceGraph()
  const foldAt = (span: number) =>
    Math.round((FOLD_PX * 2 ** (Math.ceil(Math.log2(span) * 2) / 2)) / WIDTH_PX)
  expect(pane.cutFoldBp).toBe(foldAt(60_000))
  view.zoomTo(50_000 / WIDTH_PX, WIDTH_PX / 2)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(pane.cutFoldBp).toBe(foldAt(50_000))
  const centre = view.offsetPx * view.bpPerPx + 25_000
  const fresh = await forceGraph({
    windowStart: centre - 25_000,
    windowBp: 50_000,
  })
  expect(fresh.pane.cutRegion).toEqual(pane.cutRegion)
  expect(fresh.pane.cutFoldBp).toBe(pane.cutFoldBp)
})

test('a layout switched to force right after a zoom, before the window settles, folds its one cut as a fresh force view of the new window does', async () => {
  const { view, pane, cuts } = await shownGraph()
  view.zoomTo(30_000 / WIDTH_PX, WIDTH_PX / 2)
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  const centre = view.offsetPx * view.bpPerPx + 15_000
  const fresh = await forceGraph({
    windowStart: centre - 15_000,
    windowBp: 30_000,
  })
  expect(pane.cutRegion).toEqual(fresh.pane.cutRegion)
  expect(pane.cutFoldBp).toBe(fresh.pane.cutFoldBp)
})

test('a 20-step pan at GSTM1 and at the amylase locus lays the graph out at most three times', async () => {
  for (const [start, end] of [
    [109_670_011, 109_705_011],
    [103_540_000, 103_780_000],
  ] as const) {
    const span = end - start
    const offset = (i: number) => Math.round((i - 10) * 0.05 * span)
    const { layouts, panTo } = await forceGraph({
      windowStart: start + offset(0),
      windowBp: span,
      contig: 250_000_000,
    })
    for (let i = 1; i <= 20; i++) {
      await panTo(start + offset(i))
    }
    expect(layouts()).toBeLessThanOrEqual(3)
  }
}, 60_000)

// Reset track settings, undo and the config editor write the deletions
// layer to the config, as setSlot does here
test('a force track lays out with the FMMM engine by default, and an engine setting from anywhere lays it out again', async () => {
  const { view, rpcCall } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    {
      type: 'LinearGraphDisplay',
      layoutMode: 'force',
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  const engines = () =>
    rpcCall.mock.calls
      .filter(c => c[1] === 'GraphComputeLayout')
      .map(c => c[2].options?.engine)
  expect(engines()).toEqual(['fmmm'])

  display.setLayoutEngine('stress')
  await vi.waitFor(() => {
    expect(engines()).toEqual(['fmmm', 'stress'])
  })

  display.configuration.setSlot('layers', { deletions: false })
  await vi.waitFor(() => {
    expect(engines()).toEqual(['fmmm', 'stress', 'stress'])
  })
})

test('a force track lays out for the pane it fits the drawing to: the width to the key column, and the track height less the reference strip', async () => {
  const sized = vi.spyOn(forceLayouts, 'layout')
  const { view } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    { type: 'LinearGraphDisplay', layoutMode: 'force' },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  const fits = () => sized.mock.calls.map(c => c[3])
  expect(fits()).toEqual([
    {
      width: display.paneWidth,
      height: 300 - REFERENCE_STRIP_ZONE_PX,
    },
  ])

  display.setLegendSize({ width: 200, height: 100 })
  display.resizeHeight(100)
  display.setLayoutEngine('stress')
  await vi.waitFor(() => {
    expect(fits()).toHaveLength(2)
  })
  expect(fits()[1]).toEqual({
    width: display.paneWidth - (200 + 2 * LEGEND_INSET_PX),
    height: 400 - REFERENCE_STRIP_ZONE_PX,
  })
  sized.mockRestore()
})

test('the drawing is the track height, and resizing the track resizes it', async () => {
  const { display } = await shownGraph()
  expect(display.height).toBe(300)
  expect(display.canvasHeight).toBe(300)
  display.resizeHeight(-100)
  expect(display.canvasHeight).toBe(200)
})

// KIV-2 and AMY2A lost the key's last row, the strip's edge tab, to the
// track's 300 px
test('a key taller than the track grows the track to show its last row, and a shrink after stays', async () => {
  const { display } = await shownGraph()
  expect(display.height).toBe(300)
  display.setLegendSize({ width: 200, height: 330 })
  expect(display.height).toBe(330 + 2 * LEGEND_INSET_PX)
  expect(display.canvasHeight).toBe(display.height)
  // the labels wait for the floor to be answered, which it is at once
  expect(display.answeredKeyFloor).toBe(display.canvasFloor)
  display.setLegendSize({ width: 200, height: 100 })
  expect(display.answeredKeyFloor).toBe(display.canvasFloor)

  display.resizeHeight(-100)
  expect(display.height).toBe(242)
})

test('a hosted drawing placed by its window lays the window beside the key, not under it', async () => {
  const { pane } = await shownGraph()
  await pane.switchLayout('force')
  await wait(SETTLE_MS)
  pane.setLegendSize({ width: 200, height: 100 })
  pane.zoomToFit()
  const seen = hostWindow(pane.host!)!
  expect(pane.keyColumnPx).toBe(200 + 2 * LEGEND_INSET_PX)
  expect(screenXOf(pane, seen.end, true)).toBeLessThanOrEqual(
    pane.paneWidth - pane.keyColumnPx - pane.fitPads.right + 1e-6,
  )
  expect(screenXOf(pane, seen.start)).toBeGreaterThanOrEqual(
    pane.fitPads.left - 1e-6,
  )
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
      layoutMode: 'force',
      encoding: { color: { value: 'uniform' } },
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.chosenLayoutMode).toBe('force')
  expect(display.chosenColorScheme).toBe('uniform')
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
    view.showTrack('graph', {}, { type: 'LinearGraphDisplay', layoutMode })
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
    {
      type: 'LinearGraphDisplay',
      encoding: { color: { value: 'uniform' } },
    },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.chosenColorScheme).toBe('uniform')
  expect(display.chosenLayoutMode).toBe('auto')
  expect(display.hostPlacesX).toBe(true)
})

// Config, not the display instance, so a share link, Edit plot and Reset
// track settings all see the choice. Every setter, so a setting wired into
// the view's props alone fails here.
test('a track config naming a layout mode, engine or hover this build lacks opens on the defaults, and the config editor still offers every choice', () => {
  const config = configSchemaFactory().create({
    type: 'LinearGraphDisplay',
    displayId: 'from-another-build',
    layoutMode: 'sideways',
    layoutEngine: 'neato',
    hover: 'glow',
  })
  const slots = ['layoutMode', 'layoutEngine', 'hover'] as const
  expect(slots.map(slot => readConfObject(config, slot))).toEqual([
    'force',
    'fmmm',
    'nodes',
  ])
  expect(
    slots.map(slot => slotChoices(getSlotDefinition(config, slot))),
  ).toEqual([LAYOUT_MODE_VALUES, LAYOUT_ENGINE_VALUES, HOVER_HIGHLIGHT_VALUES])
})

test('each grammar setter writes the track config, highlighted walks too, and the pane reads it back', async () => {
  const { display } = await shownGraph()
  display.setLayoutMode('ordered')
  display.setLayoutEngine('fmmm')
  display.setColorScheme('depth')
  display.setNodeWidth('uniform')
  display.setLinkWidth('walks')
  display.setLayer('bubbles', true)
  display.setFacet('walk')
  display.setWalkRowSamples(['HG1'])
  display.setWalkRowOrder('shared')
  display.setHover('off')
  display.setLinks('between')
  display.liftWalks(['HG1#1', 'HG2#1'])
  display.setWalkColor('HG2#1', { scheme: 'red' })
  display.toggleWalk('HG1#1')
  const slots = [
    'layoutMode',
    'layoutEngine',
    'encoding',
    'size',
    'layers',
    'rows',
  ] as const
  expect(
    Object.fromEntries(
      [...slots, 'hover' as const, 'links' as const, 'walks' as const].map(
        s => [s, readConfObject(display.configuration, s)],
      ),
    ),
  ).toEqual({
    layoutMode: 'ordered',
    layoutEngine: 'fmmm',
    encoding: { color: { field: 'depth' } },
    size: { value: 6, links: 'walks' },
    layers: { bubbles: true },
    rows: { kept: ['HG1'], order: 'shared' },
    hover: 'off',
    links: 'between',
    walks: [{ walk: 'HG2#1', color: { scheme: 'red' } }],
  })
  expect(readConfObject(display.configuration, ['facet', 'field'])).toBe('walk')
  expect([
    display.chosenLayoutMode,
    display.chosenLayoutEngine,
    display.chosenColorScheme,
    display.nodeWidth,
    display.linkWidth,
    display.showBubbles,
    display.facetSetting.field,
    display.walkRowSamples,
    display.chosenHover,
    display.chosenLinks,
    display.walkLayers,
  ]).toEqual([
    'ordered',
    'fmmm',
    'depth',
    'uniform',
    'walks',
    true,
    'walk',
    ['HG1'],
    'off',
    'between',
    [{ walk: 'HG2#1', color: { scheme: 'red' } }],
  ])
})

// Reset track settings, undo and the config editor write the slot without
// the menu, and the drawing still follows; the menu itself recuts once
test('a layout written to the config is drawn, and the menu recuts once', async () => {
  const { display, cuts } = await shownGraph()
  const before = cuts.length
  await display.switchLayout('walkrows')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 1)
  display.configuration.setSlot('layoutMode', 'auto')
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(before + 2)
  expect(display.hostPlacesX).toBe(true)
})

test('the graph view a track opens takes its hover too', async () => {
  const { display } = await shownGraph()
  display.setHover('everything')
  expect(display.graphViewSpec?.hover).toBe('everything')
})

test('the graph view a track opens highlights the walks the track does', async () => {
  const { display } = await shownGraph()
  display.liftWalks(['HG1#1'])
  expect(display.graphViewSpec?.walks).toEqual([{ walk: 'HG1#1' }])
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

test('a track whose config names no layout opens force-directed, drawn by FMMM', async () => {
  const { view } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('graph-bare', {}, { type: 'LinearGraphDisplay' })
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(display.chosenLayoutMode).toBe('force')
  expect(display.chosenLayoutEngine).toBe('fmmm')
  expect(display.usesLayoutEngine).toBe(true)
})

test('a config that picks stress opens with it, and the graph view it launches keeps it', async () => {
  const { view } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph-bare',
    {},
    { type: 'LinearGraphDisplay', layoutEngine: 'stress' },
  )
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(display.chosenLayoutEngine).toBe('stress')
  expect(display.graphViewSpec).toMatchObject({ layoutEngine: 'stress' })
})

test("a track naming its reference by an alias of the view's assembly cuts the window", async () => {
  const { view, cuts } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('graph-on-alias')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(display.error).toBeUndefined()
  expect(cuts).toHaveLength(1)
})

test('a GBZ track cuts for the lanes it names', async () => {
  const { view } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  expect(display.type).toBe('LinearGraphDisplay')
  expect(display.cutHaplotypes).toEqual(['HG1.1', 'HG2.1'])
})

function haplotypesMenu(display: LinearGraphDisplayModel) {
  return (
    display
      .trackMenuItems()
      .find(item => 'label' in item && item.label === 'Haplotypes') as {
      subMenu: { label: string; checked?: boolean; onClick: () => void }[]
    }
  ).subMenu
}

test("a GBZ track's Haplotypes menu cuts for every haplotype, the track's lanes, or a list", () => {
  const { view } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  const menu = () => haplotypesMenu(display)
  const checked = () => menu().find(item => item.checked)?.label
  expect(menu().map(item => item.label)).toEqual([
    'Load',
    'Every haplotype in the graph',
    "The track's 2 assemblies",
    'Chosen in Graph settings...',
  ])
  expect(checked()).toBe("The track's 2 assemblies")
  menu()[1]!.onClick()
  expect(display.cutHaplotypes).toEqual([])
  expect(checked()).toBe('Every haplotype in the graph')
  display.setSubgraphHaplotypes(['HG1.1'])
  expect(checked()).toBe('Chosen in Graph settings...')
  menu()[2]!.onClick()
  expect(display.cutHaplotypes).toEqual(['HG1.1', 'HG2.1'])
})

function walkIndexedDisplay(names?: string[] | null) {
  const env = createEnvironment()
  if (names !== undefined) {
    env.setHaplotypeNames(names ?? undefined)
  }
  const { view } = env
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walk-indexed')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  const menu = () => haplotypesMenu(display)
  return { ...env, display, menu }
}

test("a walk-indexed track's cut maps a lane assembly to its PanSN alias", () => {
  const { display } = walkIndexedDisplay()
  expect(display.sourceAdapter?.assemblyNameToPanSN).toEqual({
    'HG1.1': 'HG1#1',
    'HG2.1': 'HG2#1',
  })
})

test("a walk-indexed track cuts for its config's default haplotypes", async () => {
  const { display, menu } = walkIndexedDisplay()
  expect(display.cutHaplotypes).toEqual(['HG1', 'HG2#1'])
  await wait(0)
  expect(display.haplotypeNames).toEqual(['HG1#1', 'HG1#2', 'HG2#1'])
  expect(menu().map(item => item.label)).toEqual([
    'Load',
    'Every haplotype in the graph (3)',
    "The track's default haplotypes",
    'Chosen in Graph settings...',
  ])
  expect(menu().find(item => item.checked)?.label).toBe(
    "The track's default haplotypes",
  )
  menu()[1]!.onClick()
  expect(display.cutHaplotypes).toEqual([])
  menu()[2]!.onClick()
  expect(display.cutHaplotypes).toEqual(['HG1', 'HG2#1'])
})

test("a walk-indexed track's cut and the graph view it opens carry the default set", async () => {
  const { display, rpcCall } = walkIndexedDisplay()
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  const cut = rpcCall.mock.calls.find(([, method]) => method === 'GetSubgraph')
  expect(
    (cut?.[2] as { opts?: { haplotypes?: string[] } }).opts?.haplotypes,
  ).toEqual(['HG1', 'HG2#1'])
  expect(display.graphViewSpec?.subgraphHaplotypes).toEqual(['HG1', 'HG2#1'])
})

const isLinksRow = (
  item: MenuItem,
): item is Extract<MenuItem, { subMenu: unknown }> =>
  'subMenu' in item && item.label === 'Links drawn'

function linksMenu(display: LinearGraphDisplayModel) {
  const row = display.trackMenuItems().find(isLinksRow)
  const rows = Array.isArray(row?.subMenu) ? row.subMenu : []
  return row
    ? {
        disabled: row.disabled ?? false,
        rows: rows.flatMap(item =>
          'onClick' in item
            ? [
                {
                  label: String(item.label),
                  checked: 'checked' in item && item.checked,
                  pick: () => {
                    item.onClick()
                  },
                },
              ]
            : [],
        ),
      }
    : undefined
}

function linksAsked(rpcCall: Env['rpcCall']) {
  return rpcCall.mock.calls
    .filter(([, method]) => method === 'GetSubgraph')
    .map(([, , args]) => args.opts?.links)
}

async function shownWalkIndexed() {
  const env = walkIndexedDisplay()
  env.display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  return env
}

test('a walk-indexed track told nothing cuts for the links its haplotypes walk, and Links drawn offers both', async () => {
  const { display, rpcCall } = await shownWalkIndexed()
  expect(linksAsked(rpcCall)).toEqual(['walked'])
  expect(
    linksMenu(display)?.rows.map(({ label, checked }) => [label, checked]),
  ).toEqual([
    ['walked by the haplotypes shown', true],
    ['taken by any haplotype between the nodes shown', false],
  ])
})

test('picking the links any haplotype takes cuts the window again for them, and the graph view the track opens keeps the choice', async () => {
  const { display, rpcCall } = await shownWalkIndexed()
  const drawn = display.graph
  linksMenu(display)?.rows[1]?.pick()
  await wait(SETTLE_MS)
  expect(linksAsked(rpcCall)).toEqual(['walked', 'between'])
  expect(display.graph).not.toBe(drawn)
  expect(readConfObject(display.configuration, 'links')).toBe('between')
  expect(linksMenu(display)?.rows.map(item => item.checked)).toEqual([
    false,
    true,
  ])
  expect(display.graphViewSpec?.links).toBe('between')
})

test("links written by the config editor cuts again, and going back shows the cut kept for the walked links, never the other's", async () => {
  const { display, rpcCall } = await shownWalkIndexed()
  const walked = display.graph
  display.configuration.setSlot('links', 'between')
  await wait(SETTLE_MS)
  expect(linksAsked(rpcCall)).toEqual(['walked', 'between'])
  expect(display.graph).not.toBe(walked)
  display.configuration.setSlot('links', 'walked')
  await wait(SETTLE_MS)
  expect(display.graph).toBe(walked)
  expect(linksAsked(rpcCall)).toEqual(['walked', 'between'])
})

test('walk rows cut with no links setting, and Links drawn is greyed out under them', async () => {
  const { display, rpcCall } = await shownWalkIndexed()
  display.setLinks('between')
  await wait(SETTLE_MS)
  await display.switchLayout('walkrows')
  await wait(SETTLE_MS)
  const last = rpcCall.mock.calls.findLast(([, m]) => m === 'GetSubgraph')
  expect(last?.[2].opts).toMatchObject({ walkRows: true })
  expect(last?.[2].opts).not.toHaveProperty('links')
  expect(linksMenu(display)?.disabled).toBe(true)
  const cuts = linksAsked(rpcCall).length
  display.setLinks('walked')
  await wait(SETTLE_MS)
  expect(linksAsked(rpcCall)).toHaveLength(cuts)
})

test.each([
  ['force', 'between'],
  ['ordered', 'between'],
  ['auto', 'between'],
  ['samplerows', 'between'],
  ['walkrows', undefined],
  ['tubemap', undefined],
  ['tubemapref', undefined],
] as const)(
  'told between, a cut under %s carries links %s: only a layout that draws links asks for them',
  (layoutMode, links) => {
    const { display } = walkIndexedDisplay()
    display.setLinks('between')
    display.setLayoutMode(layoutMode)
    expect(display.cutOptions.links).toBe(links)
    expect(linksMenu(display)?.disabled).toBe(links === undefined)
  },
)

test('a track with no walk file offers no Links drawn', async () => {
  const { display } = await shownGraph()
  expect(linksMenu(display)).toBeUndefined()
})

test('a change of links forgets a refused cut, since the next cut reads other links', async () => {
  const { display } = await shownWalks(1_000_000, env => {
    env.setDenseAbove(1_500_000)
  })
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  display.setLinks('between')
  expect(display.dense).toBeUndefined()
})

test('haplotype names from a read since aborted are dropped', async () => {
  const { display } = walkIndexedDisplay()
  await wait(0)
  display.setHaplotypeNames(undefined)
  const stale = new AbortController()
  const read = display.fetchHaplotypeNames(display.sourceAdapter!, stale.signal)
  stale.abort()
  await read
  expect(display.haplotypeNames).toBeUndefined()
  await display.fetchHaplotypeNames(display.sourceAdapter!)
  expect(display.haplotypeNames).toEqual(['HG1#1', 'HG1#2', 'HG2#1'])
})

test('removing a walk-indexed track aborts its read of the haplotype names', () => {
  const { view, rpcCall } = walkIndexedDisplay()
  const read = rpcCall.mock.calls.find(
    ([, method]) => method === 'GetGraphHaplotypes',
  )
  const signal = read?.[2].signal
  expect(signal?.aborted).toBe(false)
  view.hideTrack('walk-indexed')
  expect(signal?.aborted).toBe(true)
})

test('a walk-indexed graph whose header names no haplotype counts none', async () => {
  const { display, menu } = walkIndexedDisplay(null)
  await wait(0)
  expect(display.haplotypeNames).toBeUndefined()
  expect(menu()[1]!.label).toBe('Every haplotype in the graph')
})

async function shownWalks(
  windowBp: number,
  setup?: (env: Env) => void,
  options?: Parameters<typeof createEnvironment>[0],
) {
  const env = createEnvironment(options)
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

function sentPanSN(rpcCall: Env['rpcCall'], method: string) {
  return rpcCall.mock.calls
    .filter(([, m]) => m === method)
    .map(
      ([, , args]) =>
        (args.adapterConfig as Record<string, unknown>).assemblyNameToPanSN,
    )
}

test("a GBZ track's cuts carry the PanSN names its lanes' assemblies alias, and an rGFA track's do not", async () => {
  const aliased = { 'HG1.1': 'HG1#1', 'HG2.1': 'HG2#1' }
  const cut = sentPanSN((await shownWalks(60_000)).rpcCall, 'GetSubgraph')
  expect(cut.length).toBeGreaterThan(0)
  expect(cut).toEqual(cut.map(() => aliased))
  const rgfa = sentPanSN((await shownGraph()).rpcCall, 'GetSubgraph')
  expect(rgfa).toEqual([undefined])
})

test('past the bp cap a GBZ track is too large to cut, as any graph track is, and zooming in cuts', async () => {
  const { view, display, cuts } = await shownWalks(6_000_000)
  expect(cuts).toHaveLength(0)
  expect(display.displayPhase).toBe('tooLarge')
  view.zoomTo(60_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
})

test('a cut over its node limit shows its zoom-in notice at that span and wider without cutting again, and zooming in cuts', async () => {
  const { view, display, cuts } = await shownWalks(1_000_000, env => {
    env.setDenseAbove(1_500_000)
  })
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  expect(cuts).toHaveLength(1)
  expect(display.dense!.end - display.dense!.start).toBe(1_000_000)
  expect(display.error).toMatchObject({ regionTooLarge: true })
  view.zoomTo(2_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  expect(display.error).toMatchObject({ regionTooLarge: true })
  view.zoomTo(400_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
  expect(display.error).toBeUndefined()
})

test('a cut no zoom fits is too large to show, and loading it anyway raises the byte budget to what it fetches, cutting once', async () => {
  const { view, display, cuts, rpcCall } = await shownWalks(60_000, env => {
    env.setUnzoomableBytes(45_600_000)
  })
  await vi.waitFor(() => {
    expect(display.displayPhase).toBe('tooLarge')
  })
  expect(display.regionTooLargeReason).toMatch(/even zoomed in/)
  expect(display.zoomCanReleaseGate).toBe(false)
  view.zoomTo(20_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(display.displayPhase).toBe('tooLarge')
  const refused = cuts.length
  display.forceLoad()
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(refused + 1)
  expect(display.forcedByteBudget).toBe(45_600_000)
  expect(display.displayPhase).not.toBe('tooLarge')
  const last = rpcCall.mock.calls.findLast(([, m]) => m === 'GetSubgraph')
  expect(last?.[2].opts?.forcedByteBudget).toBe(45_600_000)
})

test('a refused cut stands only near where it was refused: far along the contig the same zoom cuts again', async () => {
  const env = await shownWalks(1_000_000, e => {
    e.setDenseAbove(1_500_000)
  })
  const { view, display, cuts } = env
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  env.setDenseAbove(Infinity)
  view.scrollTo(7_000_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
})

test('a cut refused while the window moved stands for the moved window too, and is not tried again', async () => {
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
    expect(display.dense).toBeDefined()
  })
  await wait(SETTLE_MS)
  expect(env.cuts).toHaveLength(1)
  expect(display.error).toMatchObject({ regionTooLarge: true })
})

test('an outrun cut that lands after the newer one was refused leaves the refused window as it was', async () => {
  const env = createEnvironment()
  env.setDenseAbove(1_000_000)
  const answers = env.holdCuts()
  const { view } = env
  view.zoomTo(100_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack('walks')
  const display = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  display.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  view.zoomTo(1_000_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(env.cuts).toHaveLength(2)
  answers[1]!()
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  answers[0]!()
  await wait(0)
  expect(display.dense!.end - display.dense!.start).toBe(1_000_000)
})

test('editing the haplotypes forgets a refused cut, since the next cut is for other walks', async () => {
  const { display } = await shownWalks(1_000_000, env => {
    env.setDenseAbove(1_500_000)
  })
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  display.setSubgraphHaplotypes(['HG1.1'])
  expect(display.dense).toBeUndefined()
})

test('after a refused cut, a haplotype choice from the menu cuts the window again', async () => {
  const env = await shownWalks(1_000_000, e => {
    e.setDenseAbove(1_500_000)
  })
  const { display, cuts } = env
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  env.setDenseAbove(Infinity)
  haplotypesMenu(display)
    .find(item => item.label === 'Every haplotype in the graph')!
    .onClick()
  expect(cuts).toHaveLength(2)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
  expect(display.error).toBeUndefined()
})

test('after a refused cut, a context change cuts the window again', async () => {
  const env = await shownWalks(1_000_000, e => {
    e.setDenseAbove(1_500_000)
  })
  const { display, cuts } = env
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  env.setDenseAbove(Infinity)
  display.setSubgraphContext(0)
  expect(cuts).toHaveLength(2)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
})

test('on a graph with walks, a context change whose cut is refused leaves the window to cut again, and zooming in cuts', async () => {
  const env = await shownWalks(400_000, undefined, { paths: true })
  const { view, display, cuts } = env
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
  })
  env.setDenseAbove(500_000)
  display.setSubgraphContext(0)
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  expect(display.cutRegion).toBeUndefined()
  expect(display.error).toMatchObject({ regionTooLarge: true })
  const refused = cuts.length
  view.zoomTo(50_000 / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(cuts.length).toBeGreaterThan(refused)
  await vi.waitFor(() => {
    expect(display.hasGraph).toBe(true)
    expect(display.error).toBeUndefined()
  })
})

test('an rGFA track past the cap is too large, with no notice of a refused cut', async () => {
  const { pane, view } = await shownGraph({ tiered: false })
  view.zoomTo((pane.maxRegionBp * 2) / WIDTH_PX)
  await wait(SETTLE_MS)
  expect(pane.displayPhase).toBe('tooLarge')
  expect(pane.dense).toBeUndefined()
})

test('the track menu offers the layouts, colours and the settings dialog', async () => {
  const { display } = await shownGraph()
  const labels = display
    .trackMenuItems()
    .map(item => ('label' in item ? item.label : ''))
  expect(labels).toEqual(
    expect.arrayContaining([
      'Layout: Anchored',
      'Color: Auto (Reference position)',
      'Show',
      'Graph settings...',
    ]),
  )
})

const isLayoutRow = (
  item: MenuItem,
): item is Extract<MenuItem, { subMenu: unknown }> & { label: string } =>
  'subMenu' in item &&
  typeof item.label === 'string' &&
  item.label.startsWith('Layout: ')

function menuLayout(pane: LinearGraphDisplayModel) {
  const row = pane.trackMenuItems().find(isLayoutRow)!
  const rows = Array.isArray(row.subMenu) ? row.subMenu : row.subMenu()
  return {
    label: row.label,
    rows: rows.flatMap(item =>
      'onClick' in item
        ? [
            {
              label: String(item.label),
              checked: 'checked' in item && item.checked,
              disabled: item.disabled ?? false,
              why: item.disabled ? item.disabledHelpText : undefined,
              pick: () => {
                item.onClick()
              },
            },
          ]
        : [],
    ),
  }
}

// the switch's list as it is drawn, opened by a click on its last button
function switchLayout() {
  fireEvent.click(screen.getByTitle('Every layout'))
  return [
    ...screen.getByRole('menu').querySelectorAll('[role^="menuitem"]'),
  ].map(row => {
    const disabled = row.getAttribute('aria-disabled') === 'true'
    return {
      label: row.textContent,
      checked: row.getAttribute('aria-checked') === 'true',
      disabled,
      why: disabled
        ? (row.closest('[aria-label]')?.getAttribute('aria-label') ?? undefined)
        : undefined,
      pick: () => {
        fireEvent.click(row)
      },
    }
  })
}

const told = ({ pick: _pick, ...row }: ReturnType<typeof switchLayout>[0]) =>
  row

// the switch's two engine buttons, by the name each shows
function switchEngines() {
  return screen
    .getAllByRole('button')
    .filter(button => button.hasAttribute('aria-pressed'))
    .map(button => ({
      name: button.textContent,
      drawn: button.getAttribute('aria-pressed') === 'true',
      pick: () => {
        fireEvent.click(button)
      },
    }))
}

const drawnEngines = () =>
  switchEngines()
    .filter(engine => engine.drawn)
    .map(engine => engine.name)

test("the track's layout switch names its two buttons as the menu names the force engines, the one drawn pressed, and lists the menu's Layout list, the layouts the graph cannot draw disabled with the same words", async () => {
  const { pane } = await forceGraph()
  const menu = menuLayout(pane)
  render(createElement(LayoutSwitch, { model: pane }))
  expect(menu.label).toBe('Layout: Force-directed (FMMM)')
  expect(
    switchEngines().map(engine => `Force-directed (${engine.name})`),
  ).toEqual(
    menu.rows
      .map(row => row.label)
      .filter(label => label.startsWith('Force-directed')),
  )
  expect(drawnEngines()).toEqual(['FMMM'])
  expect(screen.getByTitle('Every layout').textContent).toBe('more▾')
  const listed = switchLayout().map(told)
  expect(listed).toEqual(menu.rows.map(told))
  expect(listed.filter(row => row.checked).map(row => row.label)).toEqual([
    'Force-directed (FMMM)',
  ])
  expect(listed.find(row => row.label === 'Tube map')).toMatchObject({
    disabled: true,
    why: expect.stringContaining('Needs P or W lines'),
  })
})

test("a button or a row of the track's layout switch runs the action the menu's row runs, and the menu follows", async () => {
  const { pane } = await forceGraph()
  const ran: { name: string; args?: unknown[] }[] = []
  onAction(pane, ({ name, args }) => {
    ran.push({ name, args })
  })
  const pickInMenu = (label: string) => {
    menuLayout(pane)
      .rows.find(row => row.label === label)!
      .pick()
    return ran.splice(0)[0]
  }
  render(createElement(LayoutSwitch, { model: pane }))
  const pickEngine = (name: string) => {
    switchEngines()
      .find(engine => engine.name === name)!
      .pick()
    return ran.splice(0)[0]
  }
  const pickInList = (label: string) => {
    switchLayout()
      .find(row => row.label === label)!
      .pick()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    return ran.splice(0)[0]
  }

  const stressByMenu = pickInMenu('Force-directed (stress)')
  const fmmmByMenu = pickInMenu('Force-directed (FMMM)')
  expect(pickEngine('stress')).toEqual(stressByMenu)
  expect(stressByMenu).toEqual({ name: 'switchForceEngine', args: ['stress'] })
  expect(pane.chosenLayoutEngine).toBe('stress')
  expect(menuLayout(pane).label).toBe('Layout: Force-directed (stress)')
  await waitFor(() => {
    expect(drawnEngines()).toEqual(['stress'])
  })
  expect(pickInList('Force-directed (FMMM)')).toEqual(fmmmByMenu)
  await waitFor(() => {
    expect(drawnEngines()).toEqual(['FMMM'])
  })

  expect(pickInList('Anchored')).toEqual({
    name: 'switchLayout',
    args: ['auto'],
  })
  expect(menuLayout(pane).label).toBe('Layout: Anchored')
  await waitFor(() => {
    expect(drawnEngines()).toEqual([])
  })
  expect(screen.getByTitle('Every layout').textContent).toBe('Anchored▾')
})

test("the layout switch heads the track's key column, and neither the graph genome view's pane nor the track's SVG export draws it", async () => {
  const { pane } = await forceGraph()
  const onTrack = renderToStaticMarkup(
    createElement(GraphCanvas, {
      model: pane,
      handle: { canvasRef: () => {}, canvas: null },
    }),
  )
  const at = onTrack.indexOf('data-testid="graph-layout-switch"')
  expect(at).toBeGreaterThan(-1)
  expect(at).toBeLessThan(onTrack.indexOf('-legend"'))
  expect(
    renderToStaticMarkup(createElement(GraphCanvas, { model: pane })),
  ).not.toContain('graph-layout-switch')
  const exported = renderToStaticMarkup(await pane.renderSvg())
  expect(exported).toContain('data-testid="graph-svg-keys"')
  expect(exported).not.toContain('graph-layout-switch')
  expect(exported).not.toContain('aria-pressed')
})

test('the track menu marks its launch submenu with a rocket', async () => {
  const { display } = await shownGraph()
  const launch = display
    .trackMenuItems()
    .find(item => 'label' in item && item.label === LAUNCH_LABEL)
  expect(launch && 'icon' in launch && launch.icon).toBe(RocketLaunchIcon)
})

test("the track's launches leave out a linear view of the view it sits in", async () => {
  const { display } = await shownGraph()
  expect(display.launchableAssemblies.map(c => c.sample)).toContain(ASM)
  const launch = display
    .trackMenuItems()
    .find(item => 'label' in item && item.label === LAUNCH_LABEL) as
    { subMenu: MenuItem[] } | undefined
  const labels = launch?.subMenu.map(item =>
    'label' in item ? String(item.label) : '',
  )
  expect(labels).toBeDefined()
  expect(labels!.some(label => label.startsWith('Linear genome view'))).toBe(
    false,
  )
})

function graphViewItem(display: LinearGraphDisplayModel) {
  const launch = display
    .trackMenuItems()
    .find(item => 'label' in item && item.label === LAUNCH_LABEL) as
    { subMenu: MenuItem[] } | undefined
  return launch?.subMenu.find(
    item => 'label' in item && item.label === 'Graph genome view',
  ) as
    | { disabled?: boolean; disabledHelpText?: string; onClick: () => void }
    | undefined
}

test('the track menu opens the window on screen in a graph genome view, drawn as the track draws it', async () => {
  const { view, display, addedViews } = await shownGraph()
  display.setLayoutMode('tubemapref')
  display.setLayoutQuality(3)
  display.setBubbleSpread('compress')
  display.setLinearLayout(true)
  display.setMaxGraphNodes(50_000)
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
    layoutEngine: 'fmmm',
    layoutQuality: 3,
    bubbleSpread: 'compress',
    linearLayout: true,
    maxGraphNodes: 50_000,
    connectedViewId: view.id,
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

test('the graph genome view a track opens takes every pane setting but where its viewport sits', async () => {
  const { display } = await shownGraph()
  display.setTubeMapFold(50)
  display.setTubeMapRoutes('bundled')
  display.setTubeMapColorBy('population')
  display.setRepeatTrackId('repeats')
  display.setRepeatKey('chr1:1-10')
  applyPatch(display, { op: 'replace', path: '/paneHeight', value: 300 })
  const spec = display.graphViewSpec!
  expect(spec).toMatchObject({
    tubeMapFold: 50,
    tubeMapRoutes: 'bundled',
    tubeMapColorBy: 'population',
    repeatTrackId: 'repeats',
    repeatKey: 'chr1:1-10',
    paneHeight: 300,
    connectorThickness: display.connectorThickness,
  })
  const viewport = ['scale', 'translateX', 'translateY']
  expect(Object.keys(spec)).toEqual(
    expect.arrayContaining(
      Object.keys(paneBase.properties).filter(key => !viewport.includes(key)),
    ),
  )
  for (const key of viewport) {
    expect(spec).not.toHaveProperty(key)
  }
})

test('after a cut refused over its node limit, the graph genome view launch is disabled', async () => {
  const env = await shownWalks(60_000)
  const { view, display } = env
  expect(graphViewItem(display)!.disabled).toBe(false)
  env.setDenseAbove(500_000)
  view.zoomTo(1_000_000 / WIDTH_PX)
  await vi.waitFor(() => {
    expect(display.dense).toBeDefined()
  })
  expect(display.hasGraph).toBe(true)
  expect(graphViewItem(display)).toMatchObject({
    disabled: true,
    disabledHelpText: 'Zoom in until the track cuts a graph',
  })
})

test('with two linear views on its assembly, a node shows and highlights in the one hosting the track', async () => {
  const { session, view, display, addedViews } = await shownGraph()
  const other = session.setOther(
    getType(view).create({
      type: 'LinearGenomeView',
      tracks: [],
    }) as typeof view,
  )
  other.setWidth(WIDTH_PX)
  other.setDisplayedRegions([
    { refName: REF, start: 0, end: CONTIG, assemblyName: ASM },
  ])
  expect(session.views).toHaveLength(2)
  expect(display.pairedViewId).toBe(view.id)
  expect(display.canHighlightInLinearView).toBe(true)
  display.showInLinearView({
    location: {
      sample: ASM,
      haplotype: undefined,
      refName: REF,
      start: 1_010_000,
      end: 1_011_000,
    },
    assembly: ASM,
  })
  expect(addedViews).toHaveLength(0)
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

// `pangenome_cactus/graph_bubble` filters its gene lane to `type == 'gene'`
// and still drew the IS1 element's chip over the graph, beside ANONYMOUS
test("the gene chips name what the gene lane draws, and never the molecule's source record", async () => {
  const { view, pane } = await shownGraph({
    geneLaneFilter: ["jexl:feature.type=='gene'"],
  })
  const names = () => pane.geneFeatures?.map(g => g.name)
  await wait(0)
  expect(names()).toEqual(['IS1', 'insB5'])
  view.showTrack('K12_genes')
  expect(names()).toEqual(['insB5'])
  view.hideTrack('K12_genes')
  expect(names()).toEqual(['IS1', 'insB5'])
})

test("the linear view's SVG export draws the graph through the screen's transform", async () => {
  const { pane } = await shownGraph()
  pane.setLayer('genes', false)
  const markup = renderToStaticMarkup(
    (await pane.renderSvg()) as React.ReactElement,
  )
  expect(markup).toContain('data-testid="graph-pane-svg"')
  expect(markup).toMatch(/<path d="M/)
  pane.setLayer('referenceStrip', false)
  await pane.switchLayout('tubemapref')
  await wait(SETTLE_MS)
  expect(
    renderToStaticMarkup((await pane.renderSvg()) as React.ReactElement),
  ).toContain('data-testid="graph-pane-svg"')
})

test('the SVG export clips a drawing placed by its window at the key column, as the screen does', async () => {
  const { pane } = await forceGraph()
  pane.setLegendSize({ width: 120, height: 40 })
  const markup = renderToStaticMarkup(
    (await pane.renderSvg()) as React.ReactElement,
  )
  const id = `graph-${pane.id}-drawing-clip`
  expect(markup).toContain(
    `<clipPath id="${id}"><rect width="${pane.drawingWidth}"`,
  )
  expect(markup).toContain(`clip-path="url(#${id})"`)
})

test('the SVG export greys what lies outside an open bubble, as the screen does', async () => {
  const { pane } = await shownGraph({ windowStart: 1_015_000, windowBp: 9000 })
  const exported = async () =>
    renderToStaticMarkup((await pane.renderSvg()) as React.ReactElement)
  const grey = 'stroke="rgb(160,160,160)"'
  expect(await exported()).not.toContain(grey)
  pane.toggleBubble(pane.bubbles[0]!)
  expect(await exported()).toContain(grey)
})

const offReference = (pane: LinearGraphDisplayModel) =>
  pane.graph!.nodes.filter(n => (n.stable?.rank ?? 0) > 0)

test('variants under ten pixels of the zoom fold into the reference, and zooming in shows them', async () => {
  const { view, pane, cuts } = await shownGraph()
  // 60 bp per pixel folds the synthetic graph's 100 bp alleles
  expect(offReference(pane)).toEqual([])
  expect(pane.foldNote).toBe('variants under 600 bp folded into the reference')
  // inside the cut's margins, but the fold it asks for is a hundredth
  view.zoomTo(600 / WIDTH_PX)
  view.scrollTo(1_030_000 / view.bpPerPx)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  expect(offReference(pane).length).toBeGreaterThan(0)
  expect(pane.foldNote).toBe('variants under 6 bp folded into the reference')
})

test('a folded drawing is clipped to the region it was cut for', async () => {
  const { pane, cuts } = await shownGraph({ windowStart: 1_003_000 })
  const { start, end } = cuts.at(-1)!.region
  const backbone = pane.graph!.nodes.filter(n => n.stable?.rank === 0)
  expect(backbone.length).toBeGreaterThan(0)
  for (const node of backbone) {
    expect(node.stable!.start).toBeGreaterThanOrEqual(start)
    expect(node.stable!.start + node.length).toBeLessThanOrEqual(end)
  }
})

test('a graph with walks is drawn whole at any zoom', async () => {
  const { pane } = await shownGraph({ paths: true })
  expect(offReference(pane).length).toBeGreaterThan(0)
  expect(pane.foldNote).toBeUndefined()
})

test('a force drawing is placed by its window alone: a pan only slides it, a zoom magnifies it before the next cut lands, and no screen map of the last frame stands in', async () => {
  const { view, pane, cuts } = await forceGraph()
  expect(pane.hostPlacesX).toBe(false)
  expect(pane.followsWindow).toBe(true)
  const { scale, translateX, translateY } = pane
  view.horizontalScroll(20)
  expect(pane.viewportOwner).toBe('fit')
  expect(pane.scale / scale).toBeCloseTo(1, 12)
  expect(pane.translateY).toBeCloseTo(translateY, 9)
  expect(pane.translateX).not.toBe(translateX)
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(1)
  view.zoomTo(view.bpPerPx / 2, WIDTH_PX / 2)
  expect(pane.scale / scale).toBeCloseTo(2, 6)
  expect(pane.fittedTransform).toMatchObject({
    scale: pane.scale,
    translateX: pane.translateX,
    translateY: pane.translateY,
  })
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(2)
  expect(pane.scale / scale).toBeCloseTo(2, 1)
})

function screenExtent(pane: LinearGraphDisplayModel) {
  const xs = Object.values(pane.nodePositions ?? {}).flatMap(line =>
    line.map(p => p.x * pane.scale + pane.translateX),
  )
  return {
    x0: xs.reduce((m, x) => Math.min(m, x), Infinity),
    x1: xs.reduce((m, x) => Math.max(m, x), -Infinity),
  }
}

test('a held cut is never refitted to a view it does not cover: a jump far along slides it away with the ruler until the new cut lands, and a jump to another sequence shows none of it', async () => {
  const { view, pane, holdCuts } = await forceGraph({ paths: true })
  const { scale, translateY } = pane
  const { left, right } = pane.fitPads
  const usable = pane.drawingWidth - left - right
  const ruler = (bp: number) => {
    const seen = hostWindow(pane.host!)!
    return left + (usable * (bp - seen.start)) / (seen.end - seen.start)
  }
  const answers = holdCuts()
  view.scrollTo(1_080_000 / view.bpPerPx)
  const off = pane.translateX
  expect(screenXOf(pane, 1_070_000, true)).toBeCloseTo(ruler(1_070_000), 6)
  view.scrollTo(1_090_000 / view.bpPerPx)
  expect(pane.translateX - off).toBeCloseTo((-10_000 * usable) / 60_000, 6)
  view.scrollTo(3_000_000 / view.bpPerPx)
  expect(pane.scale).toBe(scale)
  expect(pane.translateY).toBe(translateY)
  expect(screenExtent(pane).x1).toBeLessThan(0)
  await wait(SETTLE_MS)
  expect(answers.length).toBeGreaterThan(0)
  expect(pane.scale).toBe(scale)
  expect(screenExtent(pane).x1).toBeLessThan(0)

  view.setDisplayedRegions([
    { refName: 'chr2', start: 0, end: CONTIG, assemblyName: ASM },
  ])
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  expect(hostWindow(pane.host!)?.refName).toBe('chr2')
  expect(pane.graphRegion?.refName).toBe(REF)
  expect(screenExtent(pane).x0).toBeGreaterThan(pane.paneWidth)
})

test('in a flipped view a force track cuts and slides as the release line did, so its drawing moves with the ruler rather than against it', async () => {
  const { view, pane, cuts } = await forceGraph({ paths: true })
  expect(pane.snapsHostCut).toBe(true)
  view.horizontallyFlip()
  await wait(SETTLE_MS)
  expect(pane.snapsHostCut).toBe(false)
  expect(pane.followsWindow).toBe(false)
  const seen = hostWindow(pane.host!)!
  expect(cuts.at(-1)!.region).toMatchObject({
    start: Math.floor(seen.start),
    end: Math.ceil(seen.end),
  })
  const before = pane.translateX
  view.horizontalScroll(100)
  expect(pane.translateX - before).toBeCloseTo(-100, 6)
})

test('a restored force track fetches its snapped cut once, folded for the window it is restored into', async () => {
  const { view, cuts, signals } = createEnvironment()
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  const saved = {
    refName: REF,
    assemblyName: ASM,
    start: 966_656,
    end: 1_064_960,
  }
  view.showTrack(
    'graph',
    {},
    { type: 'LinearGraphDisplay', layoutMode: 'force', cutRegion: saved },
  )
  const pane = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts.map(c => c.region)).toEqual([saved])
  expect(signals.some(s => s.aborted)).toBe(false)
  const fresh = await forceGraph()
  expect(pane.cutFoldBp).toBe(fresh.pane.cutFoldBp)
})

test('a force track restored before its view shows a window waits for one, and fetches its cut once', async () => {
  const { view, cuts, signals } = createEnvironment()
  view.setDisplayedRegions([])
  const saved = {
    refName: REF,
    assemblyName: ASM,
    start: 966_656,
    end: 1_064_960,
  }
  view.showTrack(
    'graph',
    {},
    { type: 'LinearGraphDisplay', layoutMode: 'force', cutRegion: saved },
  )
  const pane = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(cuts).toHaveLength(0)
  runInAction(() => {
    view.setDisplayedRegions([
      { refName: REF, start: 0, end: CONTIG, assemblyName: ASM },
    ])
    view.zoomTo(60_000 / WIDTH_PX)
    view.scrollTo(1_000_000 / view.bpPerPx)
  })
  await wait(SETTLE_MS)
  expect(cuts.map(c => c.region)).toEqual([saved])
  expect(signals.some(s => s.aborted)).toBe(false)
})

test('a snapped cut over the node limit leaves the drawing on screen until the window alone lands, and the track never shows an error for it', async () => {
  const { pane, cuts, panTo } = await forceGraph({
    paths: true,
    windowStart: 1_380_000,
  })
  const states: { phase: string; drawn: boolean; error: unknown }[] = []
  const stop = reaction(
    () => ({
      phase: pane.displayPhase,
      drawn: pane.layoutResult !== undefined,
      error: pane.error,
    }),
    state => states.push(state),
    { fireImmediately: true },
  )
  // past 1.5 Mb the bubbles run eight ranks deep: a window alone there
  // holds 31 nodes and its snapped cut 51
  pane.setMaxGraphNodes(40)
  await wait(SETTLE_MS)
  for (let i = 1; i <= 16; i++) {
    await panTo(1_380_000 + i * 15_000)
  }
  stop()
  expect(pane.cutRegion).toMatchObject({ start: 1_620_000, end: 1_680_000 })
  expect(cuts.some(c => c.region.start === 1_620_000)).toBe(true)
  expect(states.length).toBeGreaterThan(1)
  expect(states.filter(s => !s.drawn)).toEqual([])
  expect(states.filter(s => s.phase === 'error' || s.error)).toEqual([])
}, 30_000)

test("a chain hanging off where the cut's start runs through a reference node, which no window the cut holds shows, does not shrink the drawing", async () => {
  const { pane } = await forceGraph({ paths: true, loopAtStart: true })
  expect(pane.graph!.nodes.filter(n => /l\d+/.test(n.id))).toHaveLength(24)
  const { top, bottom } = pane.fitPads
  const usable = pane.canvasHeight - top - bottom
  expect(pane.layoutBounds!.h).toBeGreaterThan(20 * pane.heldBounds!.h)
  expect(pane.scale).toBeGreaterThan((10 * usable) / pane.layoutBounds!.h)
  const ink = windowInk(pane)
  expect(ink.y0).toBeGreaterThanOrEqual(top - 1e-6)
  expect(ink.y1).toBeLessThanOrEqual(pane.canvasHeight - bottom + 1e-6)
})

test("a width that changes an rGFA cut's fold fetches the same snapped cut again, folded anew, rather than holding it or reusing the one folded for the old width", async () => {
  const { view, pane, cuts } = await forceGraph()
  const fold = pane.cutFoldBp
  const region = pane.cutRegion
  view.setWidth(990)
  await wait(SETTLE_MS)
  expect(pane.cutRegion).toEqual(region)
  expect(pane.cutFoldBp).not.toBe(fold)
  expect(cuts).toHaveLength(2)
})

test('a cut kept under other cut options is fetched again, not shown from the four kept', async () => {
  const { pane, cuts, panTo } = await forceGraph()
  await panTo(1_100_000)
  pane.setSubgraphContext(3)
  await panTo(1_000_000)
  expect(pane.cutRegion).toMatchObject({ start: 966_656 })
  expect(cuts.filter(c => c.region.start === 966_656).map(c => c.hops)).toEqual(
    [cuts[0]!.hops, 3],
  )
})

test('a cut kept under another reference path is fetched again, not shown from the four kept', async () => {
  const { pane, cuts, panTo } = await forceGraph({ paths: true })
  await panTo(1_100_000)
  pane.setReferencePath('HG1')
  await panTo(1_000_000)
  expect(cuts.filter(c => c.region.start === 966_656)).toHaveLength(2)
})

test("a cut kept from the track's other adapter is fetched again, not shown from the four kept", async () => {
  const { session, pane, cuts, panTo } = await forceGraph()
  await panTo(1_100_000)
  session.tracks[0]!.setSubschema('adapter', {
    type: 'RgfaTabixAdapter',
    uri: 'other',
  })
  expect(pane.sourceAdapter?.segmentsLocation).toMatchObject({
    uri: 'other.segs.bed.gz',
  })
  await panTo(1_000_000)
  expect(cuts.filter(c => c.region.start === 966_656)).toHaveLength(2)
})

test('a snapped cut found over the node limit stands for its own region, tier, fold and options alone, and the last 64 are remembered', async () => {
  const { view, pane, cuts, panTo } = await forceGraph({ paths: true })
  // past 1.5 Mb a window alone holds 31 nodes and its snapped cut 51
  pane.setMaxGraphNodes(40)
  const snappedHere = () => snappedCut(hostWindow(pane.host!)!)
  const asked = (start: number) =>
    cuts.filter(c => c.region.start === start).length
  await panTo(1_620_000)
  const deep = snappedHere()
  expect(pane.cutRegion).toMatchObject({ start: 1_620_000, end: 1_680_000 })
  expect(asked(deep.start)).toBe(1)
  await panTo(1_800_000)
  expect(pane.cutRegion).toMatchObject({ start: 1_800_000, end: 1_860_000 })
  await panTo(1_000_000)
  expect(pane.cutRegion).toMatchObject({ start: 966_656, end: 1_064_960 })
  await panTo(1_620_000)
  expect(pane.cutRegion).toMatchObject({ start: 1_620_000 })
  expect(asked(deep.start)).toBe(1)

  view.setWidth(990)
  await wait(SETTLE_MS)
  expect(snappedHere()).toEqual(deep)
  expect(asked(deep.start)).toBe(2)
  pane.setSubgraphContext(3)
  await panTo(1_000_000)
  await panTo(1_620_000)
  expect(asked(deep.start)).toBe(3)
  expect(pane.cutRegion).toMatchObject({ start: 1_620_000 })
}, 30_000)

test('a snapped cut wider than the bp cap is never asked for: the window is cut alone', async () => {
  const { pane, cuts, panTo } = await forceGraph()
  pane.setMaxRegionBp(80_000)
  await panTo(1_100_000)
  const snapped = snappedCut(hostWindow(pane.host!)!)
  expect(snapped.end - snapped.start).toBeGreaterThan(80_000)
  expect(cuts.some(c => c.region.start === snapped.start)).toBe(false)
  expect(pane.cutRegion).toMatchObject({ start: 1_100_000, end: 1_160_000 })
})

test("a drawing its window places and fits to the track sits centred between the pane's top and bottom pads, below the reference strip", async () => {
  const { pane } = await forceGraph({ paths: true })
  pane.setHeightMode('fit')
  const { top, bottom } = pane.fitPads
  expect(top).toBeGreaterThan(REFERENCE_STRIP_ZONE_PX)
  const bounds = pane.heldBounds!
  const y0 = bounds.minY * pane.scale + pane.translateY
  const y1 = (bounds.minY + bounds.h) * pane.scale + pane.translateY
  expect(y0 - top).toBeCloseTo(pane.canvasHeight - bottom - y1, 6)
  expect(y0).toBeGreaterThan(top + 1)
})

test('a drawing placed by its window is clipped at the key column on its canvas, its hover layer and its overlays alike', async () => {
  const { pane } = await forceGraph()
  pane.setLegendSize({ width: 120, height: 40 })
  await wait(0)
  const clip = `clip-path:${pane.drawingClip}`
  const tagOf = (markup: string, testId: string) =>
    new RegExp(`<[a-z]+ [^>]*data-testid="${testId}"[^>]*>`).exec(markup)?.[0]
  const canvas = renderToStaticMarkup(
    createElement(GraphCanvas, {
      model: pane,
      handle: { canvasRef: () => {}, canvas: null },
    }),
  )
  expect(tagOf(canvas, 'graph-genome-canvas')).toContain(clip)
  expect(tagOf(canvas, 'graph-hover-layer')).toContain(clip)
  const overlay = renderToStaticMarkup(
    createElement(PaneSvgLayer, {
      model: pane,
      zIndex: 2,
      testId: 'an-overlay',
    }),
  )
  expect(tagOf(overlay, 'an-overlay')).toContain(clip)
})

test('a force track restored with a viewport of its own is placed by its window once its cut lands, not where the session left the drawing', async () => {
  const { view } = createEnvironment({ paths: true })
  view.zoomTo(60_000 / WIDTH_PX)
  view.scrollTo(1_000_000 / view.bpPerPx)
  view.showTrack(
    'graph',
    {},
    {
      type: 'LinearGraphDisplay',
      layoutMode: 'force',
      cutRegion: {
        refName: REF,
        assemblyName: ASM,
        start: 966_656,
        end: 1_064_960,
      },
      scale: 2,
      translateX: 50,
    },
  )
  const pane = view.tracks[0]!.displays[0] as LinearGraphDisplayModel
  pane.startRenderingBackend(fakeRenderer())
  await wait(SETTLE_MS)
  expect(pane.layoutResult).toBeDefined()
  expect(pane.viewportOwner).toBe('fit')
  expect(pane.windowTransform).toMatchObject({
    scale: pane.scale,
    translateX: pane.translateX,
    translateY: pane.translateY,
  })
})

// The window's reference as drawn, in screen px
function windowReferenceInk(pane: LinearGraphDisplayModel) {
  const seen = hostWindow(pane.host!)!
  const ys: number[] = []
  for (const node of pane.graph!.nodes) {
    const [a, b] = pane.nodePositions?.[node.id] ?? []
    const start = node.stable?.start ?? -1
    const lo = Math.max(seen.start, start)
    const hi = Math.min(seen.end, start + node.length)
    if (node.stable?.rank === 0 && a && b && hi > lo) {
      for (const bp of [lo, hi]) {
        const f = (bp - start) / node.length
        ys.push(
          pane.toScreen({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f })
            .y,
        )
      }
    }
  }
  return {
    y0: ys.reduce((m, y) => Math.min(m, y), Infinity),
    y1: ys.reduce((m, y) => Math.max(m, y), -Infinity),
  }
}

test("the track's sizing is its heightMode slot, fixed unless set, and the track menu switches it", async () => {
  const { pane } = await forceGraph()
  expect(pane.heightMode).toBe('fixed')
  expect(pane.trackFit).toBe('fixed')
  const sizing = pane
    .trackMenuItems()
    .find(item => 'label' in item && item.label === 'Track sizing') as
    | { subMenu: (MenuItem & { label: string; onClick: () => void })[] }
    | undefined
  expect(sizing?.subMenu.map(item => item.label)).toEqual([
    TRACK_FIT_LABELS.fixed,
    TRACK_FIT_LABELS.grow,
    TRACK_FIT_LABELS.fit,
  ])
  sizing!.subMenu[2]!.onClick()
  expect(pane.heightMode).toBe('fit')
  expect(pane.trackFit).toBe('fit')
})

test("at fixed a zoom magnifies a drawing whose cut is taller than the track, which fit holds still at the track's height", async () => {
  const { view, pane } = await forceGraph({ loopInside: true, paths: true })
  pane.setHeightMode('fit')
  const { top, bottom } = pane.fitPads
  const usable = pane.canvasHeight - top - bottom
  expect(pane.heldBounds!.h * pane.scale).toBeCloseTo(usable, 6)
  const fitted = pane.scale
  view.zoomTo(view.bpPerPx / 1.2, WIDTH_PX / 2)
  expect(pane.scale).toBeCloseTo(fitted, 9)
  pane.setHeightMode('fixed')
  const fixed = pane.scale
  expect(fixed).toBeGreaterThan(2 * fitted)
  view.zoomTo(view.bpPerPx / 1.2, WIDTH_PX / 2)
  expect(pane.scale).toBeGreaterThan(fixed)
})

test("a drawing taller than a fixed track keeps the window's reference between the pads and marks the edges it runs past, which the key names", async () => {
  const { pane } = await forceGraph({ loopInside: true, paths: true })
  pane.setHeightMode('fixed')
  const { top, bottom } = pane.fitPads
  const ink = windowReferenceInk(pane)
  expect(ink.y0).toBeGreaterThanOrEqual(top - 1e-6)
  expect(ink.y1).toBeLessThanOrEqual(pane.canvasHeight - bottom + 1e-6)
  const marks = pane.edgeMarks!
  expect(marks.top.length + marks.bottom.length).toBeGreaterThan(0)
  expect(pane.runsPastEdge).toBe(true)
  const runsPast = pane.graphKey
    .flatMap(s => s.entries)
    .find(e => e.text === 'drawing continues above or below the pane')
  expect(runsPast?.swatch).toEqual({ kind: 'overrun' })
  pane.setHeightMode('fit')
  expect(pane.edgeMarks).toEqual({ top: [], bottom: [] })
})

test("a fixed track whose reference zigzags taller than the track draws it at the largest scale that keeps the reference any view-width window shows inside, and holds the window's own whole at every pan", async () => {
  const { view, pane } = await forceGraph({
    zigzag: 4,
    loopInside: true,
    paths: true,
  })
  pane.setHeightMode('fixed')
  const { top, bottom } = pane.fitPads
  const profile = pane.heldReference!
  const cut = pane.graphRegion!
  const span = pane.viewSpan!
  const width = pane.drawingWidth
  const pads = pane.followPads
  const scale = pane.scale
  expect(scale).toBeLessThan(windowScale(profile, cut, span, width, pads)! / 2)
  expect(scale).toBeGreaterThan(
    2 *
      cutScale(
        profile,
        cut,
        span,
        pane.heldBounds!,
        width,
        pane.canvasHeight,
        pads,
      )!,
  )
  expect(scale).toBeCloseTo(
    referenceScale(profile, cut, span, width, pane.canvasHeight, pads)!,
    9,
  )
  for (let step = 0; step < 4; step++) {
    const ink = windowReferenceInk(pane)
    expect(ink.y0).toBeGreaterThanOrEqual(top - 1e-6)
    expect(ink.y1).toBeLessThanOrEqual(pane.canvasHeight - bottom + 1e-6)
    expect(pane.scale).toBe(scale)
    view.horizontalScroll(-WIDTH_PX / 8)
    await wait(0)
  }
  pane.setHeightMode('grow')
  expect(pane.height).toBe(pane.growMaxHeight)
  expect(pane.scale).toBeCloseTo(
    referenceScale(profile, cut, span, width, pane.growMaxHeight, pads)!,
    9,
  )
  const grown = windowReferenceInk(pane)
  expect(grown.y0).toBeGreaterThanOrEqual(top - 1e-6)
  expect(grown.y1).toBeLessThanOrEqual(pane.canvasHeight - bottom + 1e-6)
})

test("at grow the track is as tall as the whole cut drawn at the window's scale, up to growMaxHeight, and at fixed the slot's height", async () => {
  const { pane } = await forceGraph({ loopInside: true, paths: true })
  expect(pane.height).toBe(300)
  pane.setHeightMode('grow')
  const wanted = grownHeight(pane.heldBounds!, pane.scale, pane.followPads)
  expect(wanted).toBeGreaterThan(pane.growMaxHeight)
  expect(pane.height).toBe(pane.growMaxHeight)
  expect(pane.canvasHeight).toBe(pane.growMaxHeight)
  const flat = await forceGraph()
  flat.pane.setHeightMode('grow')
  expect(flat.pane.height).toBe(
    Math.max(
      flat.pane.canvasFloor,
      grownHeight(flat.pane.heldBounds!, flat.pane.scale, flat.pane.followPads),
    ),
  )
  expect(flat.pane.height).toBeLessThan(300)
})

test('while a morph slides a re-cut in, the labels wait and the key holds the frame before it', async () => {
  const { pane } = await forceGraph()
  expect(pane.labelFrameSettled).toBe(true)
  expect(pane.graphKey.map(s => s.id)).not.toContain('too-small')
  const node = pane.graph!.nodes.find(
    n =>
      n.stable?.rank === 0 &&
      n.stable.start <= LOOP_BP &&
      LOOP_BP < n.stable.start + n.length,
  )!.id
  pane.setMorphing(true)
  expect(pane.labelFrameSettled).toBe(false)
  const { batch, view } = pane.buildDrawing(undefined, false)!
  const site = {
    nodes: [node],
    edges: [],
    refName: REF,
    start: LOOP_BP,
    end: LOOP_BP,
    bp: 1,
    x: (view.bounds.minX + view.bounds.maxX) / 2,
    y: (view.bounds.minY + view.bounds.maxY) / 2,
    count: 1,
    total: 2,
  }
  pane.setGeometryMetrics(
    0,
    { ...batch, collapsed: { ...NO_FOLD, sites: [site] } },
    view,
  )
  expect(pane.graphKey.map(s => s.id)).not.toContain('too-small')
  pane.setMorphing(false)
  expect(pane.labelFrameSettled).toBe(true)
  expect(pane.graphKey.map(s => s.id)).toContain('too-small')
})
