import { lazy } from 'react'

import { BUBBLE_SPREAD_VALUES } from '@jbrowse/bandage-core/bubbleSpreads'
import { createForceLayoutCache } from '@jbrowse/bandage-core/layout/forceCache'
import { LAYOUT_ENGINE_VALUES } from '@jbrowse/bandage-core/layoutEngines'
import { viewportOf } from '@jbrowse/bandage-core/viewport'
import { types } from '@jbrowse/mobx-state-tree'
import { RenderLifecycleMixin } from '@jbrowse/render-core/RenderLifecycleMixin'

import { lenientOptionalEnum } from '../lenientEnum'

import type { SubgraphRegion } from '../../GetSubgraph'
import type { WalkCut } from '../../RgfaTabixAdapter/walkRowRuns.ts'
import type { RepeatArray } from '../repeats/repeatFeatures'
import type { SampleRow } from '../walkRowGroups'
import type { MinigraphBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import type { GeneModel } from '@jbrowse/bandage-core/genes/genePins'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { Bounds } from '@jbrowse/bandage-core/pipeline'
import type { RenderBatch } from '@jbrowse/bandage-core/renderer/types'
import type { Graph, LayoutResult } from '@jbrowse/bandage-core/types'
import type { AxisScale } from '@jbrowse/bandage-core/util/geometry'
import type { WalkLayer } from '@jbrowse/bandage-core/walkEncoding'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation } from '@jbrowse/core/util/types'

// Ceiling on the pane, and what it falls back to before there is a layout to
// size against. A roughly square drawing (FMMM) hits this and keeps the
// scrollable pane it has always had.
export const MAX_CANVAS_HEIGHT = 600
// Floor, so a window holding only backbone — one row, no height at all — still
// leaves room to hover a node and read its tooltip.
export const MIN_CANVAS_HEIGHT = 160
// the pane's background, as the renderer clears to it and as CSS
export const PAPER_LIGHT: [number, number, number, number] = [1, 1, 1, 1]
export const PAPER_DARK: [number, number, number, number] = [
  0.12, 0.12, 0.12, 1,
]
export const paperCss = ([r, g, b]: number[]) =>
  `rgb(${[r, g, b].map(v => Math.round(v! * 255)).join(', ')})`
// The thinnest a fit draws a tube map's tubes
export const MIN_FIT_TUBE_PX = 5

export const TUBE_MAP_MODES = new Set<string>(['tubemap', 'tubemapref'])

export const ChooseSamplesDialog = lazy(
  () => import('../components/ChooseSamplesDialog'),
)
export const ChooseWalksDialog = lazy(
  () => import('../components/ChooseWalksDialog'),
)
export const HighlightColorDialog = lazy(
  () => import('../components/HighlightColorDialog'),
)

// Past this many walks the Haplotypes menu lists only the lifted ones and offers a
// searchable picker
export const WALK_MENU_ITEMS = 12

// The sizes a tube map folds variants under. MICB's 22 kb cut draws 475
// columns whole, 34 under 3 bp and one under 50, where only its structural
// variants would stand: human windows are mostly SNPs.
export const TUBE_MAP_FOLDS = [
  { bp: 0, label: 'None' },
  { bp: 3, label: 'Under 3 bp' },
  { bp: 10, label: 'Under 10 bp' },
  { bp: 50, label: 'Under 50 bp, leaving structural variants' },
  { bp: 1000, label: 'Under 1 kb' },
]

const SEGMENTS_SUFFIX = '.segs.bed.gz'

// The rGFA index prefix an adapter config names, from either spelling the
// config schema accepts: the `uri` shorthand or an explicit segments location.
export function bubblePrefix(adapterConfig: Record<string, unknown>) {
  if (typeof adapterConfig.uri === 'string') {
    return adapterConfig.uri
  }
  const segments = adapterConfig.segmentsLocation as
    { uri?: string } | undefined
  const uri = segments?.uri
  return typeof uri === 'string' && uri.endsWith(SEGMENTS_SUFFIX)
    ? uri.slice(0, -SEGMENTS_SUFFIX.length)
    : undefined
}
export const HOVER_BRIGHTEN = 1.15
export const SELECT_BRIGHTEN = 1.6
export const VIEWPORT_DEBOUNCE_MS = 150
export const VIEWPORT_PANES_BUILT = 1
// How many walk rows read their haplotype's genes, the first rows down
export const WALK_GENE_ROWS = 40

