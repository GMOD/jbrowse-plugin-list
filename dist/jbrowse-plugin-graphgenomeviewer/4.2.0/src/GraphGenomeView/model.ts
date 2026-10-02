import {
  backboneNodes,
  backboneSpan,
} from '@jbrowse/bandage-core/anchoredNodes'
import { BUBBLE_SPREAD_VALUES } from '@jbrowse/bandage-core/bubbleSpreads'
import { bubbleHalos } from '@jbrowse/bandage-core/bubbles/bubbleHalos'
import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { bubblesFromGraph } from '@jbrowse/bandage-core/bubbles/bubblesFromGraph'
import {
  BUBBLE_KIND_NAMES,
  bubbleSegmentIds,
  classifyBubble,
} from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { bubbleSubgraph } from '@jbrowse/bandage-core/bubbles/popBubble'
import {
  COLOR_SCHEMES,
  COLOR_SCHEME_VALUES,
  resolveColorScheme,
} from '@jbrowse/bandage-core/colorSchemes'
import { deletionEdges } from '@jbrowse/bandage-core/deletionEdges'
import {
  FACET_PAD_PX,
  facetCells,
  facetGrid,
  facetSettingOf,
} from '@jbrowse/bandage-core/facetGrid'
import { figureSvg } from '@jbrowse/bandage-core/figure'
import { genePins } from '@jbrowse/bandage-core/genes/genePins'
import { rowLabelBox } from '@jbrowse/bandage-core/graphLabels'
import {
  LEGEND_INSET_PX,
  layoutLabels,
} from '@jbrowse/bandage-core/labelLayout'
import { ROW_HEIGHT_PX } from '@jbrowse/bandage-core/layout/rowSpacing'
import { trimToWindow } from '@jbrowse/bandage-core/layout/trimToWindow'
import {
  BAR_PX as WALK_BAR_PX,
  placeRowGenes,
  rowSpan,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { walkRowsExtent } from '@jbrowse/bandage-core/layout/walkRowLayout'
import { walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import {
  LAYOUT_MODES,
  LAYOUT_MODE_VALUES,
  layoutModeByValue,
  modeUsesLayoutEngine,
} from '@jbrowse/bandage-core/layoutModes'
import { NODE_WIDTH_VALUES, nodeInk } from '@jbrowse/bandage-core/nodeWidths'
import {
  anchorFromPaths,
  chooseReferencePath,
} from '@jbrowse/bandage-core/pathAnchoring'
import {
  pathColorsLegible,
  pathGreyCssColor,
  pathLegend,
} from '@jbrowse/bandage-core/pathColors'
import {
  FIT_PADDING,
  clampZoom,
  drawingBounds,
  engineKey,
  fitTransform,
  fittedTranslateY,
  forceLayout,
  loadGraph,
} from '@jbrowse/bandage-core/pipeline'
import {
  assemblyWalk,
  backboneAssembly,
  featuresOnBackbone,
  graphBackbone,
} from '@jbrowse/bandage-core/reference'
import {
  buildNeighbors,
  nodeReferenceSpan,
} from '@jbrowse/bandage-core/referenceSpan'
import {
  REFERENCE_STRIP_ZONE_PX,
  nodeAnchor,
  referenceStripBlocks,
  stripBlockAt,
  stripOverhang,
} from '@jbrowse/bandage-core/referenceStrip'
import {
  LIFT_BACKDROP_CSS,
  buildGeometry,
  computeReferenceRamp,
} from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { referenceBoxes, rulerBoxes } from '@jbrowse/bandage-core/tubeMap/axis'
import { coarsenTubeMap } from '@jbrowse/bandage-core/tubeMap/coarsen'
import {
  connectorAt,
  referenceNodes,
  tubeMapConnectors,
} from '@jbrowse/bandage-core/tubeMap/connectors'
import { deviationMarks } from '@jbrowse/bandage-core/tubeMap/deviations'
import {
  mismatchOnScreen,
  mismatchesLegible,
  tubeMapPicture,
} from '@jbrowse/bandage-core/tubeMap/draw'
import {
  tubeMapFrame,
  tubeMapNodeAt,
} from '@jbrowse/bandage-core/tubeMap/frame'
import {
  GENE_ROW_PX,
  tubeMapGeneRows,
  tubeMapGenes,
} from '@jbrowse/bandage-core/tubeMap/genes'
import { tubeMapNodeColors } from '@jbrowse/bandage-core/tubeMap/nodeColors'
import {
  axisScaleOf,
  contains,
  padded,
  viewportOf,
  zoomAbout,
} from '@jbrowse/bandage-core/viewport'
import {
  NO_VALUE_COLOR,
  WALK_FIELDS,
  WALK_SCHEMES,
} from '@jbrowse/bandage-core/walkEncoding'
import { facetLifts, walkLift } from '@jbrowse/bandage-core/walkHighlight'
import { walkPosition } from '@jbrowse/bandage-core/walkKey'
import {
  expandTabixShorthand,
  readConfObject,
} from '@jbrowse/core/configuration'
import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import {
  getContainingTrack,
  getContainingView,
  getRpcSessionId,
  getSession,
  isSessionModelWithWidgets,
  statusMessageText,
} from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { addDisposer, flow, isAlive, types } from '@jbrowse/mobx-state-tree'
import { RenderLifecycleMixin } from '@jbrowse/render-core/RenderLifecycleMixin'
import { getDpr } from '@jbrowse/render-core/canvas2dUtils'
import { autorun, reaction, untracked } from 'mobx'

import { downloadText } from './download'
import {
  GENE_ADAPTER_TYPES,
  geneModelsFrom,
  pickGeneTrack,
} from './genes/geneFeatures'
import { hostFrame, isLinearHost } from './host'
import { lenientMaybeEnum, lenientOptionalEnum } from './lenientEnum'
import { namesReads } from '../GetGraphReads'
import {
  REPEAT_ADAPTER_TYPES,
  pickRepeatTrack,
  repeatArraysFrom,
} from './repeats/repeatFeatures'
import { withCalls } from './repeats/walkCalls'
import {
  hoverInRegion,
  nodeForLgvHover,
  readLgvHover,
} from '../hoverSync/lgvHover'
import { walksForRow } from '../hoverSync/rowWalks'
import {
  contributingAssemblies,
  locLabel,
  nodeOwnLocation,
  resolveContributors,
  resolveLocationAssembly,
} from '../launchFromGraph/contributors'
import { graphLaunchMenuItems } from '../launchFromGraph/graphMenuItems'
import {
  canonicalAssemblyName,
  highlightInLinearView,
  launchSyntenyView,
  paddedLocation,
  showInLinearView,
  withReferenceRegion,
} from '../launchFromGraph/launchFromGraph'
import { launchTracks } from '../launchFromGraph/launchTracks'
import { linearViewTarget, withRows } from '../launchFromGraph/linearViewTarget'
import { launchableSyntenyTracks } from '../launchFromGraph/syntenyTracks'

import type { LinearHost } from './host'
import type { SubgraphCutOptions, SubgraphRegion } from '../GetSubgraph'
import type { RepeatArray } from './repeats/repeatFeatures'
import type { GafReads } from '../gaf/gafFile'
import type { GraphLocation } from '../launchFromGraph/contributors'
import type { BubbleSpread } from '@jbrowse/bandage-core/bubbleSpreads'
import type { MinigraphBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import type {
  ColorScheme,
  ResolvedColorScheme,
} from '@jbrowse/bandage-core/colorSchemes'
import type {
  FacetGrid,
  FacetInput,
  FacetSetting,
} from '@jbrowse/bandage-core/facetGrid'
import type { GeneModel } from '@jbrowse/bandage-core/genes/genePins'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { NodeWidth } from '@jbrowse/bandage-core/nodeWidths'
import type { Bounds, EngineRequest } from '@jbrowse/bandage-core/pipeline'
import type { AssemblyNames } from '@jbrowse/bandage-core/reference'
import type {
  RenderBatch,
  Renderer,
} from '@jbrowse/bandage-core/renderer/types'
import type {
  Graph,
  GraphNode,
  LayoutResult,
} from '@jbrowse/bandage-core/types'
import type { AxisScale } from '@jbrowse/bandage-core/util/geometry'
import type { NodeInk } from '@jbrowse/bandage-core/util/hitDetection'
import type {
  WalkEncoding,
  WalkLayer,
} from '@jbrowse/bandage-core/walkEncoding'
import type { LiftedWalk, WalkLift } from '@jbrowse/bandage-core/walkHighlight'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation } from '@jbrowse/core/util/types'
import type { Instance } from '@jbrowse/mobx-state-tree'

// Ceiling on the pane, and what it falls back to before there is a layout to
// size against. A roughly square drawing (FMMM) hits this and keeps the
// scrollable pane it has always had.
const MAX_CANVAS_HEIGHT = 600
// Floor, so a window holding only backbone — one row, no height at all — still
// leaves room to hover a node and read its tooltip.
const MIN_CANVAS_HEIGHT = 160
// the pane's background, as the renderer clears to it and as CSS
const PAPER_LIGHT: [number, number, number, number] = [1, 1, 1, 1]
const PAPER_DARK: [number, number, number, number] = [0.12, 0.12, 0.12, 1]
const paperCss = ([r, g, b]: number[]) =>
  `rgb(${[r, g, b].map(v => Math.round(v! * 255)).join(', ')})`
// The thinnest a fit draws a tube map's tubes
const MIN_FIT_TUBE_PX = 5

const TUBE_MAP_MODES = new Set<string>(['tubemap', 'tubemapref'])

const FACETS: { value: FacetSetting['field']; label: string }[] = [
  { value: '', label: 'Off' },
  { value: 'walk', label: 'A panel per walk' },
  { value: 'sample', label: 'A row per sample, a column per haplotype' },
]

// The facet as a session writes it, in the shape every JBrowse display's
// `facet` takes: a bare field, or the field with the panels' order and how
// many go across. A field this pane cannot split on reads as none.
const facetModel = types.snapshotProcessor(
  types.model('GraphFacet', {
    field: types.optional(types.enumeration(['', 'walk', 'sample']), ''),
    domain: types.optional(types.frozen<string[]>(), []),
    columns: types.maybe(types.number),
  }),
  {
    preProcessor: (snap: FacetInput | undefined) => facetSettingOf(snap),
  },
)

// The sizes a tube map folds variants under. MICB's 22 kb cut draws 475
// columns whole, 34 under 3 bp and one under 50, where only its structural
// variants would stand: human windows are mostly SNPs.
const TUBE_MAP_FOLDS = [
  { bp: 0, label: 'None' },
  { bp: 3, label: 'Under 3 bp' },
  { bp: 10, label: 'Under 10 bp' },
  { bp: 50, label: 'Under 50 bp, leaving structural variants' },
  { bp: 1000, label: 'Under 1 kb' },
]

const SEGMENTS_SUFFIX = '.segs.bed.gz'

// The rGFA index prefix an adapter config names, from either spelling the
// config schema accepts: the `uri` shorthand or an explicit segments location.
function bubblePrefix(adapterConfig: Record<string, unknown>) {
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
const HOVER_BRIGHTEN = 1.4
const SELECT_BRIGHTEN = 1.6
const VIEWPORT_DEBOUNCE_MS = 150
const VIEWPORT_PANES_BUILT = 1
// How many walk rows read their haplotype's genes, the first rows down
const WALK_GENE_ROWS = 40

// What the canvas draws under the tube map, whose ink is all TubeMapOverlay's
const EMPTY_BATCH: RenderBatch = {
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
function dependOn(..._values: unknown[]) {}

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
// both land at or under the ~2k nodes that redraw in under 10 ms (see agent-docs/GRAPH_SCALE_AND_LOD.md):
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
function uriOf(location: FileLocation | undefined) {
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

function geometryPainted(model: {
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
function paneViewportOf(model: {
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
// Both are hits.
//
// Entries are the live position objects rather than copies, which a node drag
// mutates in place (see moveNode), so a layout comes back arranged the way it
// was left rather than snapping back.
//
// Weak on the graph so nothing has to invalidate it: a graph is rebuilt by
// every load and dropped by `clearGraph`, and its layouts go with it.
const forceLayouts = new WeakMap<Graph, Map<string, LayoutResult>>()

// Enough to hold the settings a comparison moves between; past that the oldest
// goes, since a big graph's positions are megabytes.
const FORCE_LAYOUT_CACHE_SIZE = 4

function forceLayoutsOf(graph: Graph) {
  let cache = forceLayouts.get(graph)
  if (!cache) {
    cache = new Map()
    forceLayouts.set(graph, cache)
  }
  return cache
}

// Re-anchoring builds a new Graph, and the force layout of it is the same
// drawing: `anchorFromPaths` rewrites each node's `stable` and `samples` and
// touches neither the ids, the lengths, the depths nor the edges, which are all
// the engine reads. So the layouts follow the graph they were computed for
// rather than being thrown away with it.
function inheritForceLayouts(from: Graph, to: Graph) {
  const cache = forceLayouts.get(from)
  if (cache && from !== to) {
    forceLayouts.set(to, cache)
  }
}

function remember(
  cache: Map<string, LayoutResult>,
  key: string,
  result: LayoutResult,
) {
  if (cache.size >= FORCE_LAYOUT_CACHE_SIZE) {
    cache.delete(cache.keys().next().value!)
  }
  cache.set(key, result)
}

export function GraphPaneMixin() {
  return types
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
        linearLayout: types.optional(types.boolean, false),
        // unset takes the host's default: force in a view of its own, the
        // display config's in a track
        layoutMode: lenientMaybeEnum(LAYOUT_MODE_VALUES),
        colorScheme: lenientMaybeEnum(COLOR_SCHEME_VALUES),
        // How far the force layout opens a bubble, which on a variation graph is
        // the difference between a legible drawing and a rope. See
        // BUBBLE_SPREADS; no effect on the reference-anchored layouts, which
        // place a node from its coordinates rather than from a force sim.
        bubbleSpread: lenientOptionalEnum(BUBBLE_SPREAD_VALUES, 'auto'),
        // Node thickness by depth, Bandage's own device; see NODE_WIDTHS.
        nodeWidth: lenientOptionalEnum(NODE_WIDTH_VALUES, 'depth'),
        // Whether the node layouts draw each bubble as a halo along its nodes
        // with a label that opens it. Off by default: on a base-level cut
        // every SNP's halo is a blob.
        showBubbles: types.optional(types.boolean, false),
        showDeletionEdges: types.optional(types.boolean, false),
        // The session's genes drawn onto the backbone: exons along the nodes
        // that carry them, names pinned at their midpoints. See genes/.
        showGenes: types.optional(types.boolean, true),
        // Whether a drawing in its own coordinates inside a linear view gets
        // the strip of reference segments at their bp. See referenceStrip.ts.
        showReferenceStrip: types.optional(types.boolean, true),
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
        // Samples whose walks the walk rows show, by the name before the
        // haplotype number; undefined shows every walk the cut holds.
        walkRowSamples: types.maybe(types.frozen<string[]>()),
        // Walks lifted out of the drawing, each a layer with a lane of its own
        // and the rest fading, coloured by the encoding it states or by the
        // default one. See walkEncoding.ts. Empty lifts none.
        walkLayers: types.optional(types.frozen<WalkLayer[]>(), []),
        // Facets, as a grammar of graphics splits a plot: `walk` draws the
        // pane once per lifted walk, side by side on the same layout, each
        // panel with that walk alone; `sample` puts a sample's haplotypes in
        // a row; `domain` orders the panels and `columns` fixes how many go
        // across. See facetPanels and facetCells.
        facet: types.optional(facetModel, {}),
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
        contigThickness: types.optional(types.number, 6),
        connectorThickness: types.optional(types.number, 2),
        darkMode: types.optional(types.boolean, false),
        scale: types.optional(types.number, 1),
        translateX: types.optional(types.number, 0),
        translateY: types.optional(types.number, 0),
        drawPaths: types.optional(types.boolean, false),
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
        // The reference span the reference-position ramp runs over, for a graph
        // with no region of its own to span it
        colorDomain: types.maybe(
          types.frozen<{ start: number; end: number }>(),
        ),
        // the linear view a graph of its own is paired with for the hover sync
        connectedViewId: types.maybe(types.string),
      }),
    )
    .volatile(() => ({
      graph: undefined as Graph | undefined,
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
      // the genes over the cut window, read once per cut from the gene track
      geneFeatures: undefined as GeneModel[] | undefined,
      // each walk row's genes, read from its haplotype's own assembly, by walk
      // name
      walkGeneFeatures: undefined as Map<string, GeneModel[]> | undefined,
      // the tandem repeat arrays over the cut window, from the repeat track
      repeatArrays: undefined as RepeatArray[] | undefined,
      // The graphs the open bubble was popped out of, outermost first, each
      // with what closing back to it restores without a refetch. A stack so a
      // popped superbubble can be mapped and popped again.
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
      viewportDirtyTimer: undefined as
        ReturnType<typeof setTimeout> | undefined,
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
    .views(self => ({
      get defaultLayoutMode(): LayoutModeValue {
        return 'force'
      },
      get defaultColorScheme(): ColorScheme {
        return 'auto'
      },
      // a source declared but not yet loaded
      get hasPendingSource() {
        return false
      },
      get canRetryLoad() {
        return false
      },
      // the track the graph is cut from: the one the pane is a display of
      get sourceTrack(): AnyConfigurationModel | undefined {
        try {
          return getContainingTrack(self).configuration
        } catch {
          return undefined
        }
      },
    }))
    .views(self => ({
      get chosenLayoutMode() {
        return self.layoutMode ?? self.defaultLayoutMode
      },
      get chosenColorScheme() {
        return self.colorScheme ?? self.defaultColorScheme
      },
    }))
    .views(self => ({
      get paneWidth() {
        return getContainingView(self).width
      },
      // The graph the drawing's node ids address: a folded tube map's coarse
      // graph, the cut otherwise. Hover, details and labels read it, so a
      // merged node reports its own span and length.
      get drawnGraph() {
        return self.layoutResult?.tubeMap?.coarse?.graph ?? self.graph
      },
    }))
    .views(self => ({
      get nodeById() {
        if (self.drawnGraph) {
          const m = new Map<string, GraphNode>()
          for (const n of self.drawnGraph.nodes) {
            m.set(n.id, n)
          }
          return m
        }
        return undefined
      },
      // bp per node id, which is all the label overlay needs of a GraphNode.
      // Held here rather than rebuilt in the component: that render runs on
      // every pan, and the map is a fact about the graph (measured 6.9 ms an
      // allocation on a 30k-node cut).
      get nodeLengths() {
        const m = new Map<string, number>()
        for (const n of self.drawnGraph?.nodes ?? []) {
          m.set(n.id, n.length)
        }
        return m
      },
      get nodeCount() {
        return self.graph?.nodes.length ?? 0
      },
      get edgeCount() {
        return self.graph?.edges.length ?? 0
      },
      get pathCount() {
        return self.graph?.paths?.length ?? 0
      },
      get hasGraph() {
        return self.graph !== undefined
      },
      get geometryPainted() {
        return geometryPainted(self)
      },
      // The app-wide readiness contract (AppReadyMarker, @jbrowse/capture)
      // reads this: a declared source still fetching, or a graph whose
      // settled geometry is not on the canvas yet.
      get showLoading() {
        return (
          self.error === undefined &&
          (self.isLoading ||
            self.hasPendingSource ||
            (self.graph !== undefined && !geometryPainted(self)))
        )
      },
      // Only before anything is drawn: past that point a reload is superseded
      // by the next setting change, and stopping one midway would leave a new
      // graph under the previous graph's layout.
      get canCancelLoad() {
        return self.isLoading && !self.layoutResult
      },
      // Whether the drawing on screen is the FMMM engine's. False before there
      // is a graph, since nothing is drawn by anything yet.
      //
      // Read by the settings that only the engine looks at: the layout quality
      // and the bubble spread do nothing at all to an anchored drawing, which
      // places a node from its coordinates, and the guide says so in prose
      // precisely because the dialog did not. A control that silently does
      // nothing is worse than one that says it cannot — the same rule the
      // `drawPaths` switch already follows.
      get usesLayoutEngine() {
        return self.graph
          ? modeUsesLayoutEngine(self.chosenLayoutMode, self.graph)
          : false
      },
      // A rank-0 backbone to draw x against, whether the segments declared it
      // (rGFA) or a path walk derived it. Only a GFA with neither tags nor
      // paths has no backbone at all, and there force is the one honest layout.
      get canAnchorLayout() {
        return self.graph?.nodes.some(n => n.stable?.rank === 0) ?? false
      },
      // The paths this graph could be anchored on, for the picker. Empty for an
      // rGFA, which has no P/W records and needs none.
      get anchorPaths() {
        return self.graph?.anchorPaths ?? []
      },
      // Every walk the graph carries, named for a picker, whatever the count.
      get walkChoices() {
        const paths = self.graph?.paths
        return paths?.length ? pathLegend(paths) : []
      },
      // Whether the drawing is actually painted per path, which is not the same
      // question as whether the user asked for it: past MAX_PATH_COLORS the
      // colours say nothing and cost a stroke per path per edge. A bare getter
      // returning a resolved value, the same shape and for the same reason as
      // `effectiveColorScheme` — every consumer of a path colour reads this
      // one, so the geometry, the hit index and the key cannot disagree about
      // whether there are any. The switch in the settings dialog reads the raw
      // `drawPaths`, so the user's choice stays visible as the choice it is.
      get effectiveDrawPaths() {
        return (
          self.drawPaths && pathColorsLegible(self.graph?.paths?.length ?? 0)
        )
      },
      // The path x is currently drawn on, which is not necessarily the one
      // `referencePath` asked for: an unmatched name falls back rather than
      // leaving the graph unanchored, and the picker has to show what happened.
      get activeReferencePath() {
        return self.graph?.referencePath
      },
      // Undefined for a graph with neither, where the ramp spans the drawn
      // extent (computeReferenceRamp)
      get rampDomain() {
        return self.colorDomain ?? self.graphRegion
      },
      // The ramp a lane coloured by reference position reads, computed only
      // when a layer asks for one: it is a neighbour walk per node
      get walkRamp() {
        const { graph } = self
        return graph &&
          self.walkLayers.some(layer => layer.color?.field === 'reference')
          ? computeReferenceRamp(graph, this.rampDomain)
          : undefined
      },
      // Whether the chosen layout draws the graph's nodes, which a facet
      // splits and a hovered lane row's walk is lifted over
      get modeDrawsNodes() {
        return layoutModeByValue(self.chosenLayoutMode).drawsNodes
      },
      // The walks picked, or while none is, those of the lane row hovered
      get liftedWalkLayers(): WalkLayer[] {
        return self.walkLayers.length > 0 || !this.modeDrawsNodes
          ? self.walkLayers
          : self.hoveredRowWalks.map(walk => ({ walk }))
      },
      // The lifted walks the graph on screen carries, or undefined when none
      // is named or it carries none of those that were
      get walkLift() {
        const { graph } = self
        const layers = this.liftedWalkLayers
        return graph && layers.length > 0 && !self.layoutResult?.tubeMap
          ? walkLift(graph, layers, this.walkRamp)
          : undefined
      },
      // One panel per lifted walk while the pane is faceted by walk, each a
      // lift of that walk alone, on a layout whose nodes the panels can split.
      // See facetLifts.
      get facetPanels() {
        const { graph } = self
        const lift = this.walkLift
        return self.facet.field !== '' &&
          this.modeDrawsNodes &&
          graph &&
          lift &&
          self.walkLayers.length > 1 &&
          lift.walks.length > 1
          ? facetLifts(graph, lift, self.walkLayers, this.walkRamp)
          : undefined
      },
      // The lifted walks as drawn, each panel's own while faceted
      get drawnWalks() {
        return (
          this.facetPanels?.map(panel => panel.walks[0]!) ??
          this.walkLift?.walks ??
          []
        )
      },
      // A tube map draws every walk as a tube of its own
      get liftsWalks() {
        return !TUBE_MAP_MODES.has(self.chosenLayoutMode)
      },
      // The window a lane coloured by reference position spans, by name
      get walkReference() {
        const domain = this.walkLift?.referenceDomain
        return domain && { ...domain, name: self.graphRegion?.refName }
      },
      walkLabel(name: string) {
        return this.walkChoices.find(c => c.name === name)?.label ?? name
      },
      // Whether a lifted lane paints a node charcoal, the colour a lane coloured
      // by reference position gives what is off the reference
      get liftPaintsOffReference() {
        for (const w of this.walkLift?.walks ?? []) {
          if (w.encoding.field !== 'walk') {
            for (const color of w.colors.values()) {
              if (color === NO_VALUE_COLOR) {
                return true
              }
            }
          }
        }
        return false
      },
      // what the faded rest of the drawing is not on
      get liftedWalksLabel() {
        const walks = this.walkLift?.walks ?? []
        return walks.length === 1
          ? this.walkLabel(walks[0]!.name)
          : 'these walks'
      },
      // The scheme the renderer actually paints with, which is the raw prop
      // unless it is 'auto'. A bare getter returns a resolved value (root
      // CLAUDE.md): every consumer of a colour reads this one, and the two
      // dropdowns read `colorScheme` so "Auto" stays visible as the choice it
      // is.
      //
      // 'auto' asks the GRAPH, not the layout. A hue along the reference is
      // meaningful whenever the segments have reference coordinates —
      // `anchoredBy` is exactly that question — and a force-directed drawing of
      // an rGFA is the case that proves it: the layout has no reference axis and
      // the ramp still says where on the reference each node came from, which is
      // the only quantity a linear track beside it can be painted with too.
      //
      // A tube map tells its paths apart by their tubes' hues, so there 'auto'
      // leaves the boxes clear and a node scheme is the user's pick. Beside
      // reads, which take the reds and the blues, the boxes stay clear
      // whatever was picked.
      get effectiveColorScheme(): ResolvedColorScheme {
        return self.layoutResult?.tubeMap &&
          (this.tubeMapReads || self.chosenColorScheme === 'auto')
          ? 'uniform'
          : resolveColorScheme(self.chosenColorScheme, self.graph)
      },
      get tubeMapReads() {
        return (self.layoutResult?.tubeMap?.layout.reads.length ?? 0) > 0
      },
      // Why no node scheme is on screen to pick, for every control that
      // offers one: lifted walks colour their own lanes and grey the rest,
      // and reads take a tube map's reds and blues
      get colorSchemeLock() {
        return this.walkLift
          ? {
              value: 'By walk',
              why: 'Each lifted walk colours its own lane: set it under the menu, Walk, Colour',
            }
          : this.tubeMapReads
            ? {
                value: 'By strand',
                why: 'Reads take the reds and blues, so the tube map leaves its nodes clear',
              }
            : undefined
      },
      get nodePositions() {
        return self.layoutResult?.nodePositions
      },
      // a length label would sit on the lanes of lifted walks
      get labelsNodeSizes() {
        return !self.layoutResult?.tubeMap && !this.walkLift
      },
      // Empty rather than undefined: every consumer maps over it, and a layout
      // with no row structure (FMMM) is a normal state, not a missing one.
      get rowLabels() {
        return self.layoutResult?.rowLabels ?? []
      },
      // Deletions the layout found inside an allele, empty for the same reason
      // rowLabels is: a layout drawn at sequence scale states none, because
      // there a node's drawn extent already IS its length. `deletions` beside
      // this one is the bare-edge kind, which every layout has.
      get alleleDeletions() {
        return self.layoutResult?.alleleDeletions ?? []
      },
      // Whether the current layout states y in screen px rather than in the same
      // units as x (LayoutResult.pixelRows). Everything that has to put the two
      // axes in one expression reads this through scaleX/scaleY.
      get pixelRows() {
        return self.layoutResult?.pixelRows ?? false
      },
      get zoomPercent() {
        return `${(self.scale * 100).toFixed(1)}%`
      },
      // True while the persisted transform is still the schema default, i.e.
      // neither a restored session nor the user has positioned this view yet,
      // so an incoming layout is free to zoom-to-fit.
      get isDefaultViewport() {
        return (
          self.scale === 1 && self.translateX === 0 && self.translateY === 0
        )
      },
    }))
    .views(self => ({
      get poppedFrom() {
        return self.popStack.at(-1)
      },
      // The bubbles the graph itself states, for a graph with no index: a GBZ
      // cut, a pggb file, the inside of a popped bubble.
      get derivedBubbles() {
        return self.graph ? bubblesFromGraph(self.graph) : []
      },
    }))
    .views(self => ({
      // The bubbles halos draw and pops open. Index rows win where both exist:
      // gfatools measured every allele, the layered order only bounds them.
      get bubbles() {
        return self.indexBubbles?.length
          ? self.indexBubbles
          : self.derivedBubbles
      },
    }))
    .views(self => ({
      // the haplotypes the graph on screen was cut for, where a host says
      get cutHaplotypes(): string[] | undefined {
        return undefined
      },
      // the GFA the graph on screen was read from, where a host says
      get sourceGfaLocation(): FileLocation | undefined {
        return undefined
      },
      get sourceAdapter() {
        const track = self.sourceTrack
        return track
          ? (readConfObject(track, 'adapter') as Record<string, unknown>)
          : undefined
      },
      get sourceTrackId() {
        const track = self.sourceTrack
        return track ? (readConfObject(track, 'trackId') as string) : undefined
      },
      get assemblyTrackChoices() {
        const region = self.graphRegion
        if (!region) {
          return []
        }
        return getSession(self)
          .tracks.filter(t =>
            (readConfObject(t, 'assemblyNames') as string[]).includes(
              region.assemblyName,
            ),
          )
          .map(t => ({
            trackId: t.trackId as string,
            name: readConfObject(t, 'name') as string,
            adapterType: (readConfObject(t, 'adapter') as { type: string })
              .type,
          }))
      },
    }))
    .views(self => ({
      get geneTrackChoices() {
        return self.assemblyTrackChoices.filter(t =>
          GENE_ADAPTER_TYPES.has(t.adapterType),
        )
      },
      // The session's feature tracks a repeat annotation could be, for the
      // picker; which one is read is pickRepeatTrack's choice.
      get repeatTrackChoices() {
        return self.assemblyTrackChoices.filter(t =>
          REPEAT_ADAPTER_TYPES.has(t.adapterType),
        )
      },
      // The arrays over the window that state a unit, for the Repeat picker.
      get repeatChoices() {
        return self.repeatArrays ?? []
      },
    }))
    .views(self => ({
      get repeatTrack() {
        return pickRepeatTrack(self.repeatTrackChoices, self.repeatTrackId)
      },
      get selectedRepeat() {
        return self.repeatChoices.find(r => r.key === self.repeatKey)
      },
      get backbone() {
        return self.graph ? graphBackbone(self.graph) : undefined
      },
      // An assembly by each name a backbone may spell it with: the session's
      // name and aliases, and the PanSN prefix the source track maps each of
      // those to.
      assemblySpellings(assemblyName: string): AssemblyNames {
        const { assemblyManager } = getSession(self)
        const assembly = assemblyManager.has(assemblyName)
          ? assemblyManager.get(assemblyName)
          : undefined
        const panSN = (self.sourceAdapter?.assemblyNameToPanSN ?? {}) as Record<
          string,
          string
        >
        const names = [
          assemblyName,
          ...(assembly ? [assembly.name, ...assembly.aliases] : []),
        ]
        return {
          name: assemblyName,
          aliases: [...names, ...names.flatMap(n => panSN[n] ?? [])],
        }
      },
      // Whether x lies along the reference the track's graph came with, not a
      // walk "Draw x along" picked. An rGFA's backbone is fixed.
      get drawsLoadedReference() {
        const graph = self.graph
        return (
          graph?.anchoredBy === 'tags' ||
          (graph?.referencePath !== undefined &&
            graph.referencePath === self.loadedReferencePath)
        )
      },
    }))
    .views(self => ({
      // the assembly the genes were read for
      get geneAssembly() {
        const region = self.graphRegion
        return region ? self.assemblySpellings(region.assemblyName) : undefined
      },
    }))
    .views(self => ({
      // The genes on the drawn backbone under its own refNames. The track's
      // config puts its reference on the cut's assembly, whatever the walk's
      // name. After "Draw x along" another walk, the backbone takes the genes
      // only where its PanSN prefix names their assembly.
      get backboneGenes() {
        const { backbone, geneAssembly, geneFeatures } = self
        const binds =
          self.drawsLoadedReference ||
          (geneAssembly !== undefined &&
            backboneAssembly(backbone, [geneAssembly]) !== undefined)
        return backbone && geneFeatures && binds
          ? featuresOnBackbone(geneFeatures, backbone)
          : undefined
      },
    }))
    .views(self => ({
      get nodeNeighbors() {
        return self.drawnGraph ? buildNeighbors(self.drawnGraph) : undefined
      },
      get nodeInk(): NodeInk {
        return nodeInk(
          self.drawnGraph,
          self.nodeById,
          self.contigThickness,
          self.nodeWidth,
        )
      },
      // Links that skip reference sequence, i.e. the deletions this graph
      // holds. Computed once per graph rather than per geometry rebuild: it is
      // a pass over the edges and the drawing rebuilds on every pan.
      // Walk rows state what each walk skips as its own bar length, so the arcs
      // over the backbone would only say it again, across the bars.
      get deletions() {
        return self.graph && this.drawsNodes ? deletionEdges(self.graph) : []
      },
      // One bar per haplotype walk on its own bp axis, for the walk-rows
      // overlay. Empty under every other layout.
      get walkRowBars() {
        if (self.chosenLayoutMode !== 'walkrows' || !self.graph) {
          return undefined
        }
        const repeat = self.selectedRepeat
        const bars = repeat
          ? walkRows(self.graph, repeat, repeat.unit)
          : walkRows(self.graph, self.graphRegion)
        if (!bars) {
          return undefined
        }
        const samples = self.walkRowSamples
        const rows = samples
          ? bars.rows
              .filter(r => samples.includes(r.sample))
              .sort(
                (a, b) =>
                  samples.indexOf(a.sample) - samples.indexOf(b.sample) ||
                  a.label.localeCompare(b.label),
              )
          : bars.rows
        const [reference, ...paired] = withCalls(
          [bars.reference, ...rows],
          repeat?.calls,
        )
        return { ...bars, reference: reference!, rows: paired }
      },
      // Whether the canvas draws the graph's nodes. A tube map and walk rows
      // draw a picture of their own over it, so what sits on nodes (genes,
      // bubble halos, deletion arcs, the reference strip) has nowhere to go.
      // Read off what was drawn rather than the mode asked for, which falls
      // back to the force layout on a graph it cannot draw.
      get drawsNodes() {
        return !self.layoutResult?.tubeMap && !this.walkRowBars
      },
      // The labels drawn beside the rows. Walk rows label from the bars
      // themselves, which follow the selected repeat and sample filter that
      // the layout, run once per cut, cannot.
      get drawnRowLabels() {
        const bars = this.walkRowBars
        return bars
          ? [bars.reference, ...bars.rows].map((row, i) => ({
              label: row.label,
              y: i * ROW_HEIGHT_PX,
            }))
          : self.rowLabels
      },
      // The row labels are pinned to the pane's left edge, so the fit starts
      // the drawing past the widest one.
      get fitPadLeft() {
        return Math.max(
          FIT_PADDING,
          ...this.drawnRowLabels.map(r => rowLabelBox(r.label, 0).x1 + 6),
        )
      },
      // Exons and names on the backbone, in layout units. Reads
      // positionsVersion so a dragged node takes its exons with it.
      get genePins() {
        dependOn(self.positionsVersion)
        const positions = self.layoutResult?.nodePositions
        return self.showGenes &&
          this.drawsNodes &&
          self.graph &&
          self.backboneGenes &&
          positions
          ? genePins(self.graph, self.backboneGenes, positions)
          : []
      },
      // The bubbles as halos along their nodes.
      // Reads positionsVersion so a dragged node takes its halo with it.
      get bubbleHalos() {
        dependOn(self.positionsVersion)
        const positions = self.layoutResult?.nodePositions
        if (
          !self.showBubbles ||
          !this.drawsNodes ||
          !self.graph ||
          !positions
        ) {
          return []
        }
        const labels = new Map(self.walkChoices.map(c => [c.name, c.label]))
        return bubbleHalos(
          self.graph,
          self.bubbles,
          positions,
          name => labels.get(name) ?? name,
          self.repeatArrays,
        )
      },
      // Every node's midpoint on the reference plus the interval the hue ramps
      // over — what `reference-position` paints from, and undefined under every
      // other scheme so the walk is never run for a colouring that ignores it.
      //
      // Here for the same reason `deletions` is, only more so: deriving it is a
      // bounded neighbour walk PER NODE (referenceMidpoints), it depends on
      // nothing the transform touches, and it was being redone inside every
      // geometry rebuild — 1.6 ms at 1.5k nodes, 45 ms at 30k, on a pass that
      // reruns on each debounced pan and each drag frame. `reference-position`
      // is also what `auto` resolves to on any anchored graph, so this was the
      // default path rather than an opt-in one.
      //
      // On the drawn graph, whose ids a folded tube map's boxes carry
      get referenceRamp() {
        return self.effectiveColorScheme === 'reference-position' &&
          self.drawnGraph
          ? computeReferenceRamp(self.drawnGraph, self.rampDomain)
          : undefined
      },
      // The assemblies this view is showing, which is the interface every
      // assembly-aware piece of the app looks for — `viewTitle` first among
      // them, which falls back through it and otherwise names the view
      // "Untitled view". Every published HPRC figure showed that.
      // `launchSubgraphView` only avoids it by writing `displayName`, so a
      // declaratively-instantiated view (a session snapshot, a figure spec) got
      // the fallback.
      //
      // A whole-file import has none: its stable names are a GFA's business and
      // need not name anything the session has loaded. Empty rather than
      // undefined, matching what an LGV with no displayed regions reports.
      get assemblyNames() {
        const region = self.graphRegion
        return region ? [region.assemblyName] : []
      },
      // Screen px per layout unit, per axis. `scale` is the x zoom and the whole
      // of what a user's wheel moves; y is a second question the layout answers
      // for itself.
      //
      // On a row layout the pitch is already in screen px (rowSpacing.ts), so
      // scaleY is 1 and stays 1: rows are a track's row height, unchanged by
      // zoom, and the backbone under them zooms the way the ruler above it does.
      // On an isotropic layout (FMMM) x and y are one simulation space and one
      // number scales both, exactly as before.
      //
      // Everything that mixes the two axes takes their ratio as `yToX`
      // (scaleY / scaleX) — see computeEdgeCurves.
      get scaleX() {
        return axisScaleOf(self.scale, self.pixelRows).scaleX
      },
      get scaleY() {
        return axisScaleOf(self.scale, self.pixelRows).scaleY
      },
      // The pair, for everything that draws or hit-tests. Handed over as one
      // value on purpose: every consumer needs both, and passing them separately
      // let a caller supply the x scale and default y, which compiles and draws
      // a wrong picture. See AxisScale.
      get axisScale() {
        return axisScaleOf(self.scale, self.pixelRows)
      },
      // Extent of the drawing in layout units, shared by the pane height and
      // zoomToFit. On a reference-bp layout x is the cut window rather than
      // how far the drawing reaches: an allele anchored far outside it is a
      // fact about the graph, not a reason to draw the window at 6% of the
      // frame. A popped bubble fits to what it drew. Walk rows reach as far as
      // the bars on screen, which a repeat pick or a sample filter narrows
      // after the layout ran.
      get layoutBounds() {
        const layout = self.layoutResult
        const bars = this.walkRowBars
        return layout
          ? drawingBounds(layout, {
              region: self.popStack.length === 0 ? self.graphRegion : undefined,
              extent: bars && layout.extent ? walkRowsExtent(bars) : undefined,
            })
          : undefined
      },
    }))
    .views(self => ({
      get geneTrack() {
        return pickGeneTrack(self.geneTrackChoices, self.geneTrackId)
      },
      // Which of `graph.edges` are deletions, and what each one bypasses, keyed
      // the way the geometry and the hit index address an edge. One map per
      // graph rather than per rebuild, since both of those take it on every
      // pan.
      get deletionEdgeIndexes() {
        return new Map(self.deletions.map(d => [d.edgeIndex, d.bypassed]))
      },
      get hiddenEdgeIndexes() {
        return new Set(
          self.showDeletionEdges ? [] : self.deletions.map(d => d.edgeIndex),
        )
      },
      // The interval the reference-position ramp runs over, for the key beside
      // the drawing, and undefined when no key should be drawn. Two tutorials
      // carry "red to magenta is left to right of the cut window" as a sentence
      // in prose because nothing on screen said it.
      //
      // Read off the ramp the drawing is actually painted with rather than
      // re-derived from the domain, so the key cannot come to describe a
      // different interval from the hues beside it — and so a graph that states
      // no domain, whose interval has to be measured, does not pay for a second
      // neighbour walk to say what the first one already worked out.
      get referenceRampDomain() {
        const ramp = self.referenceRamp
        return ramp
          ? { start: ramp.start, end: ramp.start + ramp.span }
          : undefined
      },
      // The ramp's two colours for nodes off it, as getNodeColor paints them:
      // charcoal where an rGFA rank puts a node off the reference, grey where
      // a node has no reference position at all. A tube map draws the window
      // alone (trimToWindow), so there only the boxes it drew count.
      get referenceRampOffKeys() {
        const ramp = self.referenceRamp
        const layout = self.layoutResult
        const drawn = layout?.tubeMap ? layout.nodePositions : undefined
        let offReference = false
        let unplaced = false
        if (ramp && self.drawnGraph) {
          for (const node of self.drawnGraph.nodes) {
            if (drawn && !drawn[node.id]) {
              continue
            }
            if (!ramp.midpoints.has(node.id)) {
              unplaced = true
            } else if (node.stable && node.stable.rank > 0) {
              offReference = true
            }
          }
        }
        return { offReference, unplaced }
      },
      // Each tube map box in its node's colour, where the scheme paints one
      get tubeMapNodeColors() {
        const graph = self.drawnGraph
        return self.layoutResult?.tubeMap && graph
          ? tubeMapNodeColors(
              graph,
              self.effectiveColorScheme,
              self.referenceRamp,
            )
          : undefined
      },
      // Beside tinted boxes the tubes step through greys, as they do beside
      // reads, so no tube shares a box's hue
      get tubeMapTubeColors() {
        const colors = self.layoutResult?.tubeMap?.pathColors
        const tubes =
          colors && this.tubeMapNodeColors
            ? colors.map((_, i) => pathGreyCssColor(i, colors.length))
            : colors
        const hovered = new Set(self.hoveredRowWalks)
        const paths = self.drawnGraph?.paths
        return tubes && paths && hovered.size > 0
          ? tubes.map((color, i) =>
              hovered.has(paths[i]?.name ?? '') ? color : LIFT_BACKDROP_CSS,
            )
          : tubes
      },
      // A node's reference interval, an allele's between its flanks
      nodeSpan(nodeId: string) {
        const { nodeById, nodeNeighbors: neighbors } = self
        return nodeById && neighbors
          ? nodeReferenceSpan({ nodeId, nodeById, neighbors })
          : undefined
      },
    }))
    .views(self => ({
      // Which haplotype each ribbon colour belongs to, in the order the file
      // states the paths — the same list and the same order the geometry keys
      // its colours off, so the key cannot name a colour that is not drawn.
      // Empty unless the ribbons are actually on: a colour key beside a drawing
      // with no colours in it is a legend for nothing.
      // The tube map colours its tubes whether or not paths are drawn on the
      // nodes, so under it the key follows the tubes, and names the colours
      // the tubes were drawn in.
      get pathLegend() {
        const paths = self.graph?.paths
        const tubeMap = self.layoutResult?.tubeMap
        const colouring = self.drawPaths || tubeMap
        return colouring && paths && pathColorsLegible(paths.length)
          ? pathLegend(paths, self.tubeMapTubeColors)
          : []
      },
      // The reference interval under the pointer: the hovered node's, or the
      // hovered bubble's
      get hoveredSpan() {
        const nodeId = self.hoveredNode
        const bubble = self.hoveredBubble
        return nodeId !== null
          ? self.nodeSpan(nodeId)
          : bubble
            ? { start: bubble.start, end: bubble.end }
            : undefined
      },
    }))
    .views(self => ({
      // The hovered span, for a connected linear view to highlight. Only a
      // graph cut from a track has one: a whole-file import has no region, and
      // its stable names need not name anything in a loaded assembly.
      get hoverHighlight() {
        const region = self.graphRegion
        const span = self.hoveredSpan
        return region && span
          ? {
              refName: region.refName,
              assemblyName: region.assemblyName,
              ...span,
            }
          : undefined
      },
    }))
    .views(self => ({
      // Every assembly this graph names a segment from, with the locus each one
      // contributes here. rGFA's SN tag is what makes this knowable: the graph
      // states its own contributors, so the view can offer a way out to each of
      // them without consulting an alignment.
      //
      // Gaps larger than the backbone span split a contributor's segments into
      // separate loci and the widest wins, so a sample that also contributes
      // sequence from a distant duplication is launched at the locus on screen
      // rather than at the union of the two.
      get contributingAssemblies() {
        const graph = self.graph
        const backbone = graph ? backboneNodes(graph) : []
        return graph
          ? contributingAssemblies(graph, {
              maxGap: backbone.length > 0 ? backboneSpan(backbone) : Infinity,
            })
          : []
      },
    }))
    .views(self => ({
      // A node's PanSN sample as an assembly this session can open, or
      // undefined. The graph's spelling and the assembly's need not agree:
      // HPRC writes `CHM13` where the assembly is UCSC's `hs1`. The track the
      // graph was cut from states that pairing in its `assemblyNameToPanSN`,
      // so its map is read first, then `assemblyManager`'s names and aliases.
      //
      // `has` before `get`, deliberately: `get` reports an unknown name to
      // `Core-handleUnrecognizedAssembly`, which asks every installed plugin to
      // go supply it, and this is a probe run for hundreds of haplotypes per
      // graph.
      get assemblyResolver() {
        const { assemblyManager } = getSession(self)
        const panSN = self.sourceAdapter?.assemblyNameToPanSN as
          Record<string, string> | undefined
        const byPrefix = new Map(
          Object.entries(panSN ?? {}).map(([asm, prefix]) => [prefix, asm]),
        )
        const loaded = (name: string | undefined) =>
          name !== undefined && assemblyManager.has(name)
            ? (assemblyManager.get(name)?.name ?? name)
            : undefined
        return (sample: string) =>
          loaded(byPrefix.get(sample)) ?? loaded(sample)
      },
      // Each assembly's gene track among the session's tracks, picked as the
      // backbone's is, so a walk row can read its haplotype's own annotation.
      // One pass over the tracks, not one per row.
      get geneTracksByAssembly() {
        const byAssembly = new Map<
          string,
          { trackId: string; name: string; adapterType: string }[]
        >()
        for (const t of getSession(self).tracks) {
          const adapterType = (readConfObject(t, 'adapter') as { type: string })
            .type
          if (!GENE_ADAPTER_TYPES.has(adapterType)) {
            continue
          }
          const track = {
            trackId: t.trackId as string,
            name: readConfObject(t, 'name') as string,
            adapterType,
          }
          for (const name of readConfObject(t, 'assemblyNames') as string[]) {
            const asm = canonicalAssemblyName(getSession(self), name)
            byAssembly.set(asm, [...(byAssembly.get(asm) ?? []), track])
          }
        }
        return new Map(
          [...byAssembly].flatMap(([asm, tracks]) => {
            const picked = pickGeneTrack(tracks, '')
            return picked ? [[asm, picked] as const] : []
          }),
        )
      },
    }))
    .views(self => ({
      // The gene reads walk rows need: for each row whose haplotype
      // (`HG00097#1`) names an assembly with a gene track, that track over the
      // span of its own contig the row's bar covers. The first WALK_GENE_ROWS
      // such rows are read, and the rest counted for the key.
      get walkGeneReads() {
        const bars = self.walkRowBars
        if (!bars || !self.showGenes) {
          return undefined
        }
        const reads: {
          row: string
          trackId: string
          region: SubgraphRegion
        }[] = []
        let untracked = 0
        let unplaced = 0
        for (const row of bars.rows) {
          if (!row.axis) {
            unplaced++
            continue
          }
          const assemblyName = resolveLocationAssembly(self.assemblyResolver, {
            sample: row.sample,
            haplotype:
              row.haplotype === undefined
                ? undefined
                : `${row.sample}#${row.haplotype}`,
          })
          const track = assemblyName
            ? self.geneTracksByAssembly.get(assemblyName)
            : undefined
          if (!assemblyName || !track) {
            untracked++
            continue
          }
          reads.push({
            row: row.name,
            trackId: track.trackId,
            region: {
              assemblyName,
              refName: row.axis.contig,
              ...rowSpan(row.axis, row.bp),
            },
          })
        }
        return {
          reads: reads.slice(0, WALK_GENE_ROWS),
          gaps: {
            untracked,
            unplaced,
            unread: Math.max(0, reads.length - WALK_GENE_ROWS),
          },
        }
      },
      get walkRowGeneGaps() {
        return this.walkGeneReads?.gaps
      },
      // The walk row under a pane point, as its index among the reference row
      // and the rows below it, where the point is on its bar
      walkRowAt(screenX: number, screenY: number) {
        const bars = self.walkRowBars
        if (!bars) {
          return undefined
        }
        const i = Math.round(
          (screenY - self.translateY) / (ROW_HEIGHT_PX * self.scaleY),
        )
        const row = [bars.reference, ...bars.rows][i]
        const y = i * ROW_HEIGHT_PX * self.scaleY + self.translateY
        const bp = (screenX - self.translateX) / self.scaleX - bars.origin
        return row &&
          Math.abs(screenY - y) <= WALK_BAR_PX / 2 + 2 &&
          bp >= 0 &&
          bp <= row.bp
          ? i
          : undefined
      },
      // Where a walk row's bar lies in its own assembly, for a linear view to
      // open: the span of its contig the bar covers, on the session assembly
      // its haplotype names (the cut's own assembly for the reference row).
      // The label names the haplotype when no assembly is loaded for it.
      walkRowLaunchTarget(index: number) {
        const bars = self.walkRowBars
        const row = bars ? [bars.reference, ...bars.rows][index] : undefined
        if (!row?.axis) {
          return undefined
        }
        const haplotype =
          row.haplotype === undefined
            ? undefined
            : `${row.sample}#${row.haplotype}`
        const assembly =
          index === 0
            ? self.graphRegion?.assemblyName
            : resolveLocationAssembly(self.assemblyResolver, {
                sample: row.sample,
                haplotype,
              })
        return {
          label: row.label,
          assembly,
          location: {
            sample: row.sample,
            haplotype,
            refName: row.axis.contig,
            ...rowSpan(row.axis, row.bp),
          },
        }
      },
      // Each row's genes as offsets along its bar: the reference row's from
      // the backbone's gene track, every other row's from its own assembly
      get walkRowGenes() {
        const bars = self.walkRowBars
        if (!bars || !self.showGenes) {
          return undefined
        }
        const byRow = new Map(self.walkGeneFeatures ?? [])
        if (self.geneFeatures) {
          byRow.set(bars.reference.name, self.geneFeatures)
        }
        return byRow.size
          ? placeRowGenes([bars.reference, ...bars.rows], byRow)
          : undefined
      },
    }))
    .views(self => ({
      // The contributors a view can actually be opened on: those naming an
      // assembly this session has loaded. Every strain of an E. coli pangenome
      // demo is its own assembly, so all of them resolve; an HPRC graph names
      // hundreds of haplotypes that no session loads, so only the reference
      // does.
      get launchableAssemblies() {
        return resolveContributors(
          withReferenceRegion(self.contributingAssemblies, self.graphRegion),
          self.assemblyResolver,
        )
      },
      // Whether there is a linear view this graph may draw a highlight into —
      // the paired one, or the session's only one on the reference assembly.
      // Read by the node menu, which offers the item only when it would land
      // somewhere.
      get canHighlightInLinearView() {
        const region = self.graphRegion
        return (
          region !== undefined &&
          linearViewTarget({
            views: [...getSession(self).views],
            connectedViewId: self.connectedViewId,
            assemblyName: region.assemblyName,
          }) !== undefined
        )
      },
      // Where one node can be opened: on its own assembly, and on the reference
      // the graph was cut against. Both are padded to a readable window — a
      // base-level allele is a few bp, and a linear view framed on exactly that
      // shows no context at all.
      nodeLaunchTargets(nodeId: string) {
        const node = self.nodeById?.get(nodeId)
        const own = node ? nodeOwnLocation(node) : undefined
        const ownAssembly = own
          ? resolveLocationAssembly(self.assemblyResolver, own)
          : undefined
        const region = self.graphRegion
        const nodeById = self.nodeById
        const neighbors = self.nodeNeighbors
        const span =
          region && nodeById && neighbors
            ? nodeReferenceSpan({ nodeId, nodeById, neighbors })
            : undefined
        const onReference =
          region && span
            ? {
                sample: region.assemblyName,
                haplotype: undefined,
                refName: region.refName,
                ...span,
              }
            : undefined
        return {
          own:
            own && ownAssembly
              ? { location: paddedLocation(own), assembly: ownAssembly }
              : undefined,
          reference:
            region && onReference
              ? {
                  location: paddedLocation(onReference),
                  assembly: region.assemblyName,
                }
              : undefined,
          // Unpadded: a mark is of the node, the same span its hover band
          // draws. The padding above is room to read a view opened on it.
          highlight:
            region && onReference
              ? { location: onReference, assembly: region.assemblyName }
              : undefined,
        }
      },
    }))
    .views(self => ({
      // The linear view this pane draws inside, when a display hosts it: x is
      // that view's window and the cut is re-made when the window leaves it.
      // A pane that is a view of its own has none.
      get host(): LinearHost | undefined {
        let view: unknown
        try {
          view = getContainingView(self)
        } catch {
          return undefined
        }
        return isLinearHost(view) ? view : undefined
      },
    }))
    .views(self => ({
      // Whether the drawing's x is reference bp a host can place. Walk rows
      // put the backbone at its bp too, but their bars are lengths, so the
      // mode's `cutMargins` is what says the drawing is a picture.
      get xIsReferenceBp() {
        return (
          self.layoutResult?.referenceAxis === true &&
          layoutModeByValue(self.chosenLayoutMode).cutMargins
        )
      },
    }))
    .views(self => ({
      // Whether the host places x. Only a layout whose x is reference bp can
      // take the window's transform; force, ordered and walk rows draw in
      // their own coordinates inside the track, and a popped bubble is a
      // picture of its own.
      get hostPlacesX() {
        const { host, graphRegion: region } = self
        return (
          host !== undefined &&
          host.initialized &&
          region !== undefined &&
          self.xIsReferenceBp &&
          self.popStack.length === 0 &&
          !host.dynamicBlocks.contentBlocks.some(
            b => b.refName === region.refName && b.reversed,
          )
        )
      },
    }))
    .views(self => ({
      get hostFrame() {
        const { host, graphRegion } = self
        return self.hostPlacesX && host && graphRegion
          ? hostFrame(host, graphRegion)
          : undefined
      },
      get tubeMapPicture() {
        const drawing = self.layoutResult?.tubeMap
        return drawing ? tubeMapPicture(drawing.layout) : undefined
      },
      get tubeMapReference() {
        const drawing = self.layoutResult?.tubeMap
        return drawing && self.drawnGraph
          ? referenceBoxes(self.drawnGraph, drawing.layout)
          : undefined
      },
      // the folded variants, as ticks on the tubes of the walks carrying them
      get tubeMapDeviations() {
        const coarse = self.layoutResult?.tubeMap?.coarse
        const layout = self.layoutResult?.tubeMap?.layout
        return coarse && layout
          ? deviationMarks(coarse.graph, layout, coarse.deviations)
          : []
      },
      // the reference boxes a linear view's connectors tie to its bp, which
      // the reference axis already puts under that bp
      get tubeMapReferenceNodes() {
        const layout = self.layoutResult
        return layout?.tubeMap && !layout.referenceAxis && self.drawnGraph
          ? referenceNodes(self.drawnGraph, layout.tubeMap.layout)
          : undefined
      },
    }))
    .views(self => ({
      // A linear view has the genes in a track of their own, at their bp
      get tubeMapGenes() {
        const reference = self.tubeMapReference
        return self.showGenes && !self.host && reference && self.backboneGenes
          ? tubeMapGenes(reference, self.backboneGenes)
          : []
      },
      // A drawing of nodes in its own coordinates inside a linear view, whose
      // reference segments the strip can put back at their bp
      get referenceStripApplies() {
        return (
          !!self.host?.initialized &&
          !!self.layoutResult &&
          self.drawsNodes &&
          !self.hostPlacesX &&
          !self.facetPanels
        )
      },
    }))
    .views(self => ({
      get referenceStripBlocks() {
        const { graph } = self
        return self.showReferenceStrip && self.referenceStripApplies && graph
          ? referenceStripBlocks(graph, {
              colorScheme: self.effectiveColorScheme,
              referenceRamp: self.referenceRamp,
              walks: self.walkLift?.walks,
            })
          : []
      },
      // Read off the live blocks, so the strip follows every frame of a pan
      // in the linear view
      get referenceStripFrame() {
        const { host, graphRegion } = self
        return host?.initialized && graphRegion
          ? hostFrame(host, graphRegion)
          : undefined
      },
    }))
    .views(self => ({
      get referenceStripShown() {
        return (
          self.referenceStripBlocks.length > 0 &&
          self.referenceStripFrame !== undefined
        )
      },
      // Whether the graph draws reference past the window's edges. A boolean
      // rather than the bp, which moves on every frame of a pan and would
      // resize the legend with it.
      get referenceStripOverhangs() {
        const frame = self.referenceStripFrame
        if (!frame || self.referenceStripBlocks.length === 0) {
          return false
        }
        const { left, right } = stripOverhang(
          self.referenceStripBlocks,
          frame,
          self.paneWidth,
        )
        return left > 0 || right > 0
      },
      get referenceStripFaded() {
        return self.referenceStripBlocks.some(b => b.faded)
      },
    }))
    .views(self => ({
      // The lit span on the strip, and where the graph drew what it is of:
      // the hovered node, the hovered bubble's name, or the selected node
      get referenceStripLit() {
        if (!self.referenceStripShown) {
          return undefined
        }
        const toScreen = (p: { x: number; y: number }) => ({
          x: p.x * self.scaleX + self.translateX,
          y: p.y * self.scaleY + self.translateY,
        })
        const bubble = self.hoveredNode === null ? self.hoveredBubble : null
        if (bubble) {
          const halo = self.bubbleHalos.find(h => sameBubble(h.bubble, bubble))
          return {
            start: bubble.start,
            end: bubble.end,
            anchor: halo ? toScreen(halo.labelAt) : undefined,
          }
        }
        const nodeId = self.hoveredNode ?? self.selectedNode
        const span = nodeId === null ? undefined : self.nodeSpan(nodeId)
        return span && nodeId !== null
          ? {
              ...span,
              anchor: nodeAnchor(self.nodePositions?.[nodeId], toScreen),
            }
          : undefined
      },
      referenceStripNodeAt(sx: number, sy: number) {
        const frame = self.referenceStripFrame
        return self.referenceStripShown && frame
          ? stripBlockAt(self.referenceStripBlocks, frame, sx, sy)
          : undefined
      },
      get paperCss() {
        return paperCss(self.darkMode ? PAPER_DARK : PAPER_LIGHT)
      },
      // the strip, and the gap the fit leaves under it
      get referenceStripZonePx() {
        return self.referenceStripShown ? REFERENCE_STRIP_ZONE_PX : 0
      },
    }))
    .views(self => ({
      // `paneHeight` replaces the built-in ceiling rather than adding a second
      // clamp under it, and the floor still wins: a pane shorter than
      // MIN_CANVAS_HEIGHT leaves no room to hover a node and read its tooltip,
      // which is the reason that floor exists.
      get paneCeiling() {
        return Math.max(MIN_CANVAS_HEIGHT, self.paneHeight ?? MAX_CANVAS_HEIGHT)
      },
      // Room over a tube map for the rows its genes need, one inside the
      // padding and one more for each further gene that overlaps it, and
      // room for the reference strip
      get fitPadTopBase() {
        const rows = tubeMapGeneRows(self.tubeMapGenes)
        return (
          FIT_PADDING +
          Math.max(0, rows - 1) * GENE_ROW_PX +
          self.referenceStripZonePx
        )
      },
      // The fit draws nothing under the legend. It leaves the legend room on
      // the side that costs the drawing less scale: beside a tall drawing,
      // which has width to spare, or above a wide flat one, which takes the
      // height instead. A drawing whose x the host places can only move down.
      // Reads get no room: their letters, and the legend row naming them, come
      // and go with the fit's scale.
      get legendRoom(): 'right' | 'top' | undefined {
        const bounds = self.layoutBounds
        const { width, height } = self.legendSize
        if (
          !bounds ||
          bounds.w <= 0 ||
          width === 0 ||
          self.facetPanels ||
          self.tubeMapReads
        ) {
          return undefined
        }
        if (self.hostPlacesX) {
          return 'top'
        }
        const base = this.fitPadTopBase
        // a track's height is its own
        const room = self.host ? this.canvasHeight : this.paneCeiling
        const across = (padRight: number) =>
          (self.paneWidth - self.fitPadLeft - padRight) / bounds.w
        const down = (padTop: number) =>
          self.pixelRows
            ? bounds.h + padTop + FIT_PADDING <= room
              ? Infinity
              : 0
            : (room - padTop - FIT_PADDING) / bounds.h
        const beside = Math.min(across(width + 2 * LEGEND_INSET_PX), down(base))
        const above = Math.min(
          across(FIT_PADDING),
          down(base + height + LEGEND_INSET_PX),
        )
        return above >= beside ? 'top' : 'right'
      },
      get fitPadTop() {
        return (
          this.fitPadTopBase +
          (this.legendRoom === 'top'
            ? self.legendSize.height + LEGEND_INSET_PX
            : 0)
        )
      },
      get fitPadRight() {
        return this.legendRoom === 'right'
          ? Math.max(FIT_PADDING, self.legendSize.width + 2 * LEGEND_INSET_PX)
          : FIT_PADDING
      },
      // A tube map on its own axis reads by panning along it, as in
      // sequenceTubeMap. Rather than shrink a long cut to a strip, the fit
      // stops where its tubes are MIN_FIT_TUBE_PX wide, or at whatever fits
      // the tallest pane, with the cut's left end on screen.
      get minFitScale() {
        const bounds = self.layoutBounds
        const layout = self.layoutResult
        const tubePx = layout?.tubeMap?.layout.tracks[0]?.width
        return bounds && bounds.h > 0 && tubePx && !layout.referenceAxis
          ? Math.min(
              MIN_FIT_TUBE_PX / tubePx,
              (this.paneCeiling - this.fitPadTop - FIT_PADDING) / bounds.h,
            )
          : 0
      },
      // The facet as a spec writes it: the bare field while nothing else is
      // written, the whole setting otherwise, and nothing while off
      get facetSpec(): string | FacetSetting | undefined {
        const { field, domain, columns } = self.facet
        return field === ''
          ? undefined
          : domain.length === 0 && columns === undefined
            ? field
            : {
                field,
                domain: [...domain],
                ...(columns === undefined ? {} : { columns }),
              }
      },
      // Which grid cell each panel takes; see facetCells
      get facetPlacement() {
        const panels = self.facetPanels
        const { field, domain } = self.facet
        return panels
          ? facetCells(
              panels.map(p => p.walks[0]!.name),
              self.hostPlacesX || field === '' ? 'walk' : field,
              domain,
            )
          : undefined
      },
      // How the facet panels tile the pane in `room` px. A track whose x the
      // linear view places stacks full-width panels so each keeps that x.
      facetGridIn(room: number): FacetGrid | undefined {
        const place = this.facetPlacement
        const bounds = self.layoutBounds
        return place && bounds && bounds.w > 0
          ? facetGrid({
              count: place.count,
              bounds,
              pixelRows: self.pixelRows,
              width: self.paneWidth,
              room,
              columns: self.hostPlacesX
                ? 1
                : (place.columns ?? self.facet.columns),
            })
          : undefined
      },
      get facetGrid() {
        return this.facetGridIn(
          self.host ? this.canvasHeight : this.paneCeiling,
        )
      },
      // The pane is as tall as the drawing, rather than a fixed box the drawing
      // floats in. A row layout's rows are px, so its height is a sum; an
      // isotropic layout has no height of its own and takes its aspect ratio
      // at the width's fit. Neither reads `scale`, so the fit reads this
      // without feeding back into it.
      get canvasHeight(): number {
        const bounds = self.layoutBounds
        const usableWidth = self.paneWidth - FIT_PADDING - this.fitPadRight
        const ceiling = this.paneCeiling
        if (!bounds) {
          return ceiling
        }
        const grid = this.facetGrid
        if (grid) {
          return Math.max(MIN_CANVAS_HEIGHT, grid.total)
        }
        // never shorter than the legend, which a flat drawing would clip
        const floor = Math.max(
          MIN_CANVAS_HEIGHT,
          self.legendSize.height +
            2 * LEGEND_INSET_PX +
            self.referenceStripZonePx,
        )
        if (self.pixelRows) {
          return Math.min(
            ceiling,
            Math.max(floor, bounds.h + this.fitPadTop + FIT_PADDING),
          )
        }
        return bounds.w > 0 && usableWidth > 0
          ? Math.min(
              ceiling,
              Math.max(
                floor,
                bounds.h * Math.max(usableWidth / bounds.w, this.minFitScale) +
                  this.fitPadTop +
                  FIT_PADDING,
              ),
            )
          : ceiling
      },
      // What the transform maps the drawing into: one facet panel while the
      // pane is faceted, since every panel shares it, else the pane
      get viewBox() {
        const grid = this.facetGrid
        return grid
          ? { width: grid.width, height: grid.height }
          : { width: self.paneWidth, height: this.canvasHeight }
      },
      // Where the fit puts the drawing, or undefined until there is a layout
      // and a measured canvas to fit it into
      get fittedTransform() {
        const bounds = self.layoutBounds
        const grid = this.facetGrid
        return !bounds
          ? undefined
          : grid
            ? fitTransform(bounds, grid.width, grid.height, self.pixelRows, {
                padLeft: FACET_PAD_PX,
                padTop: FACET_PAD_PX,
                padRight: FACET_PAD_PX,
                padBottom: FACET_PAD_PX,
              })
            : fitTransform(
                bounds,
                self.paneWidth,
                this.canvasHeight,
                self.pixelRows,
                {
                  minScale: this.minFitScale,
                  padLeft: self.fitPadLeft,
                  padTop: this.fitPadTop,
                  padRight: this.fitPadRight,
                },
              )
      },
    }))
    .views(self => ({
      // The window the transform shows plus a pane of overscan all round,
      // which a pan inside needs no rebuild for
      viewportToBuild() {
        return padded(paneViewportOf(self), VIEWPORT_PANES_BUILT)
      },
      // Hover and selection as draw-time colour overrides, stated whole, so
      // there is nothing to restore and nothing to go stale when a rebuild
      // renumbers the batch
      applyHighlights(b: Renderer) {
        const { hoveredNode, hoveredEdge, selectedNode } = self
        const nodes = new Map<string, number>()
        if (selectedNode !== null) {
          nodes.set(selectedNode, SELECT_BRIGHTEN)
        }
        if (hoveredNode !== null && hoveredNode !== selectedNode) {
          nodes.set(hoveredNode, HOVER_BRIGHTEN)
        }
        b.setNodeHighlights(nodes)
        b.setEdgeHighlight(hoveredEdge, HOVER_BRIGHTEN)
      },
      // Draws the uploaded batch through the pane's transform
      paint(b: Renderer) {
        // getDpr(), never a bare `devicePixelRatio`: it is capped at
        // MAX_DPR so this canvas costs what every other canvas in the app
        // costs on a 3x display (the square of the ratio, i.e. 9x the
        // pixels of 1x against the 4x everything else pays), and it is the
        // same read `syncCanvasSize` sizes the backing store with — two
        // call sites reading the global separately can disagree, and then
        // the geometry lands at a different scale from the canvas under it.
        const dpr = getDpr()
        b.updateTransform({
          scaleX: self.scaleX * dpr,
          scaleY: self.scaleY * dpr,
          translateX: self.translateX * dpr,
          translateY: self.translateY * dpr,
          // Handed over rather than read again by the backend: the
          // thicknesses in the vertex buffer are css px and are expanded
          // after this transform, so they need the same ratio the fields
          // above were already multiplied by. See TransformUniform.dpr.
          dpr,
        })
        // Clear under a reference strip: GraphCanvas lays the paper below the
        // strip, so the linear view's gridlines show through between its blocks
        b.render(
          self.referenceStripShown
            ? [0, 0, 0, 0]
            : self.darkMode
              ? PAPER_DARK
              : PAPER_LIGHT,
        )
      },
    }))
    .views(self => ({
      // The drawing's batch with `highlight`'s walks lifted, for the window
      // the transform shows. A caller's autorun rebuilds it when the window
      // settles after a pan or zoom, when a drag moves the positions, and when
      // any display option read here changes.
      buildDrawing(highlight: WalkLift | undefined, drawPaths: boolean) {
        const { nodePositions, graph, nodeById } = self
        if (!nodePositions || !graph || !nodeById) {
          return undefined
        }
        dependOn(self.viewportDirty, self.positionsVersion)
        const viewportBounds = untracked(() => self.viewportToBuild())
        const batch = buildGeometry({
          // walk rows' overlay draws every bar, the reference's among them;
          // its nodes stay in the hit index, so hovering the bar finds them
          nodePositions: self.walkRowBars ? {} : nodePositions,
          graph,
          nodeById,
          colorScheme: self.effectiveColorScheme,
          contigThickness: self.contigThickness,
          connectorThickness: self.connectorThickness,
          drawPaths,
          nodeWidth: self.nodeWidth,
          highlight,
          // Untracked, so a zoom does not eagerly rebuild geometry — the
          // debounced viewportDirty bump drives the scale-dependent rebuild
          // (flatness, arrow visibility, viewport culling), same as pan.
          axis: untracked(() => self.axisScale),
          linearLayout: self.linearLayout,
          viewportBounds,
          // Held against the graph rather than derived here, the same way
          // `deletions` is and for the same reason — see `referenceRamp`.
          referenceRamp: self.referenceRamp,
          deletions: self.deletionEdgeIndexes,
          hiddenEdges: self.hiddenEdgeIndexes,
          // passed so the shared edge-curve cache can tell a drag from a pan
          version: self.positionsVersion,
        })
        return { batch, viewportBounds }
      },
      get overlayLabels() {
        return layoutLabels(self)
      },
      // where the hovered node sits on a lifted walk, while one is hovered
      hoveredOn(walk: LiftedWalk) {
        const id = self.hoveredNode
        const node = id ? self.nodeById?.get(id) : undefined
        return node
          ? (walkPosition(walk, node.id, node.length) ?? 'not on this walk')
          : undefined
      },
      // The spec bandage-figure makes this drawing from with no browser, or
      // undefined for a graph it cannot read again: one cut from a gbz-base
      // track or read from a GFA url, with the genes of a GFF3 tabix track
      figureSpec() {
        const region = self.graphRegion
        const adapter = self.sourceAdapter
        const panSN = adapter?.assemblyNameToPanSN as
          Record<string, string> | undefined
        const window =
          region && `${region.refName}:${region.start}-${region.end}`
        const gfa = uriOf(self.sourceGfaLocation)
        const db =
          adapter?.type === 'GbzBaseSyntenyAdapter'
            ? uriOf(adapter.gbzDbLocation as FileLocation)
            : undefined
        const source = gfa
          ? { gfa, region: window }
          : db && region && window
            ? {
                gbz: {
                  db,
                  index: uriOf(adapter!.haplotypeIndexLocation as FileLocation),
                  region: window,
                  // the adapter cuts a lane by its PanSN prefix
                  haplotypes: self.cutHaplotypes?.map(
                    lane => panSN?.[lane] ?? lane,
                  ),
                  referenceSample:
                    (adapter!.referenceSample as string | undefined) ||
                    panSN?.[region.assemblyName] ||
                    region.assemblyName,
                  context: adapter!.context as number | undefined,
                  snarls: adapter!.subgraphSnarls as string | undefined,
                },
              }
            : undefined
        if (!source) {
          return undefined
        }
        const geneTrack = self.showGenes ? self.geneTrack : undefined
        const geneConf = geneTrack
          ? getSession(self).tracks.find(t => t.trackId === geneTrack.trackId)
          : undefined
        const geneAdapter = geneConf
          ? expandTabixShorthand(
              readConfObject(geneConf, 'adapter') as Record<string, unknown>,
              'gffGzLocation',
            )
          : undefined
        const genes =
          geneAdapter?.type === 'Gff3TabixAdapter'
            ? {
                file: uriOf(geneAdapter.gffGzLocation as FileLocation),
                index: uriOf(
                  (geneAdapter.index as { location?: FileLocation } | undefined)
                    ?.location,
                ),
                format: 'gff3',
              }
            : undefined
        return JSON.parse(
          JSON.stringify({
            ...source,
            genes: genes?.file && genes.index ? genes : undefined,
            referencePath: self.referencePath || undefined,
            layout: self.chosenLayoutMode,
            quality: self.layoutQuality,
            bubbleSpread: self.bubbleSpread,
            walks: self.walkLayers.length
              ? self.walkLayers.map(l => (l.color ? l : l.walk))
              : undefined,
            facet: self.walkLayers.length > 1 ? self.facetSpec : undefined,
            width: self.paneWidth,
            height: self.paneCeiling,
            colorScheme: self.chosenColorScheme,
            nodeWidth: self.nodeWidth,
            showDeletionEdges: self.showDeletionEdges || undefined,
          }),
        ) as Record<string, unknown>
      },
      // Why the drawing cannot be written as SVG, which draws the canvas's
      // nodes, or walk rows' bars
      get figureUnavailable() {
        return !self.layoutResult
          ? 'Nothing is drawn yet'
          : self.drawsNodes || self.walkRowBars
            ? undefined
            : `${layoutModeByValue(self.chosenLayoutMode).label} draws a picture of its own, which the SVG export does not`
      },
      // The drawing as a standalone SVG, fitted, with its genes, its lifted
      // walks' keys and facet panels; see figureSvg
      figure() {
        const { graph, layoutResult } = self
        return graph && layoutResult && !this.figureUnavailable
          ? figureSvg(graph, layoutResult, {
              width: self.paneWidth,
              height: self.paneCeiling,
              walks: self.walkLayers,
              facet: self.facetSpec,
              colorScheme: self.effectiveColorScheme,
              nodeWidth: self.nodeWidth,
              showDeletionEdges: self.showDeletionEdges,
              contigThickness: self.contigThickness,
              connectorThickness: self.connectorThickness,
              region: self.graphRegion,
              colorDomain: self.colorDomain,
              fitToDrawing: self.popStack.length > 0,
              genes: self.showGenes ? self.backboneGenes : undefined,
              walkRows: self.walkRowBars,
              rowGenes: self.walkRowGenes,
              rowGeneGaps: self.walkRowGeneGaps,
              spec: this.figureSpec(),
            })
          : undefined
      },
      get tubeMapFrame() {
        const drawing = self.layoutResult?.tubeMap
        return drawing
          ? tubeMapFrame(drawing, {
              scaleX: self.scaleX,
              translateX: self.translateX,
              scaleY: self.scaleY,
              translateY: self.translateY,
              usableHeight: self.canvasHeight - self.fitPadTop - FIT_PADDING,
            })
          : undefined
      },
    }))
    .views(self => ({
      // the reference ruler under the tubes, unless the linear view's ruler
      // is already the axis
      get tubeMapRulerBoxes() {
        const reference = self.tubeMapReference
        return reference && !self.hostPlacesX
          ? rulerBoxes(reference)
          : undefined
      },
      // The connectors run from the top of the pane down to the tubes' top
      get connectorZoneBottom() {
        const picture = self.tubeMapPicture
        const frame = self.tubeMapFrame
        return picture && frame ? frame.y(picture.bounds.minY) - 2 : 0
      },
      // Read off the live blocks, so the bands' tops follow every frame of a
      // pan in the linear view and their bottoms every pan of the tubes
      get tubeMapConnectors() {
        const nodes = self.tubeMapReferenceNodes
        const frame = self.tubeMapFrame
        const { host, graphRegion } = self
        const bp =
          nodes && frame && host?.initialized && graphRegion
            ? hostFrame(host, graphRegion)
            : undefined
        return nodes && frame && bp
          ? tubeMapConnectors(
              nodes,
              b => b * bp.scale + bp.translateX,
              frame.x,
              self.paneWidth,
            )
          : []
      },
    }))
    .views(self => ({
      // What the tube map's legend has to explain: that on the own axis a
      // box is as wide as the log of its length, the fold its walks' ticks
      // stand for, the reads' strands, and the marks on the reads in view
      get tubeMapKeys() {
        const layout = self.layoutResult
        const reads = layout?.tubeMap?.layout.reads ?? []
        const picture = self.tubeMapPicture
        const frame = self.tubeMapFrame
        const shown =
          picture && frame && mismatchesLegible(frame.yScale)
            ? picture.mismatches.filter(m =>
                mismatchOnScreen(m, { x: frame.x, width: self.paneWidth }),
              )
            : []
        return {
          logWidths: layout?.tubeMap !== undefined && !layout.referenceAxis,
          foldBp:
            self.tubeMapDeviations.length > 0 ? self.tubeMapFold : undefined,
          forwardReads: reads.some(r => !r.is_reverse),
          reverseReads: reads.some(r => r.is_reverse),
          mismatches: new Set(shown.map(m => m.kind)),
        }
      },
      tubeMapNodeAt(sx: number, sy: number) {
        const drawing = self.layoutResult?.tubeMap
        const frame = self.tubeMapFrame
        return (
          (drawing && frame ? tubeMapNodeAt(drawing, frame, sx, sy) : null) ??
          connectorAt(
            self.tubeMapConnectors,
            self.connectorZoneBottom,
            sx,
            sy,
          ) ??
          null
        )
      },
    }))
    .actions(self => ({
      setError(error: unknown) {
        self.error = error
        self.isLoading = false
        self.statusMessage = ''
      },
      finishLoading() {
        self.isLoading = false
        self.statusMessage = ''
      },
      setStatusMessage(message: string) {
        self.statusMessage = message
      },
      setFetchMs(ms: number) {
        self.lastFetchMs = ms
      },
      setLayoutMs(ms: number) {
        self.lastLayoutMs = ms
      },
      setGeometryMetrics(
        ms: number,
        strokeCount: number,
        built: { scale: number; bounds: Bounds },
      ) {
        self.lastGeometryMs = ms
        self.lastGeometryStrokeCount = strokeCount
        self.builtViewport = { ...built, viewportDirty: self.viewportDirty }
        self.geometryVersion++
      },
      markPainted() {
        self.paintedViewport = self.builtViewport
      },
      setLayoutQuality(quality: number) {
        self.layoutQuality = quality
      },
      setLinearLayout(linear: boolean) {
        self.linearLayout = linear
      },
      setLayoutMode(mode: LayoutModeValue) {
        self.layoutMode = mode
      },
      // Re-anchor in place rather than re-parsing: the coordinate walk is
      // already recorded on the graph, and only which path counts as rank 0
      // changes. The caller recomputes the layout, the same way it does after
      // setLayoutMode. An rGFA is left alone — its coordinates are not derived.
      setReferencePath(name: string) {
        self.referencePath = name
        const graph = self.graph
        if (graph?.anchoredBy === 'paths') {
          const reanchored = anchorFromPaths(graph, name)
          inheritForceLayouts(graph, reanchored)
          self.graph = reanchored
        }
      },
      setDrawPaths(draw: boolean) {
        self.drawPaths = draw
      },
      setShowPerf(show: boolean) {
        self.showPerf = show
      },
      setColorScheme(scheme: ColorScheme) {
        self.colorScheme = scheme
      },
      setBubbleSpread(spread: BubbleSpread) {
        self.bubbleSpread = spread
      },
      setNodeWidth(width: NodeWidth) {
        self.nodeWidth = width
      },
      setShowBubbles(show: boolean) {
        self.showBubbles = show
      },
      setShowDeletionEdges(show: boolean) {
        self.showDeletionEdges = show
      },
      setShowGenes(show: boolean) {
        self.showGenes = show
      },
      setShowReferenceStrip(show: boolean) {
        self.showReferenceStrip = show
      },
      setTubeMapFold(bp: number) {
        self.tubeMapFold = bp
      },
      setGeneTrackId(trackId: string) {
        self.geneTrackId = trackId
      },
      setRepeatTrackId(trackId: string) {
        self.repeatTrackId = trackId
      },
      setRepeatKey(key: string) {
        self.repeatKey = key
      },
      setWalkLayers(layers: WalkLayer[]) {
        self.walkLayers = layers
      },
      // Lift the walks named, in that order, keeping the colour any of them
      // already had
      liftWalks(names: string[]) {
        const had = new Map(self.walkLayers.map(l => [l.walk, l]))
        self.walkLayers = names.map(walk => had.get(walk) ?? { walk })
      },
      // The field the panels split on; a change of field drops the order
      // written for the old one and keeps the column count
      setFacet(field: FacetSetting['field']) {
        if (field !== self.facet.field) {
          self.facet.domain = []
        }
        self.facet.field = field
      },
      setFacetColumns(columns: number | undefined) {
        self.facet.columns = columns
      },
      toggleWalk(walk: string) {
        const layers = self.walkLayers
        self.walkLayers = layers.some(l => l.walk === walk)
          ? layers.filter(l => l.walk !== walk)
          : [...layers, { walk }]
      },
      setWalkColor(walk: string, color: Partial<WalkEncoding>) {
        self.walkLayers = self.walkLayers.map(l =>
          l.walk === walk ? { ...l, color: { ...l.color, ...color } } : l,
        )
      },

      // Undefined restores the built-in ceiling. Nothing recomputes: the pane
      // reads canvasHeight and the drawing is placed by zoomToFit, which the
      // caller runs if it wants the drawing refitted into the new pane.
      setPaneHeight(px: number | undefined) {
        self.paneHeight = px
      },
      setWalkRowSamples(samples: string[] | undefined) {
        self.walkRowSamples = samples
      },
      // Pair with a linear view for the hover sync, without ever repointing an
      // existing pairing: a graph launched *from* an LGV is already paired with
      // it, and stealing that would break the sync the user came in on. So a
      // launch out of the graph only claims the slot when it is empty.
      //
      // A slot naming a view that has been closed is empty too. Held, the view
      // the graph opened next never got its hover, since a highlight is drawn
      // only in the paired view.
      pairWithLinearView(viewId: string) {
        const paired = self.connectedViewId
        const stillOpen =
          paired !== undefined &&
          withRows([...getSession(self).views]).some(
            view => (view as { id?: unknown }).id === paired,
          )
        if (!stillOpen) {
          self.connectedViewId = viewId
        }
      },
      setHoveredNode(nodeId: string | null) {
        self.hoveredNode = nodeId
      },
      setHoveredRowWalks(walks: string[]) {
        if (walks.join('\n') !== self.hoveredRowWalks.join('\n')) {
          self.hoveredRowWalks = walks
        }
      },
      setHoveredBubble(bubble: MinigraphBubble | null) {
        self.hoveredBubble = bubble
      },
      setPointerInPane(inside: boolean) {
        self.pointerInPane = inside
      },
      setLegendSize(size: { width: number; height: number }) {
        self.legendSize = size
      },
      setHoveredEdge(edgeIdx: number | null) {
        self.hoveredEdge = edgeIdx
      },
      setSelectedNode(nodeId: string | null) {
        self.selectedNode = nodeId
      },
      setDraggingNode(nodeId: string | null) {
        self.draggingNode = nodeId
      },
      setPanning(panning: boolean) {
        self.isPanning = panning
      },
      stopDragging() {
        self.draggingNode = null
        self.isPanning = false
      },
      // Everything that names a part of the current graph. Reset when the graph
      // is replaced, and by clearGraph.
      clearInteractionState() {
        self.hoveredNode = null
        self.hoveredBubble = null
        self.hoveredEdge = null
        self.selectedNode = null
        self.draggingNode = null
        self.isPanning = false
      },
      showNodeDetails(nodeId: string) {
        const node = self.nodeById?.get(nodeId)
        const nodeById = self.nodeById
        const neighbors = self.nodeNeighbors
        if (node && nodeById && neighbors) {
          const session = getSession(self)
          const region = self.graphRegion
          // refName/start/end are what makes the widget show a location rather
          // than a bare id, and they are the same span the linear view
          // highlights on hover.
          const span = region
            ? nodeReferenceSpan({ nodeId, nodeById, neighbors })
            : undefined
          if (isSessionModelWithWidgets(session)) {
            session.showWidget(
              session.addWidget('BaseFeatureWidget', 'baseFeature', {
                featureData: {
                  id: node.id,
                  name: node.name,
                  length: node.length,
                  depth: node.depth,
                  rank: node.stable?.rank,
                  stableName: node.stable?.refName,
                  // The assembly that contributed this segment, split off the
                  // stable name. On an HPRC graph this is the only thing that
                  // says which of 400-odd haplotypes an allele came from.
                  contributingAssembly: nodeOwnLocation(node)?.sample,
                  // and the haplotype, where the graph's names state one:
                  // the assembly to load to open this node on its own
                  // coordinates
                  contributingHaplotype: nodeOwnLocation(node)?.haplotype,
                  // Every haplotype whose path visits it, which only a path
                  // GFA records. Absent on an rGFA, where
                  // `contributingAssembly` is the first-seen assembly alone.
                  samples: node.samples?.join(', '),
                  ...(region && span
                    ? {
                        refName: region.refName,
                        assemblyName: region.assemblyName,
                        start: span.start,
                        end: span.end,
                      }
                    : {}),
                },
              }),
            )
          }
        }
      },

      // A gesture on a hosted graph moves the linear view, and the frame
      // clock brings x back here; y stays the pane's own.
      setTransform(s: number, tx: number, ty: number) {
        const { host } = self
        if (self.viewportOwner === 'host' && host) {
          host.horizontalScroll(self.translateX - tx)
        } else {
          self.viewportOwner = 'user'
          self.scale = clampZoom(s)
          self.translateX = tx
        }
        self.translateY = ty
      },
      zoom(factor: number, centerX: number, centerY: number) {
        const { host } = self
        if (self.viewportOwner === 'host' && host) {
          host.zoomTo(host.bpPerPx / factor, centerX)
          return
        }
        self.viewportOwner = 'user'
        const t = zoomAbout(self, factor, centerX, centerY, self.pixelRows)
        self.scale = t.scale
        self.translateX = t.translateX
        self.translateY = t.translateY
      },
      setViewportDirty() {
        self.viewportRebuildPending = false
        self.viewportDirty++
      },
      // The positions themselves moved, as opposed to the window onto them.
      setPositionsDirty() {
        self.positionsVersion++
      },
      zoomToFit() {
        // A host owns x, so a fit while hosted places the rows only.
        if (self.viewportOwner === 'host') {
          const bounds = self.layoutBounds
          const faceted = self.facetGrid !== undefined
          const pad = faceted ? FACET_PAD_PX : FIT_PADDING
          const padTop = faceted ? FACET_PAD_PX : self.fitPadTop
          const usableHeight = self.viewBox.height - padTop - pad
          if (bounds && usableHeight > 0) {
            self.translateY = fittedTranslateY(
              bounds,
              usableHeight,
              self.scaleY,
              padTop,
            )
          }
          return
        }
        // Nothing to fit into before the canvas is measured. The fit autorun
        // runs again once width lands, so skipping beats persisting a negative
        // scale into the session snapshot.
        const fit = self.fittedTransform
        if (fit) {
          self.scale = fit.scale
          self.translateX = fit.translateX
          self.translateY = fit.translateY
        }
      },
      clearPerfMetrics() {
        self.lastFetchMs = undefined
        self.lastLayoutMs = undefined
        self.lastGeometryMs = undefined
        self.lastGeometryStrokeCount = undefined
        self.builtViewport = undefined
      },
    }))
    .actions(self => ({
      // The frame clock. Unclamped, since clampZoom's floor is there to keep a
      // scale finite and 1 / bpPerPx already is; clamped, a whole-chromosome
      // window would stop lining up.
      hostTransform(scale: number, translateX: number) {
        const engaging = self.viewportOwner !== 'host'
        if (engaging) {
          self.viewportOwner = 'host'
        }
        self.scale = scale
        self.translateX = translateX
        if (engaging) {
          self.zoomToFit()
        }
      },
      // Faceting changes the box the drawing is fitted into, so a drawing the
      // user placed is fitted again; a host keeps its x
      refitView() {
        if (self.viewportOwner === 'user') {
          self.viewportOwner = 'fit'
        }
        self.zoomToFit()
      },
      // A drawing still on the reference stays where the host left it; one
      // whose x no longer means bp is refit.
      releaseHost() {
        if (self.viewportOwner === 'host') {
          if (self.xIsReferenceBp) {
            self.viewportOwner = 'user'
          } else {
            self.viewportOwner = 'fit'
            self.zoomToFit()
          }
        }
      },
    }))
    .actions(self => {
      // Pan/zoom can wait: the geometry on screen is still correct while the
      // gesture runs (the viewport bounds carry 20% overscan), so rebuilding is
      // deferred until the user settles.
      function scheduleViewportDirty() {
        clearTimeout(self.viewportDirtyTimer)
        self.viewportRebuildPending = true
        self.viewportDirtyTimer = setTimeout(() => {
          if (isAlive(self)) {
            self.setViewportDirty()
          }
        }, VIEWPORT_DEBOUNCE_MS)
      }

      // A node drag cannot wait — the node only moves on screen when its
      // geometry is rebuilt — but a bump costs a full geometry rebuild plus
      // invalidation of both hit-detection indexes, and mousemove fires in
      // bursts well above the frame rate. Coalescing to the next frame keeps the
      // drag live while bounding that work to once per frame instead of once
      // per event.
      function requestPositionsDirtyFrame() {
        cancelAnimationFrame(self.positionsDirtyFrame)
        self.positionsDirtyFrame = requestAnimationFrame(() => {
          if (isAlive(self)) {
            self.setPositionsDirty()
          }
        })
      }

      return {
        // Moves the position objects IN PLACE, which is the one thing
        // jbrowse-components' upload invariant says not to do ("per-region
        // upload values must be freshly constructed, never mutated — backends
        // diff by reference identity"), so it is worth saying why this is not
        // that case and what it costs instead.
        //
        // Nothing here diffs by identity: the geometry is rebuilt wholesale and
        // handed over as one batch, so `nodePositions` identity is not a
        // protocol between the model and the backend the way a per-region map
        // is. What identity DOES drive is the fit: the zoom-to-fit autorun and
        // `layoutBounds` — and so `canvasHeight` — key off `layoutResult`, and
        // they mean "a new LAYOUT arrived", not "a node moved". Publishing a
        // fresh positions record per frame of a drag would refit the drawing
        // and resize the pane under the cursor, sixty times a second.
        //
        // So the change is announced by `positionsVersion` instead, and every
        // cache that would otherwise trust identity takes it as a key. The cost
        // of that trade is that the version is a thing to remember: a caller
        // that mutates here and does not bump it gets stale curves, stale hit
        // boxes and stale labels, silently. Everything downstream of it is
        // reached from this one action.
        moveNode(nodeId: string, dx: number, dy: number) {
          const positions = self.layoutResult?.nodePositions
          if (positions?.[nodeId]) {
            for (const seg of positions[nodeId]) {
              seg.x += dx
              seg.y += dy
            }
            requestPositionsDirtyFrame()
          }
        },
        scheduleViewportDirty,
      }
    })
    .actions(self => {
      let loadController: AbortController | undefined

      function callEngine(request: EngineRequest) {
        const { rpcManager } = getSession(self)
        return rpcManager.call(getRpcSessionId(self), 'GraphComputeLayout', {
          ...request,
          signal: loadController?.signal,
          // A StatusCallback takes an RpcStatus, not a string — it may be a
          // bare label, a phase, or a phase that threw. `statusMessageText` is
          // core's reader for the human-facing line.
          statusCallback: status => {
            self.setStatusMessage(statusMessageText(status) ?? '')
          },
        }) as Promise<{ result: LayoutResult; duration: number }>
      }

      // The engine's inputs, and only those: the graph, plus what `callLayout`
      // puts in `options`. The reference path is there because the seeds are a
      // function of it; the colour scheme and the anchored modes' own settings
      // are absent because none of them reaches the engine.
      function forceLayoutKey(graph: Graph) {
        return engineKey(graph, {
          quality: self.layoutQuality,
          linearLayout: self.linearLayout,
          bubbleSpread: self.bubbleSpread,
        })
      }

      // Single dispatch point for every layout mode. A mode that returns a
      // result computed it locally; one that returns undefined can't draw this
      // graph and hands off to the remote FMMM engine, which is also how
      // 'force' is expressed. See LAYOUT_MODES.
      function* computeLayout(graph: Graph) {
        const start = performance.now()
        const tubeMap = TUBE_MAP_MODES.has(self.chosenLayoutMode)
        // a tube map draws the window; the cut's context is for walk rows
        const region = self.graphRegion
        const drawn = tubeMap && region ? trimToWindow(graph, region) : graph
        // reads are placed by the cut's segment names, which a fold renames
        const coarse =
          tubeMap && self.tubeMapFold > 0 && !drawn.reads
            ? coarsenTubeMap(drawn, self.tubeMapFold)
            : undefined
        const local = layoutModeByValue(self.chosenLayoutMode).run(
          coarse?.graph ?? drawn,
          self.graphRegion,
          self.host ? self.layoutResult?.sampleRows : undefined,
        )
        if (local) {
          const result =
            coarse && local.tubeMap
              ? { ...local, tubeMap: { ...local.tubeMap, coarse } }
              : local
          return { result, duration: performance.now() - start }
        }
        const cache = forceLayoutsOf(graph)
        const key = forceLayoutKey(graph)
        const hit = cache.get(key)
        if (hit) {
          return { result: hit, duration: performance.now() - start }
        }
        const oriented = (yield forceLayout(
          graph,
          {
            quality: self.layoutQuality,
            linearLayout: self.linearLayout,
            bubbleSpread: self.bubbleSpread,
          },
          callEngine,
        )) as { result: LayoutResult; duration: number }
        // Under the key read BEFORE the call: the settings that produced this
        // drawing are not necessarily the ones on screen now, and filing it
        // under the current ones would serve it up as a layout it is not.
        remember(cache, key, oriented.result)
        return oriented
      }

      // Which layout request is the live one. A layout is async and nothing in
      // the UI waits for it, so several are routinely in flight: every control
      // in the settings dialog fires `recomputeLayout` on change, and a force
      // layout takes seconds where an anchored one is instant.
      //
      // The graph identity below is not enough to order them, because the
      // competing requests are usually layouts of the SAME graph. Left to
      // resolve order the last one to FINISH won rather than the last one
      // asked for, so switching away from a slow force layout — to an anchored
      // mode, a cheaper bubble spread, a lower quality — drew the abandoned
      // one over the top of the chosen one seconds later, with the dropdown
      // still naming the choice that was discarded.
      let liveRequest = 0
      // a haplotype's genes by track and contig span, kept across cuts
      const walkGeneCache = new Map<string, GeneModel[]>()

      // Applied under a guard because a layout is async and the user can load a
      // different graph, or ask for a different layout of it, while one is in
      // flight; the stale result must not land.
      function* layoutInto(graph: Graph) {
        const request = ++liveRequest
        const isLive = () => self.graph === graph && request === liveRequest
        const signal = loadController?.signal
        let computed
        try {
          computed = yield* computeLayout(graph)
        } catch (e) {
          // A discarded layout's failure is not the user's problem: the drawing
          // they asked for is on screen or on its way, and raising a banner
          // over it reports a graph as broken because a setting they moved on
          // from could not be drawn. An aborted one was discarded by the load
          // that replaced it, even when the graph is still the same object.
          if (!isLive() || signal?.aborted) {
            return false
          }
          throw e
        }
        const live = isLive()
        if (live) {
          self.layoutResult = computed.result
          self.setLayoutMs(computed.duration)
        }
        return live
      }

      // The walk a path graph's track puts on the region's assembly: the one
      // that names it, else the one chooseReferencePath infers
      function loadedReference(graph: Graph, region: SubgraphRegion) {
        const paths = graph.anchorPaths
        return graph.anchoredBy === 'paths' && paths
          ? (
              assemblyWalk(
                graph,
                self.assemblySpellings(region.assemblyName),
              ) ?? chooseReferencePath(paths, region.assemblyName)
            )?.name
          : undefined
      }

      // `keepSelection` for a re-cut of the same source: node ids survive one
      // where edge indexes do not, so the selection is found again by id.
      // `readsOf` fetches the reads over the parsed graph before its one
      // layout, since the tube map lays them out with the paths.
      function* parseAndLayout(
        text: string,
        name: string,
        region: SubgraphRegion | undefined,
        keepSelection = false,
        readsOf?: (graph: Graph) => Promise<GafReads>,
      ) {
        const signal = loadController?.signal
        self.setStatusMessage('Parsing GFA')
        const parsed = loadGraph(text, name, {
          referencePath: self.referencePath || region?.assemblyName,
          maxNodes: self.maxGraphNodes,
        })
        const loaded = region ? loadedReference(parsed, region) : undefined
        const graph =
          !self.referencePath &&
          loaded !== undefined &&
          loaded !== parsed.referencePath
            ? anchorFromPaths(parsed, loaded)
            : parsed
        if (readsOf) {
          self.setStatusMessage('Reading alignments')
          try {
            const { records, total } = (yield readsOf(graph)) as GafReads
            graph.reads = records
            self.readsShown = { shown: records.length, total }
          } catch (e) {
            if (signal?.aborted) {
              return
            }
            console.warn('[GraphGenomeView] no reads for this graph', e)
            self.readsShown = undefined
          }
          if (signal?.aborted) {
            return
          }
        } else {
          self.readsShown = undefined
        }
        const selected = keepSelection ? self.selectedNode : null
        self.graph = graph
        self.graphRegion = region
        self.loadedReferencePath = loaded
        self.indexBubbles = undefined
        self.geneFeatures = undefined
        self.walkGeneFeatures = undefined
        walkGeneCache.clear()
        self.repeatArrays = undefined
        self.popStack = []
        // hoveredEdge is an index into graph.edges and hoveredNode/selectedNode
        // are ids, so all three address the graph being replaced here. Carrying
        // them over points the tooltip and the highlight at whatever now happens
        // to sit at that index.
        self.clearInteractionState()
        if (selected !== null && self.nodeById?.has(selected)) {
          self.selectedNode = selected
        }
        self.setStatusMessage('Computing layout')
        yield* layoutInto(graph)
      }

      // Which load is the live one, for the reason liveRequest orders layouts:
      // every change in the settings dialog re-cuts, a remote cut takes seconds,
      // and the last one to finish is not the last one asked for.
      let liveLoad = 0

      function beginLoad() {
        const load = ++liveLoad
        loadController?.abort()
        loadController = new AbortController()
        self.loadCanceled = false
        return {
          isLive: () => load === liveLoad,
          signal: loadController.signal,
        }
      }

      // The bubble index that the hosted HPRC build keeps beside its segments,
      // `<prefix>.bubbles.bed.gz`, read through the bubble adapter over the same
      // window. A graph whose source has no such file, the ordinary case for a
      // graph of one's own, keeps its derived bubbles, so a failure here is not
      // the graph's problem. A coarse cut reads none: its nodes are the
      // bubbles, and the index over its window can run to a chromosome's rows.
      function* loadBubbles(
        adapterConfig: Record<string, unknown>,
        region: SubgraphRegion,
        isLive: () => boolean,
      ) {
        // The track config arrives as written, so the prefix is either the
        // `uri` shorthand or the segments location it expands to.
        const prefix = bubblePrefix(adapterConfig)
        if (adapterConfig.type !== 'RgfaTabixAdapter' || prefix === undefined) {
          return
        }
        try {
          const features = (yield getSession(self).rpcManager.call(
            getRpcSessionId(self),
            'CoreGetFeatures',
            {
              adapterConfig: {
                type: 'MinigraphBubbleAdapter',
                uri: `${prefix}.bubbles.bed.gz`,
                baseUri: adapterConfig.baseUri,
                assemblyNameToPanSN: adapterConfig.assemblyNameToPanSN,
              },
              regions: [region],
            },
          )) as Feature[]
          if (isLive()) {
            self.indexBubbles = features.map(f => ({
              refName: region.refName,
              start: f.get('start'),
              end: f.get('end'),
              segmentCount: f.get('segmentCount') as number,
              pathCount: (f.get('pathCount') as number | undefined) ?? 0,
              inversion: f.get('inversion') as boolean,
              shortestAlleleLength: f.get('shortestAlleleLength') as number,
              longestAlleleLength: f.get('longestAlleleLength') as number,
              segments: f.get('segments') as string,
              shortestAllele: undefined,
              longestAllele: undefined,
            }))
          }
        } catch (e) {
          console.warn('[GraphGenomeView] no bubble index for this graph', e)
        }
      }

      // A session track's features over the cut. Undefined when the session
      // has no such track or the read fails: an annotation is never the
      // graph's problem.
      function* trackFeatures(
        trackId: string | undefined,
        region: SubgraphRegion,
        what: string,
      ) {
        const session = getSession(self)
        const config = trackId
          ? session.tracks.find(t => t.trackId === trackId)
          : undefined
        if (!config) {
          return undefined
        }
        try {
          return (yield session.rpcManager.call(
            getRpcSessionId(self),
            'CoreGetFeatures',
            {
              adapterConfig: readConfObject(config, 'adapter'),
              regions: [region],
            },
          )) as Feature[]
        } catch (e) {
          console.warn(`[GraphGenomeView] no ${what} for this graph`, e)
          return undefined
        }
      }

      // The genes over the cut, from the session's annotation track for the
      // assembly, so the backbone can carry its exons and names.
      function* loadGenes(region: SubgraphRegion, isLive: () => boolean) {
        const features = yield* trackFeatures(
          self.geneTrack?.trackId,
          region,
          'genes',
        )
        if (features && isLive()) {
          self.geneFeatures = geneModelsFrom(features)
        }
      }

      // The tandem repeat arrays over the cut, from the session's repeat
      // track, for the walk rows to measure between and tile by.
      function* loadRepeats(region: SubgraphRegion, isLive: () => boolean) {
        const features = yield* trackFeatures(
          self.repeatTrack?.trackId,
          region,
          'repeats',
        )
        if (features && isLive()) {
          self.repeatArrays = repeatArraysFrom(features)
        }
      }

      // Raises `isLoading` before any fetch, so a view waiting on a remote file
      // shows its loading state instead of the import form. Text already in
      // hand is parsed without yielding first. `region` is the window a
      // declared file was stated beside, which the parse anchors on.
      function* loadWholeGFA(
        name: string,
        source: string | ((signal: AbortSignal) => Promise<string>),
        region?: SubgraphRegion,
      ) {
        const { isLive, signal } = beginLoad()
        self.isLoading = true
        self.error = undefined
        try {
          const text =
            typeof source === 'string'
              ? source
              : ((yield source(signal)) as string)
          if (isLive()) {
            yield* parseAndLayout(text, name, region)
          }
        } catch (e) {
          if (isLive()) {
            console.error('[GraphGenomeView.loadWholeGFA]', e)
            self.error = e
          }
        } finally {
          if (isLive()) {
            self.finishLoading()
          }
        }
        return isLive()
      }

      function abortLoad() {
        loadController?.abort()
        loadController = undefined
        liveLoad++
        liveRequest++
      }

      return {
        // Back to the import form: drop the graph and everything derived from
        // it. Any load in flight ends here too, or it would land its graph
        // afterwards.
        clearGraph() {
          abortLoad()
          self.graph = undefined
          self.graphRegion = undefined
          self.loadedReferencePath = undefined
          self.layoutResult = undefined
          self.indexBubbles = undefined
          self.geneFeatures = undefined
          self.repeatArrays = undefined
          self.popStack = []
          self.error = undefined
          self.isLoading = false
          self.loadCanceled = false
          self.statusMessage = ''
          self.clearInteractionState()
          self.clearPerfMetrics()
        },
        // The user's stop, leaving whatever is drawn under it
        stopLoad() {
          abortLoad()
          self.isLoading = false
          self.statusMessage = ''
          self.loadCanceled = true
        },
        beforeDestroy() {
          abortLoad()
        },
        loadGFA: flow(function* (text: string, name = 'Imported GFA') {
          yield* loadWholeGFA(name, text)
        }),
        loadGFAFromLocation: flow(function* (
          location: FileLocation,
          region?: SubgraphRegion,
        ) {
          self.setStatusMessage('Fetching GFA')
          const live = yield* loadWholeGFA(
            'uri' in location
              ? (location.uri.split('/').pop() ?? 'GFA')
              : 'GFA',
            signal =>
              openLocation(location).readFile({ encoding: 'utf8', signal }),
            region,
          )
          if (region && live && self.graph) {
            yield* loadRepeats(region, () => self.graphRegion === region)
          }
        }),
        // One cut of a region, laid out with the annotations over it. Whether
        // the region may be cut is the caller's call; overlapping cuts are
        // ordered by liveLoad, so the latest one lands.
        cutSubgraph: flow(function* (
          adapterConfig: Record<string, unknown>,
          region: SubgraphRegion,
          opts: SubgraphCutOptions = {},
        ) {
          const { isLive, signal } = beginLoad()
          self.isLoading = true
          self.error = undefined
          self.setStatusMessage('Fetching subgraph')
          try {
            const fetchStart = performance.now()
            const gfaText = (yield getSession(self).rpcManager.call(
              getRpcSessionId(self),
              'GetSubgraph',
              { adapterConfig, region, opts, signal },
            )) as string
            if (!isLive()) {
              return
            }
            self.setFetchMs(performance.now() - fetchStart)
            if (!gfaText) {
              throw new Error(
                'Adapter returned no GFA — region may be outside indexed data or the adapter does not implement getSubgraph',
              )
            }
            yield* parseAndLayout(
              gfaText,
              locLabel(region),
              region,
              true,
              namesReads(adapterConfig)
                ? graph =>
                    getSession(self).rpcManager.call(
                      getRpcSessionId(self),
                      'GetGraphReads',
                      {
                        adapterConfig,
                        nodeNames: graph.nodes.map(n => n.name),
                        signal,
                      },
                    )
                : undefined,
            )
            if (!isLive()) {
              return
            }
            // Independent remote reads, each landing as it arrives. A coarse
            // cut reads no bubble index: its nodes are the bubbles, and the
            // index over its window can run to a chromosome's rows.
            self.setStatusMessage('Reading annotations')
            yield Promise.all([
              opts.tier === 'coarse'
                ? undefined
                : flow(loadBubbles)(adapterConfig, region, isLive),
              flow(loadGenes)(region, isLive),
              flow(loadRepeats)(region, isLive),
            ])
          } catch (e) {
            if (isLive()) {
              console.error('[GraphGenomeView.cutSubgraph]', e)
              self.error = e
            }
          } finally {
            if (isLive()) {
              self.finishLoading()
            }
          }
        }),
        // Re-read one annotation track alone, for a track change. The graph,
        // its layout and any open bubble stay as they are. Live only while the
        // track it read is still the one chosen, so a slow read cannot land
        // over the pick that followed it.
        reloadRepeats: flow(function* () {
          const region = self.graphRegion
          const trackId = self.repeatTrack?.trackId
          if (region) {
            yield* loadRepeats(
              region,
              () =>
                self.graphRegion === region &&
                self.repeatTrack?.trackId === trackId,
            )
          }
        }),
        // The walk rows' genes, each row's from its haplotype's assembly. A
        // row's genes are its own contig's, so they take the row's name for
        // their contig, whatever the track calls it.
        loadWalkGenes: flow(function* () {
          const reads = self.walkGeneReads?.reads ?? []
          const key = JSON.stringify(reads)
          const graph = self.graph
          const fetched = new Map<string, GeneModel[]>()
          yield Promise.all(
            reads.map(({ row, trackId, region }) =>
              flow(function* () {
                const cacheKey = `${trackId} ${region.refName}:${region.start}-${region.end}`
                let genes = walkGeneCache.get(cacheKey)
                if (!genes) {
                  const features = yield* trackFeatures(
                    trackId,
                    region,
                    'haplotype genes',
                  )
                  if (!features) {
                    return
                  }
                  genes = geneModelsFrom(features).map(g => ({
                    ...g,
                    refName: region.refName,
                  }))
                  walkGeneCache.set(cacheKey, genes)
                }
                fetched.set(row, genes)
              })(),
            ),
          )
          if (
            isAlive(self) &&
            self.graph === graph &&
            JSON.stringify(self.walkGeneReads?.reads ?? []) === key
          ) {
            self.walkGeneFeatures = reads.length ? fetched : undefined
          }
        }),
        reloadGenes: flow(function* () {
          walkGeneCache.clear()
          const region = self.graphRegion
          const trackId = self.geneTrack?.trackId
          if (region) {
            yield* loadGenes(
              region,
              () =>
                self.graphRegion === region &&
                self.geneTrack?.trackId === trackId,
            )
          }
        }),
        // Open one bubble: the graph becomes the segments the bubble row names,
        // drawn in the layout the reader is in. The graph it came from stays
        // behind it, one click away, and the popped graph gets its own derived
        // bubbles, so a superbubble opens progressively.
        popBubble: flow(function* (bubble: MinigraphBubble) {
          const graph = self.graph
          if (!graph) {
            return
          }
          const sub = bubbleSubgraph(graph, bubbleSegmentIds(bubble))
          if (sub.nodes.length === 0) {
            getSession(self).notify(
              'None of the segments of this bubble are in the cut; widen the graph context to open it',
              'info',
            )
            return
          }
          const { isLive } = beginLoad()
          self.popStack = [
            ...self.popStack,
            {
              graph,
              layoutMode: self.chosenLayoutMode,
              label: graph.name,
              indexBubbles: self.indexBubbles,
            },
          ]
          self.indexBubbles = undefined
          const label = `${BUBBLE_KIND_NAMES[classifyBubble(bubble, self.repeatArrays).kind]} at ${bubble.refName}:${bubble.start.toLocaleString()}`
          self.graph = { ...sub, name: label }
          self.clearInteractionState()
          self.viewportOwner = 'fit'
          self.isLoading = true
          try {
            if (yield* layoutInto(self.graph)) {
              self.finishLoading()
            }
          } catch (e) {
            if (isLive()) {
              self.error = e
              self.finishLoading()
            }
          }
        }),
        unpopBubble: flow(function* () {
          const from = self.poppedFrom
          if (!from) {
            return
          }
          self.popStack = self.popStack.slice(0, -1)
          self.graph = from.graph
          self.layoutMode = from.layoutMode
          self.indexBubbles = from.indexBubbles
          self.clearInteractionState()
          self.viewportOwner = 'fit'
          self.isLoading = true
          try {
            if (yield* layoutInto(from.graph)) {
              self.finishLoading()
            }
          } catch (e) {
            self.error = e
            self.finishLoading()
          }
        }),
        recomputeLayout: flow(function* () {
          const graph = self.graph
          if (!graph) {
            return
          }
          self.isLoading = true
          self.setStatusMessage('Computing layout')

          try {
            // A superseded request leaves the spinner to the request that
            // replaced it: clearing it here reports "done" while the layout the
            // user actually asked for is still being computed, which is the
            // common case when a cheap choice follows an expensive one.
            if (yield* layoutInto(graph)) {
              self.finishLoading()
            }
          } catch (e) {
            console.error('[GraphGenomeView.recomputeLayout]', e)
            self.error = e
            self.finishLoading()
          }
        }),
      }
    })
    .actions(self => ({
      startRenderingBackend(backend: Renderer) {
        if (!self.autorunsInstalled) {
          // Autorun: keep the view fitted to the graph until the user moves it.
          // Reading fittedTransform tracks everything the fit depends on, so
          // it re-fits as the layout arrives, the canvas is measured and the
          // genes over a tube map claim their rows. A manual pan/zoom (or a
          // restored-session transform) makes the viewport the user's, and a
          // host makes it the linear view's.
          addDisposer(
            self,
            autorun(() => {
              if (
                self.fittedTransform &&
                untracked(() => self.viewportOwner === 'fit')
              ) {
                self.zoomToFit()
              }
            }),
          )

          addDisposer(
            self,
            // Faceting on or off, its columns, its count of panels and what
            // they split by each reshape the boxes the drawing is fitted into
            reaction(
              () => {
                const grid = self.facetGrid
                return grid
                  ? `${self.facet.field} ${self.facetPanels?.length} ${grid.columns}`
                  : ''
              },
              () => {
                self.refitView()
              },
            ),
          )
          // The walk rows' genes follow the rows: a new cut, a repeat pick or
          // a sample filter changes which haplotypes and spans they read
          addDisposer(
            self,
            reaction(
              () => ({
                graph: self.graph,
                reads: JSON.stringify(self.walkGeneReads?.reads ?? []),
              }),
              () => {
                void self.loadWalkGenes()
              },
              {
                fireImmediately: true,
                equals: (a, b) => a.graph === b.graph && a.reads === b.reads,
              },
            ),
          )
          // A host fits the rows once, when it takes the pane over, which is
          // before the legend measures the room it needs above them
          addDisposer(
            self,
            reaction(
              () => self.fitPadTop,
              () => {
                if (self.viewportOwner === 'host') {
                  self.zoomToFit()
                }
              },
            ),
          )

          // Autorun: mirror a connected linear view's hover onto the graph. An
          // LGV writes `{hoverPosition, hoverFeature}` to session.hovered on
          // every mousemove; neither field names the source view, so the guard
          // is that the position lies in the region this graph was cut from.
          // A pointer over the pane itself is the host's too, at a bp its x
          // only means on a reference-axis layout, so there the pane's own hit
          // test is the hover.
          //
          // Only `hovered` is tracked — the graph reads are untracked, so a
          // geometry rebuild can't re-fire this and clobber a hover the canvas
          // itself set. Assigning an unchanged id doesn't notify, so a hover
          // that travels within one segment costs nothing downstream.
          addDisposer(
            self,
            autorun(() => {
              const hover = readLgvHover(getSession(self).hovered)
              untracked(() => {
                const region = self.graphRegion
                const graph = self.graph
                const inRegion =
                  hover && region && hoverInRegion(hover, region)
                    ? hover
                    : undefined
                // a row naming a walk is the hover, not the node at its bp,
                // whose band would cover the row's own cells
                const rowWalks =
                  inRegion?.featureName && graph?.paths
                    ? walksForRow(inRegion.featureName, graph.paths)
                    : []
                if (region && graph && !self.pointerInPane) {
                  self.setHoveredNode(
                    inRegion && rowWalks.length === 0
                      ? nodeForLgvHover({ hover: inRegion, nodes: graph.nodes })
                      : null,
                  )
                }
                self.setHoveredRowWalks(rowWalks)
              })
            }),
          )

          // Reaction: drop a hover the pointer cannot still be over.
          //
          // A hover is set by a mousemove on the canvas, and here the drawing
          // moves under a STATIONARY cursor on three axes — the wheel zoom, the
          // toolbar's zoom and fit buttons, and a pan — none of which fire a
          // pointer event. Left alone the tooltip goes on naming the node that
          // used to be under the cursor, `hoverHighlight` goes on publishing its
          // span, and the paired linear view paints a band over the wrong
          // sequence until the mouse happens to move.
          //
          // This is jbrowse-components' `installClearHoverOnViewportChange`
          // (BaseLinearDisplay), whose three axes are bpPerPx / offsetPx /
          // scrollTop; a graph view's are its own transform. Its rule is worth
          // restating rather than just citing: a sticky canvas gets no
          // mousemove and no mouseleave for any of them. Not imported because
          // it lives in the LGV plugin and reads a containing LGV, and this
          // plugin deliberately takes no runtime dependency on that plugin
          // (see hoverSync/index.tsx).
          //
          // A `reaction`, not an autorun, for the reason stated there: the
          // effect touches hover state, and an autorun would re-enter itself.
          // Selection is untouched — a click is a choice, and the content
          // moving does not unmake it.
          addDisposer(
            self,
            reaction(
              () => `${self.scale}-${self.translateX}-${self.translateY}`,
              () => {
                self.setHoveredNode(null)
                self.setHoveredBubble(null)
                self.setHoveredEdge(null)
              },
              { name: 'GraphClearHoverOnViewportChange' },
            ),
          )

          // Autorun: a zoom, or a pan that leaves the window the last build
          // covered, schedules a debounced rebuild. A pan inside it costs a
          // repaint and nothing else. Skips the first run.
          let firstViewport = true
          addDisposer(
            self,
            autorun(() => {
              const { scale } = self
              const viewport = paneViewportOf(self)
              if (firstViewport) {
                firstViewport = false
                return
              }
              const built = untracked(() => self.builtViewport)
              if (built?.scale === scale && contains(built.bounds, viewport)) {
                return
              }
              self.scheduleViewportDirty()
            }),
          )

          // Autorun: hover and selection. Tracks `geometryVersion` because an
          // upload drops the renderer's edge highlight.
          addDisposer(
            self,
            autorun(() => {
              const b = self.currentRenderingBackend as Renderer | undefined
              dependOn(self.geometryVersion)
              if (b) {
                self.applyHighlights(b)
                self.renderNow()
              }
            }),
          )
        }

        // The second argument is a SETUP THUNK, not the callbacks themselves:
        // anything it closes over lives exactly as long as the callbacks that
        // read it, which is what lets a per-backend memo work.
        self.attachRenderingBackend<Renderer>(backend, () => ({
          // Autorun: rebuild geometry when graph data or display options
          // change. scale/translate are untracked so they don't trigger a full
          // rebuild — only the debounced viewportDirty flag does.
          upload: (b: Renderer) => {
            b.resize(self.paneWidth, self.canvasHeight)
            if (self.layoutResult?.tubeMap) {
              dependOn(self.viewportDirty)
              b.uploadGeometry(EMPTY_BATCH)
              self.setGeometryMetrics(0, 0, {
                scale: untracked(() => self.scale),
                bounds: untracked(() => paneViewportOf(self)),
              })
              return true
            }
            if (self.facetPanels) {
              dependOn(self.viewportDirty)
              b.uploadGeometry(EMPTY_BATCH)
              self.setGeometryMetrics(0, 0, {
                scale: untracked(() => self.scale),
                bounds: untracked(() => self.viewportToBuild()),
              })
              return true
            }
            const geometryStart = performance.now()
            const built = self.buildDrawing(
              self.walkLift,
              self.effectiveDrawPaths,
            )
            if (built) {
              b.uploadGeometry(built.batch)
              self.setGeometryMetrics(
                performance.now() - geometryStart,
                built.batch.nodeStrokes.length,
                {
                  scale: untracked(() => self.scale),
                  bounds: built.viewportBounds,
                },
              )
              return true
            }
            // Nothing reached the backend, so the autorun may skip the redraw
            // it would otherwise force. Safe despite the resize above: with no
            // positions there is nothing to draw, which is the same case
            // `render` below returns false for.
            return false
          },
          // Autorun: re-render on pan/zoom/darkMode without rebuilding geometry
          render: (b: Renderer) => {
            if (!self.nodePositions) {
              return false
            }
            self.paint(b)
            self.markPainted()
            return true
          },
        }))
      },
    }))
    .actions(self => ({
      // A layout picked from a menu: the mode, then the drawing it makes.
      switchLayout(mode: LayoutModeValue) {
        self.setLayoutMode(mode)
        return self.recomputeLayout()
      },
      cancelLoad() {
        if (self.canCancelLoad) {
          self.stopLoad()
          self.graph = undefined
        }
      },
      // loads the source again, for a host that has one
      retryLoad() {},
      afterAttach() {
        // A restored session that already carries a non-default transform is
        // the user's own view — mark it so the fit autorun leaves it alone.
        if (!self.isDefaultViewport) {
          self.viewportOwner = 'user'
        }
      },
    }))
    .actions(self => ({
      // Move the linear view already on screen, or open one if there is none,
      // and pair with whichever it was. A view being created gets the session's
      // annotation for the assembly it opens on (see launchTracks), led by the
      // graph's own segments track when the launch is on the reference — the one
      // assembly that track is configured for.
      //
      // Only a view on the reference is paired with. A node's hover band is on
      // that assembly, so paired with a view on another the band fails that
      // view's assembly check and the reference view's id check, and is drawn
      // nowhere.
      showInLinearView(target: { location: GraphLocation; assembly: string }) {
        const session = getSession(self)
        const onReference = target.assembly === self.graphRegion?.assemblyName
        const viewId = showInLinearView({
          session,
          location: target.location,
          assembly: target.assembly,
          connectedViewId: self.connectedViewId,
          tracks: launchTracks({
            session,
            assemblyName: target.assembly,
            first: onReference ? self.sourceTrackId : undefined,
          }),
        })
        if (onReference) {
          self.pairWithLinearView(viewId)
        }
      },
      // Mark the node's reference interval in the linear view beside the graph.
      // Not an action that opens anything: with no view to mark, the menu does
      // not offer it (see nodeLaunchMenuItems).
      highlightInLinearView(target: {
        location: GraphLocation
        assembly: string
      }) {
        highlightInLinearView({
          session: getSession(self),
          location: target.location,
          assembly: target.assembly,
          connectedViewId: self.connectedViewId,
        })
      },
      showSyntenyView(trackId: string) {
        launchSyntenyView({
          session: getSession(self),
          contributors: self.launchableAssemblies,
          trackId,
          graphTrackId: self.sourceTrackId,
        })
      },
    }))
    .views(self => ({
      // Synteny datasets that could fill the panels of a multi-genome launch.
      // Below two openable contributors there is nothing to compare, so the scan
      // is skipped rather than run and discarded.
      get syntenyLaunchTracks() {
        const samples = self.launchableAssemblies.map(c => c.sample)
        return samples.length >= 2
          ? launchableSyntenyTracks(getSession(self), samples)
          : []
      },
    }))
    .views(self => ({
      // The graph's way out, in the same shared "Launch view" submenu every
      // other view contributes to. Until this existed the triangle had two edges:
      // a linear view could open a graph or a synteny view of a locus, and the
      // graph could open nothing at all.
      graphMenuItems(): MenuItem[] {
        const walks = self.walkChoices
        return [
          {
            label: 'Layout',
            subMenu: LAYOUT_MODES.map(mode => ({
              type: 'radio' as const,
              label: mode.label,
              checked: self.chosenLayoutMode === mode.value,
              disabled: self.graph ? !mode.available(self.graph) : false,
              onClick: () => {
                void self.switchLayout(mode.value)
              },
            })),
          },
          {
            label: 'Color',
            subMenu: COLOR_SCHEMES.map(scheme => ({
              type: 'radio' as const,
              label: scheme.label,
              checked: self.chosenColorScheme === scheme.value,
              onClick: () => {
                self.setColorScheme(scheme.value)
              },
            })),
          },
          ...(walks.length > 0 && self.liftsWalks
            ? [
                {
                  label: 'Walk',
                  subMenu: [
                    {
                      label: 'None',
                      onClick: () => {
                        self.setWalkLayers([])
                      },
                    },
                    ...(self.walkLayers.length > 1 && self.modeDrawsNodes
                      ? [
                          {
                            label: 'Side by side',
                            subMenu: FACETS.map(({ value, label }) => ({
                              type: 'radio' as const,
                              label,
                              checked: self.facet.field === value,
                              onClick: () => {
                                self.setFacet(value)
                              },
                            })),
                          },
                        ]
                      : []),
                    ...(self.facetPanels &&
                    self.facet.field === 'walk' &&
                    !self.hostPlacesX
                      ? [
                          {
                            label: 'Columns',
                            subMenu: [
                              undefined,
                              ...self.facetPanels.map((_, i) => i + 1),
                            ].map(columns => ({
                              type: 'radio' as const,
                              label:
                                columns === undefined ? 'Auto' : `${columns}`,
                              checked: self.facet.columns === columns,
                              onClick: () => {
                                self.setFacetColumns(columns)
                              },
                            })),
                          },
                        ]
                      : []),
                    ...walks.map(walk => ({
                      type: 'checkbox' as const,
                      label: walk.label,
                      checked: self.walkLayers.some(l => l.walk === walk.name),
                      onClick: () => {
                        self.toggleWalk(walk.name)
                      },
                    })),
                    ...self.drawnWalks.map(lifted => ({
                      label: `Colour ${self.walkLabel(lifted.name)}`,
                      subMenu: [
                        { type: 'subHeader' as const, label: 'Colour by' },
                        ...WALK_FIELDS.map(field => ({
                          type: 'radio' as const,
                          label: field.label,
                          checked: lifted.encoding.field === field.value,
                          onClick: () => {
                            self.setWalkColor(lifted.name, {
                              field: field.value,
                            })
                          },
                        })),
                        { type: 'subHeader' as const, label: 'Palette' },
                        // the rainbow is the reference-position ramp
                        ...WALK_SCHEMES.filter(
                          scheme =>
                            scheme.value !== 'rainbow' ||
                            lifted.encoding.field === 'reference',
                        ).map(scheme => ({
                          type: 'radio' as const,
                          label: scheme.label,
                          checked: lifted.encoding.scheme === scheme.value,
                          onClick: () => {
                            self.setWalkColor(lifted.name, {
                              scheme: scheme.value,
                            })
                          },
                        })),
                      ],
                    })),
                  ],
                },
              ]
            : []),
          ...(TUBE_MAP_MODES.has(self.chosenLayoutMode)
            ? [
                {
                  label: 'Fold variants',
                  subMenu: TUBE_MAP_FOLDS.map(({ bp, label }) => ({
                    type: 'radio' as const,
                    label,
                    checked: self.tubeMapFold === bp,
                    disabled: bp > 0 && self.graph?.reads !== undefined,
                    onClick: () => {
                      self.setTubeMapFold(bp)
                      void self.recomputeLayout()
                    },
                  })),
                },
              ]
            : []),
          ...(self.chosenLayoutMode === 'walkrows' &&
          self.repeatChoices.length > 0
            ? [
                {
                  label: 'Repeat',
                  subMenu: [
                    {
                      type: 'radio' as const,
                      label: 'Whole window',
                      checked: self.repeatKey === '',
                      onClick: () => {
                        self.setRepeatKey('')
                      },
                    },
                    ...self.repeatChoices.map(({ key, name, unit }) => ({
                      type: 'radio' as const,
                      label: `${name} · ${unit.toLocaleString()} bp unit`,
                      checked: self.repeatKey === key,
                      onClick: () => {
                        self.setRepeatKey(key)
                      },
                    })),
                  ],
                },
              ]
            : []),
          ...(self.hostPlacesX
            ? []
            : [
                {
                  label: 'Zoom in',
                  onClick: () => {
                    self.zoom(
                      1.5,
                      self.viewBox.width / 2,
                      self.viewBox.height / 2,
                    )
                  },
                },
                {
                  label: 'Zoom out',
                  onClick: () => {
                    self.zoom(
                      1 / 1.5,
                      self.viewBox.width / 2,
                      self.viewBox.height / 2,
                    )
                  },
                },
                {
                  label: 'Zoom to fit',
                  onClick: () => {
                    self.zoomToFit()
                  },
                },
              ]),
          {
            type: 'checkbox',
            label: 'Mark bubbles',
            checked: self.showBubbles,
            onClick: () => {
              self.setShowBubbles(!self.showBubbles)
            },
          },
          {
            type: 'checkbox',
            label: 'Show deletion edges',
            checked: self.showDeletionEdges,
            onClick: () => {
              self.setShowDeletionEdges(!self.showDeletionEdges)
            },
          },
          {
            type: 'checkbox',
            label: 'Genes on the backbone',
            checked: self.showGenes,
            onClick: () => {
              self.setShowGenes(!self.showGenes)
            },
          },
          ...(self.referenceStripApplies
            ? [
                {
                  type: 'checkbox' as const,
                  label: 'Reference strip at bp',
                  checked: self.showReferenceStrip,
                  onClick: () => {
                    self.setShowReferenceStrip(!self.showReferenceStrip)
                  },
                },
              ]
            : []),
          {
            label: 'Export SVG',
            disabled: self.figureUnavailable !== undefined,
            disabledHelpText: self.figureUnavailable,
            onClick: () => {
              const svg = self.figure()
              if (svg) {
                downloadText(
                  svg,
                  `${(self.graph?.name ?? 'graph').replaceAll(/[^\w.-]+/g, '_')}.svg`,
                )
              }
            },
          },
          {
            label: 'Copy figure spec',
            disabled: !self.figureSpec(),
            disabledHelpText:
              'bandage-figure reads a graph cut from a gbz-base track or a GFA url',
            onClick: () => {
              const spec = self.figureSpec()
              const session = getSession(self)
              navigator.clipboard
                .writeText(`${JSON.stringify(spec, null, 2)}\n`)
                .then(() => {
                  session.notify(
                    'Figure spec copied. Save it as spec.json and run: npx -p @jbrowse/bandage-core bandage-figure spec.json -o figure.svg',
                    'info',
                  )
                })
                .catch((e: unknown) => {
                  session.notify(`Could not copy the figure spec: ${String(e)}`)
                })
            },
          },
        ]
      },
      launchMenuItems(): MenuItem[] {
        const items: MenuItem[] = []
        for (const item of graphLaunchMenuItems({
          contributors: self.launchableAssemblies,
          syntenyTracks: self.syntenyLaunchTracks,
          onShowLinear: target => {
            self.showInLinearView(target)
          },
          onShowSynteny: trackId => {
            self.showSyntenyView(trackId)
          },
        })) {
          pushLaunchViewMenuItem(items, item)
        }
        return items
      },
    }))
}

export type GraphPaneModel = Instance<ReturnType<typeof GraphPaneMixin>>