// What the canvas draws under the tube map, whose ink is all TubeMapOverlay's
export const EMPTY_BATCH: RenderBatch = {
  nodeStrokes: [],
  nodeStrokeRuns: new Map(),
  arrows: [],
  arrowRuns: new Map(),
  edgeCurves: [],
  edgeCurveRuns: new Map(),
}

// MobX tracks every observable read while a computed or autorun runs, so
// passing values here registers them as dependencies without otherwise using
// them.
export function dependOn(..._values: unknown[]) {}

// Hard size cap for the single-mode graph view. Past it the view declines with a
// "zoom in" message rather than switching to a degraded rendering mode — one mode
// only, since the large-region case is a linear synteny view, not a graph.
// (The `adr-027` citation this used to carry was stale: that number was reused
// for wheel-input semantics after the large-mode ADR was removed in 9d8102f0b5.)
//
// This bounds the *fetch*, and it is the only cap that can be applied before one
// happens. It is a poor proxy for cost, because cost tracks node count, so the
// number is chosen against the density of the graphs it can actually guard: a
// region is fetched through `getSubgraph`, and the rGFA cut is what this number
// was chosen against (the GBZ cut is base-level and has its own `nodeLimit`,
// which trips long before 5 Mb). Both measured rGFAs are sparse, and at 5 Mb
// both land at or under the ~2k nodes that redraw in under 10 ms (see agent-docs/reference/GRAPH_SCALE_AND_LOD.md):
//
//   HPRC MC GRCh38   ~7,000 bp/segment   whole 4.9 Mb MHC   1,173 nodes
//   ecoli minigraph   3,078 bp/segment   whole 4.6 Mb genome 2,415 nodes
//
// Fetch cost does not scale with the window either: against the hosted HPRC
// index a 4.9 Mb links query and a 100 kb one both cost ~1.3 s, being dominated
// by HTTP setup. FMMM is the slowest consumer at this size and stays tolerable,
// ~0.1-3 s for ~1k nodes depending on layout quality (bandage-layout-js), and it
// runs off the main thread.
//
// A dense graph is what this cannot protect against, because bp per node varies
// by orders of magnitude between graph types — a base-level pggb graph runs ~17
// bp/node, where 5 Mb would be hundreds of thousands. Such a graph has no region
// query to reach this check with today, and the node budget below is the cap that
// catches it if one ever does.
export const MAX_GRAPH_REGION_BP = 5_000_000

// The cap in a message, in the unit that reads: `5 Mb`, not `5000 kb`.
export function formatSpanBp(bp: number) {
  return bp >= 1_000_000
    ? `${+(bp / 1_000_000).toFixed(1)} Mb`
    : `${Math.round(bp / 1000)} kb`
}

// What the view will actually draw, checked once the graph is parsed and so
// applying to a whole-file import as much as to a subgraph fetch. Measured on
// bubble-chain graphs: ~1-2k nodes redraws in under 10 ms, 10k takes ~43 ms of
// geometry and ~125k canvas draw calls per frame (single-digit fps while
// panning), and 100k needs 632 ms and 75 MB of vertex buffers. So this is set
// where the tab stops being usable rather than where it stops being smooth, and
// it is a view prop rather than a constant so a session can raise it — the same
// escape hatch strangepg gives with `-T N`.
export const DEFAULT_MAX_GRAPH_NODES = 20_000

// A url bandage-figure can read again, or undefined for a local file
// the last segment of a file's path, its query dropped, or a blob's own name
export function fileName(location: FileLocation) {
  const path =
    'uri' in location
      ? location.uri.split(/[?#]/)[0]!
      : 'localPath' in location
        ? location.localPath
        : 'name' in location
          ? location.name
          : ''
  return path.split(/[\\/]/).at(-1) ?? ''
}

export function uriOf(location: FileLocation | undefined) {
  return location && 'uri' in location && location.uri
    ? new URL(location.uri, location.baseUri ?? window.location.href).href
    : undefined
}

type ViewportOwner = 'fit' | 'user' | 'host'

interface BuiltViewport {
  scale: number
  bounds: Bounds
  viewportDirty: number
}

export function geometryPainted(model: {
  viewportRebuildPending: boolean
  viewportDirty: number
  builtViewport?: BuiltViewport
  paintedViewport?: BuiltViewport
}) {
  return (
    model.builtViewport !== undefined &&
    model.paintedViewport === model.builtViewport &&
    model.builtViewport.viewportDirty === model.viewportDirty &&
    !model.viewportRebuildPending
  )
}

// What the pane shows, in layout units: what each panel shows while faceted
export function paneViewportOf(model: {
  translateX: number
  translateY: number
  axisScale: AxisScale
  viewBox: { width: number; height: number }
}): Bounds {
  const { width, height } = model.viewBox
  return viewportOf(model, model.axisScale, width, height)
}

// Force layouts already computed for a graph, keyed by the view props the
// engine reads. Every layout mode is local and costs a millisecond except this
// one, which is seconds: measured on the committed engine, a 1,201-node bubble
// chain is 0.6 s proportional, 4.3 s at 'Wide bubbles' and 3.4 s at the highest
// quality.
//
// Worth keeping because a session revisits the same layout. The two drawings
// answer different questions and the README's own figure is one subgraph in
// both, so Anchored <-> Force is a round trip a reader makes repeatedly — and
// every control in the settings dialog calls `recomputeLayout` on change
// whether or not the current mode reads what it changed, which made picking a
// reference path in force mode a multi-second re-run of an identical layout.
// Both are hits. The cache itself is core's, which BandageJS keeps too.
export const forceLayouts = createForceLayoutCache()

export const paneBase = types
  .compose(
    'GraphPane',
    RenderLifecycleMixin(),
    types.model({
      // FMMM's iteration budget, 0-4, the same scale Bandage's own settings
      // dialog exposes: 3+1 iterations at 0, 15+10 at 1, 30+20 at 2, 60+40 at
      // 3, 120+60 at 4 (BandageNG layout/graphlayoutworker.cpp).
      //
      // 2 because that is what the engine we vendor ships as its default
      // (`graphLayoutQuality = IntSetting(2, 0, 4)`, program/settings.cpp).
      // This was 1 for no recorded reason, i.e. one step BELOW upstream, and a
      // first sight of any graph is the default: review kept asking whether
      // the drawing could be iterated more ("are you sure you can't iterate it
      // more times for better layout?") of figures that were simply on a lower
      // setting than the tool they come from. Cost at the sizes this view
      // draws is milliseconds, and the header states the layout time so the
      // difference is visible rather than asserted.
      layoutQuality: types.optional(types.number, 2),
      // Which engine draws the force layout: Bandage's FMMM, or the stress
      // layout, which reads the reference straight. See LAYOUT_ENGINES.
      layoutEngine: lenientOptionalEnum(LAYOUT_ENGINE_VALUES, 'fmmm'),
      linearLayout: types.optional(types.boolean, false),
      // How far the force layout opens a bubble, which on a variation graph is
      // the difference between a legible drawing and a rope. See
      // BUBBLE_SPREADS; no effect on the reference-anchored layouts, which
      // place a node from its coordinates rather than from a force sim.
      bubbleSpread: lenientOptionalEnum(BUBBLE_SPREAD_VALUES, 'auto'),
      // Variants under this many bp fold into the reference before a tube map
      // is laid out, each kept as a tick on its walk's tube (coarsen.ts); 0
      // draws every one
      tubeMapFold: types.optional(types.number, 0),
      // Which track the genes come from; empty picks the assembly's
      // annotation track (pickGeneTrack).
      geneTrackId: types.optional(types.string, ''),
      // Which track the walk rows read tandem repeat arrays from; empty
      // picks a track whose name says repeats (pickRepeatTrack).
      repeatTrackId: types.optional(types.string, ''),
      // The array the walk rows measure between and tile by, as
      // RepeatArray.key; empty measures the whole window untiled.
      repeatKey: types.optional(types.string, ''),
      // Walks lifted out of the drawing, each a layer with a lane of its own
      // and the rest fading, coloured by the encoding it states or by the
      // default one. See walkEncoding.ts. Empty lifts none.
      walkLayers: types.optional(types.frozen<WalkLayer[]>(), []),
      // Which of a general GFA's paths the anchored layouts put on x. A path
      // GFA's names are arbitrary and none of them is marked as the
      // reference, so this is a choice; empty means "infer", which is the
      // assembly a subgraph was cut against, and the first path in the file
      // for a whole-file import. No effect on an rGFA, whose segments carry
      // their own coordinates. See pathAnchoring.ts.
      referencePath: types.optional(types.string, ''),
      // Whether the toolbar spells out `fetch 12371ms · layout 4ms · geom 9ms`.
      // Off by default because it was in the toolbar of every published graph
      // figure, where a machine's fetch time is noise a reader has to skip
      // past. The numbers themselves are always on the element as `data-*`
      // attributes, which is what browser tests assert against, so hiding the
      // text costs no coverage.
      showPerf: types.optional(types.boolean, false),
      connectorThickness: types.optional(types.number, 2),
      scale: types.optional(types.number, 1),
      translateX: types.optional(types.number, 0),
      translateY: types.optional(types.number, 0),
      // Ceiling on the drawing pane, in css px, for a session or a figure that
      // wants a shorter one than the drawing asks for. Unset means the built-in
      // MAX_CANVAS_HEIGHT, which is what every existing session gets.
      //
      // Why this is a knob rather than a smaller default: the pane is as tall
      // as the drawing's own aspect ratio (see canvasHeight), which is right —
      // a graph that is twice as tall as it is wide should not be squeezed
      // into a strip. But one very long node in a cut of short ones makes that
      // aspect ratio all arc: the HPRC CHM13 figure draws a 142 kb allele
      // among sub-kb backbone segments, pins the 600 px ceiling and spends
      // most of it on the loop, with the chain squashed along the bottom edge.
      // Lowering the ceiling there scales the whole drawing down, which is
      // exactly the trade that figure wants and the wrong default for a graph
      // whose height is carrying information.
      paneHeight: types.maybe(types.number),
      // Raise to draw a bigger graph than the default budget allows; see
      // DEFAULT_MAX_GRAPH_NODES for what the numbers cost.
      maxGraphNodes: types.optional(types.number, DEFAULT_MAX_GRAPH_NODES),
      // the linear view a graph of its own is paired with for the hover sync
      connectedViewId: types.maybe(types.string),
    }),
  )
  .volatile(() => ({
    graph: undefined as Graph | undefined,
    // a walk-rows cut's tables and runs, which draw the rows in place of the
    // graph's walks
    walkCut: undefined as WalkCut | undefined,
    // the reference window the graph on screen was cut for, set with it
    graphRegion: undefined as SubgraphRegion | undefined,
    // The walk the track's graph lies on for the region's assembly, which
    // the track's config declares; x starts along it unless the user chose
    // another. Undefined for an rGFA, whose backbone is fixed, and for a
    // graph with no region.
    loadedReferencePath: undefined as string | undefined,
    layoutResult: undefined as LayoutResult | undefined,
    // what the legends in the pane's top-right corner measure, so no label
    // is placed under them
    legendSize: { width: 0, height: 0 },
    // The bubble index rows over the cut window, when the source track has
    // one beside its segments. Undefined for a graph with no index, whose
    // bubbles are `derivedBubbles` instead.
    indexBubbles: undefined as MinigraphBubble[] | undefined,
    // the gene track's features over the cut window, read once per cut
    geneTrackFeatures: undefined as Feature[] | undefined,
    // each walk row's genes, read from its haplotype's own assembly, by walk
    // name
    walkGeneFeatures: undefined as Map<string, GeneModel[]> | undefined,
    // the source track's samples TSV, which walk rows group by
    walkRowSampleTable: undefined as SampleRow[] | undefined,
    // the tandem repeat arrays over the cut window, from the repeat track
    repeatArrays: undefined as RepeatArray[] | undefined,
    // The graphs the open bubble was popped out of, outermost first, each
    // with what closing back to it restores without a refetch. A stack so a
    // popped superbubble can be mapped and popped again.
    // the layout mode the drawing was last laid out for, so a change from the
    // menu is not laid out a second time by the reaction that catches the rest
    handledLayoutMode: undefined as LayoutModeValue | undefined,
    popStack: [] as {
      graph: Graph
      layoutMode: LayoutModeValue
      label: string
      indexBubbles: MinigraphBubble[] | undefined
    }[],

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    error: undefined as unknown,
    isLoading: false,
    loadCanceled: false,
    statusMessage: '',
    hoveredNode: null as string | null,
    // the walks of the per-sample lane row the linear view's pointer is on
    hoveredRowWalks: [] as string[],
    // the bubble whose label the pointer is on
    hoveredBubble: null as MinigraphBubble | null,
    // whether the pointer is over this pane, whose own hit test then says
    // what it is on
    pointerInPane: false,
    // the strip point the pointer is over, which lights its node above
    stripHover: null as { row: string; offset: number } | null,
    // the walk row the pointer is on, by walk name
    hoveredWalkRow: null as string | null,
    hoveredEdge: null as number | null,
    selectedNode: null as string | null,
    viewportDirty: 0,
    // Bumped when the layout's positions are mutated IN PLACE, which only a
    // node drag does. Separate from `viewportDirty` because that one also
    // fires on pan and zoom, and the things keyed off this — the two hit
    // indexes and the label placement's per-layout caches — do not depend on
    // the transform at all. Rebuilding a 12k-edge hit index because the user
    // panned cost ~14 ms of the first mousemove after every gesture.
    positionsVersion: 0,
    // Bumped per upload, so the hover autorun re-states its highlights
    // against the batch the renderer now holds.
    geometryVersion: 0,
    // The zoom and the window the current batch was built for; a pan that
    // stays inside it needs no rebuild.
    builtViewport: undefined as BuiltViewport | undefined,
    // The builtViewport whose batch is on the canvas
    paintedViewport: undefined as BuiltViewport | undefined,
    draggingNode: null as string | null,
    // Dragging the background rather than a node. Lives here beside
    // draggingNode instead of in a component ref+state pair, so the two
    // mutually exclusive drag modes are one piece of state read from one place.
    isPanning: false,
    // Who places the view. 'fit' refits it to every new layout, 'user' leaves
    // it where a gesture or a restored session put it, and 'host' takes x
    // from the linear view the pane sits in. Not derived from
    // `isDefaultViewport`, which zoomToFit itself invalidates on its first
    // run — that made the fit fire once against not-yet-measured dimensions
    // and then never re-fit.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    viewportOwner: 'fit' as ViewportOwner,
    viewportDirtyTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    // 0 is never a live rAF handle, so it doubles as "nothing pending"
    positionsDirtyFrame: 0,
    // Performance instrumentation, surfaced in GraphStats for browser tests
    // to assert against budgets. `fetchMs` is the GetSubgraph RPC round-trip,
    // `layoutMs` is the Bandage FMMM compute time reported by the
    // GraphComputeLayout RPC, `geometryMs` is the main-thread buildGeometry
    // pass and `geometryStrokeCount` the node strokes it produced.
    lastFetchMs: undefined as number | undefined,
    // how many of the cut's reads the tube map was handed, of how many
    readsShown: undefined as { shown: number; total: number } | undefined,
    lastLayoutMs: undefined as number | undefined,
    lastGeometryMs: undefined as number | undefined,
    lastGeometryStrokeCount: undefined as number | undefined,
    viewportRebuildPending: false,
  }))
