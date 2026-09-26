import { readConfObject } from '@jbrowse/core/configuration'
import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import {
  getContainingView,
  getSession,
  isSessionModelWithWidgets,
  statusMessageText,
} from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { addDisposer, flow, isAlive, types } from '@jbrowse/mobx-state-tree'
import { RenderLifecycleMixin } from '@jbrowse/render-core/RenderLifecycleMixin'
import { getDpr } from '@jbrowse/render-core/canvas2dUtils'
import { autorun, reaction, untracked } from 'mobx'

import { backboneNodes, backboneSpan, isBackbone } from './anchoredNodes'
import { BUBBLE_SPREAD_VALUES, spreadFor } from './bubbleSpreads'
import { bubbleHalos } from './bubbles/bubbleHalos'
import { bubblesFromGraph } from './bubbles/bubblesFromGraph'
import {
  BUBBLE_KIND_NAMES,
  bubbleSegmentIds,
  classifyBubble,
} from './bubbles/classifyBubble'
import { bubbleSubgraph } from './bubbles/popBubble'
import { COLOR_SCHEME_VALUES } from './colorSchemes'
import { deletionEdges } from './deletionEdges'
import {
  GENE_ADAPTER_TYPES,
  geneModelsFrom,
  pickGeneTrack,
} from './genes/geneFeatures'
import { genePins } from './genes/genePins'
import { convertGFAToGraph } from './gfa/gfaConverter'
import { cutHolds, hostCut, hostFrame, hostWindow, isLinearHost } from './host'
import {
  paintSourceLane,
  referencePositionColor,
  sourceLaneDisplay,
} from './laneRamp'
import { drawnNodeLength, layoutScaling } from './layout/drawnScale'
import { mergeRuns, splitRuns } from './layout/mergeRuns'
import { orientToReference } from './layout/orientToReference'
import { seededNodes } from './layout/referenceSeeds'
import { ROW_HEIGHT_PX } from './layout/rowSpacing'
import { walkRowsExtent } from './layout/walkRowLayout'
import { walkRows } from './layout/walkRows'
import {
  LAYOUT_MODE_VALUES,
  layoutModeByValue,
  modeUsesLayoutEngine,
} from './layoutModes'
import {
  NODE_WIDTH_VALUES,
  maxNodeWidthPx,
  meanDepth,
  nodeWidthPx,
} from './nodeWidths'
import { anchorFromPaths, anchorGraph } from './pathAnchoring'
import { pathColorsLegible, pathLegend } from './pathColors'
import { buildNeighbors, nodeReferenceSpan } from './referenceSpan'
import { buildGeometry, computeReferenceRamp } from './renderer/GeometryBuilder'
import {
  REPEAT_ADAPTER_TYPES,
  pickRepeatTrack,
  repeatArraysFrom,
} from './repeats/repeatFeatures'
import { withCalls } from './repeats/walkCalls'
import { walkHighlight } from './walkHighlight'
import { parseGFA } from '../gfa-core/index'
import {
  hoverInRegion,
  nodeForLgvHover,
  readLgvHover,
} from '../hoverSync/lgvHover'
import {
  contributingAssemblies,
  locLabel,
  nodeOwnLocation,
  resolveContributors,
  resolveLocationAssembly,
} from '../launchFromGraph/contributors'
import { graphLaunchMenuItems } from '../launchFromGraph/graphMenuItems'
import {
  highlightInLinearView,
  launchSyntenyView,
  paddedLocation,
  showInLinearView,
  withReferenceRegion,
} from '../launchFromGraph/launchFromGraph'
import { launchTracks } from '../launchFromGraph/launchTracks'
import { linearViewTarget, withRows } from '../launchFromGraph/linearViewTarget'
import { launchableSyntenyTracks } from '../launchFromGraph/syntenyTracks'
import {
  graphReferenceAssembly,
  offReferenceProblem,
} from '../launchSubgraph/subgraphTracks'

import type { BubbleSpread } from './bubbleSpreads'
import type { ColorScheme, ResolvedColorScheme } from './colorSchemes'
import type { GeneModel } from './genes/geneFeatures'
import type { HostWindow, LinearHost } from './host'
import type { LayoutScaling } from './layout/drawnScale'
import type { LayoutModeValue } from './layoutModes'
import type { NodeWidth } from './nodeWidths'
import type { Renderer } from './renderer/types'
import type { RepeatArray } from './repeats/repeatFeatures'
import type { Graph, GraphNode, LayoutResult } from './types'
import type { SubgraphCutOptions, SubgraphTier } from '../GetSubgraph'
import type { NodeInk } from './util/hitDetection'
import type { MinigraphBubble } from '../MinigraphBubbleAdapter/bubbleLine'
import type { AxisScale } from './util/geometry'
import type { GraphLocation } from '../launchFromGraph/contributors'
import type { SubgraphRegion } from '../launchSubgraph/launchSubgraphView'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation } from '@jbrowse/core/util/types'

// Ceiling on the pane, and what it falls back to before there is a layout to
// size against. A roughly square drawing (FMMM) hits this and keeps the
// scrollable pane it has always had.
const MAX_CANVAS_HEIGHT = 600
// Floor, so a window holding only backbone — one row, no height at all — still
// leaves room to hover a node and read its tooltip.
const MIN_CANVAS_HEIGHT = 160
const VARIANT_MAP_HEIGHT = 340

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
// Gap between the drawing and the edge of the pane, on all four sides.
const FIT_PADDING = 40
const HOVER_BRIGHTEN = 1.4
const SELECT_BRIGHTEN = 1.6
const VIEWPORT_DEBOUNCE_MS = 150
const VIEWPORT_PANES_BUILT = 1

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

// The floor exists to keep a scale positive and finite, not to express a useful
// zoom level, so it has to clear the smallest scale a real layout asks for. In
// the reference-anchored layouts world units are bp: fitting a chromosome-scale
// rGFA (250 Mbp) into ~720 px needs ~3e-6, and the old 0.001 floor clamped that
// to 7x too wide — zoomToFit could not fit a whole-file import at all.
const MIN_ZOOM = 1e-6
const MAX_ZOOM = 100

function clampZoom(zoom: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
}

// The zoom as a pair of axis scales. One expression, read by all three getters
// below: they sit in one `.views()` block and so cannot reach each other through
// `self`, which had each of them restating the `pixelRows ? 1 : scale` rule that
// AxisScale exists to keep in one place.
function axisScaleOf(scale: number, pixelRows: boolean): AxisScale {
  // pixelRows rides along rather than being derived downstream: the deletion
  // bow is capped in a row layout and not in the isotropic one, and `scaleY !==
  // scaleX` coincides at one zoom level. See AxisScale.
  return { scaleX: scale, scaleY: pixelRows ? 1 : scale, pixelRows }
}

type ViewportOwner = 'fit' | 'user' | 'host'

interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

// What the pane shows, in layout units.
function viewportOf(model: {
  translateX: number
  translateY: number
  width: number
  scaleX: number
  scaleY: number
  canvasHeight: number
}): Bounds {
  return {
    minX: -model.translateX / model.scaleX,
    minY: -model.translateY / model.scaleY,
    maxX: (model.width - model.translateX) / model.scaleX,
    maxY: (model.canvasHeight - model.translateY) / model.scaleY,
  }
}

// The window a geometry build covers: the pane plus a whole pane on every
// side, so a pan has that far to go before the drawing runs out and a rebuild
// is due. Drawing three panes' worth is cheap now that a redraw is a few
// batched strokes; what it buys is that an ordinary pan never blanks its
// margins for the debounce and never rebuilds at all.
function padded(v: Bounds, panes: number): Bounds {
  const w = (v.maxX - v.minX) * panes
  const h = (v.maxY - v.minY) * panes
  return {
    minX: v.minX - w,
    minY: v.minY - h,
    maxX: v.maxX + w,
    maxY: v.maxY + h,
  }
}

// Centre the leftover, but only when there IS leftover. A row layout fits on x
// alone, so its drawing is routinely taller than the pane — that is the case
// rowSpacing.ts means by "reached by panning" — and centring an overflow splits
// the loss across both ends: at 41 rows the top row landed 100 px above the
// pane. The top row is the reference backbone, i.e. the axis the whole layout
// exists to put under the linear view, so it is the one row that must not be
// the first thing to go. Pinned at the padding it opens where a fitting drawing
// opens, and the rows past the ceiling are below, which is the direction a
// reader already scrolls a track in.
function fittedTranslateY(
  bounds: { minY: number; h: number },
  usableHeight: number,
  yScale: number,
) {
  const leftoverY = usableHeight - bounds.h * yScale
  return FIT_PADDING - bounds.minY * yScale + Math.max(0, leftoverY) / 2
}

function contains(outer: Bounds, inner: Bounds) {
  return (
    inner.minX >= outer.minX &&
    inner.maxX <= outer.maxX &&
    inner.minY >= outer.minY &&
    inner.maxY <= outer.maxY
  )
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

export default function stateModelFactory() {
  return types
    .compose(
      'GraphGenomeView',
      BaseViewModel,
      RenderLifecycleMixin(),
      types.model({
        type: types.literal('GraphGenomeView'),
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
        // Which drawing to use; the modes and their fallbacks are described in
        // LAYOUT_MODES. Default 'force' is the Bandage FMMM drawing, i.e. what
        // someone who has seen a pangenome graph before expects to see.
        //
        // The default used to be 'auto', the reference-anchored layout, on the
        // argument that lining the graph's x axis up with a linear view above it
        // is what this view can do and Bandage cannot. Docs review disagreed
        // twice, on figure after figure — "the linear backbone is just
        // confusing", "default to showing the bandage graphs over linear
        // backbone in almost all cases" — and the reason is that the anchored
        // drawing looks like a track rather than a graph: a bubble collapses onto
        // the reference axis, so the alternative alleles read as short bars
        // hanging under a line rather than as two routes through the same locus.
        // The anchored modes stay one dropdown click away, and are what the
        // hover-sync and one-row-per-strain figures select deliberately.
        layoutMode: types.optional(
          types.enumeration(LAYOUT_MODE_VALUES),
          'force',
        ),
        // 'auto' rather than a colour, resolved by `effectiveColorScheme`. See
        // COLOR_SCHEMES for why the default is not 'uniform' any more. A session
        // that names a scheme keeps it — this only decides what an unstated one
        // opens as.
        colorScheme: types.optional(
          types.enumeration(COLOR_SCHEME_VALUES),
          'auto',
        ),
        // How far the force layout opens a bubble, which on a variation graph is
        // the difference between a legible drawing and a rope. See
        // BUBBLE_SPREADS; no effect on the reference-anchored layouts, which
        // place a node from its coordinates rather than from a force sim.
        bubbleSpread: types.optional(
          types.enumeration(BUBBLE_SPREAD_VALUES),
          'auto',
        ),
        // Node thickness by depth, Bandage's own device; see NODE_WIDTHS.
        nodeWidth: types.optional(
          types.enumeration(NODE_WIDTH_VALUES),
          'depth',
        ),
        // Whether the node layouts draw each bubble as a halo along its nodes
        // with a label that opens it. The variant map draws glyphs instead.
        showBubbles: types.optional(types.boolean, true),
        showDeletionEdges: types.optional(types.boolean, false),
        // The session's genes drawn onto the backbone: exons along the nodes
        // that carry them, names pinned at their midpoints. See genes/.
        showGenes: types.optional(types.boolean, true),
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
        // One walk, by its path name, lifted out of the drawing: its nodes and
        // links keep their ink and the rest fades. Empty lifts none.
        highlightedPath: types.optional(types.string, ''),
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
        // The bp ceiling on a cut, which is a PROXY for node count and only a
        // good one at fine granularity: on a base-level index 5 Mb is already
        // thousands of segments, so refusing by span is refusing by cost. A
        // level-of-detail tier breaks the proxy — a whole 249 Mb human
        // chromosome is 474 nodes off the hosted HPRC tier — so a session that
        // knows which granularity it is pointed at can raise this. The real
        // backstop stays `maxGraphNodes`, which counts what actually came back.
        //
        // The launch MENUS keep the constant deliberately (launchSubgraphView):
        // a user rubber-banding 249 Mb over a fine index should still be told
        // no, because nothing there has said the track is coarse.
        maxRegionBp: types.optional(types.number, MAX_GRAPH_REGION_BP),
        loadedTrackId: types.optional(types.string, ''),
        loadedRegion: types.maybe(
          types.frozen<{
            refName: string
            assemblyName: string
            start: number
            end: number
          }>(),
        ),
        // The haplotypes the cut is for, lane assembly names or PanSN
        // prefixes, beside the region so a re-cut asks for the same set;
        // undefined is every haplotype. Only the GBZ cut reads it.
        subgraphHaplotypes: types.maybe(types.frozen<string[]>()),
        // How far the cut follows links past the segments the region's own
        // links name, defaulting to one hop because at 0 the drawing is wrong
        // rather than merely sparse. A detour that leaves the backbone before
        // the window and rejoins after it has its interior indexed only under
        // its own stable sequence, which no query on the reference reaches, so an
        // arm that bypasses 21 kb of reference arrives as a 43 bp fragment: the
        // one bubble draws as two unrelated small insertions, and nothing on
        // screen says they are the same event. One hop closes those, and that is
        // the whole of what a reader means by seeing the local graph.
        //
        // The cost is queries rather than nodes, and a hop only follows alleles
        // (offReference in RgfaTabixAdapter, which is gfabase's stop-at-cutpoints
        // rule read off the rank tag), so it is bounded by the off-reference
        // segments the cut already reached and it does not walk the backbone out
        // of the window. Measured: the E. coli paa locus goes 14 segments at 0 to
        // 17 at 1 and stays at 17 at 2, so the cut closes and stays closed.
        // HPRC's amylase window goes 63 to 78 to 92, because there the alleles
        // have alleles; wall-clock is flat across all three, the remote index
        // dominating. 0 stays available for a graph where even that is too much.
        //
        // Still not a graph-aware cut: a complete one needs the bubble
        // decomposition (`gfatools view -R`, whose bubble rows state their own
        // member segments) rather than a frontier, which is the follow-up noted
        // in the adapter.
        subgraphContext: types.optional(types.number, 1),
        // Whole-GFA source loaded on attach — lets a GraphGenomeView be
        // instantiated declaratively from a session/config snapshot.
        gfaLocation: types.maybe(types.frozen<FileLocation>()),
        // The reference span the reference-position ramp runs over. A graph cut
        // from a track already states one as `loadedRegion`; a file-loaded graph
        // has no region at all, and this is how its snapshot can still put a
        // linear track beside it on the same ramp — both painted from one pair
        // of numbers rather than from the file's own measured extent.
        colorDomain: types.maybe(
          types.frozen<{ start: number; end: number }>(),
        ),
        // The linear view this graph was launched from, so a hovered node can
        // draw its reference span there and vice versa. Written by the launch
        // menu; see hoverSync/.
        connectedViewId: types.maybe(types.string),
        // Whether the cut came from the source track's `coarse` pair
        // (RgfaTabixAdapter), so a restored session re-makes the cut it saved.
        // No bp cap applies to that pair; maxGraphNodes counts what came back.
        coarseCut: types.optional(types.boolean, false),
      }),
    )
    .volatile(() => ({
      graph: undefined as Graph | undefined,
      layoutResult: undefined as LayoutResult | undefined,
      // The bubble index rows over the cut window, when the source track has
      // one beside its segments. Undefined for a graph with no index, which the
      // variant map draws from `derivedBubbles` instead.
      indexBubbles: undefined as MinigraphBubble[] | undefined,
      // the genes over the cut window, read once per cut from the gene track
      geneFeatures: undefined as GeneModel[] | undefined,
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
      builtViewport: undefined as { scale: number; bounds: Bounds } | undefined,
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
      // the pane height a host holds, so a re-cut with more rows does not
      // move the pane while the linear view above it is being dragged
      hostPaneHeight: undefined as number | undefined,
      cutNote: undefined as string | undefined,
      recuts: 0,
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
      lastLayoutMs: undefined as number | undefined,
      lastGeometryMs: undefined as number | undefined,
      lastGeometryStrokeCount: undefined as number | undefined,
    }))
    .views(self => ({
      get nodeById() {
        if (self.graph) {
          const m = new Map<string, GraphNode>()
          for (const n of self.graph.nodes) {
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
        for (const n of self.graph?.nodes ?? []) {
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
      // The app-wide readiness contract (AppReadyMarker, @jbrowse/capture)
      // reads this: a declared source still fetching, or a graph whose
      // geometry has not been built yet.
      get showLoading() {
        return (
          self.error === undefined &&
          (self.isLoading ||
            ((self.graph !== undefined ||
              !!(self.loadedTrackId && self.loadedRegion) ||
              !!self.gfaLocation) &&
              self.lastGeometryStrokeCount === undefined))
        )
      },
      get canRetryLoad() {
        return !!(self.loadedTrackId && self.loadedRegion) || !!self.gfaLocation
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
          ? modeUsesLayoutEngine(self.layoutMode, self.graph)
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
      // Which haplotype each ribbon colour belongs to, in the order the file
      // states the paths — the same list and the same order the geometry keys
      // its colours off, so the key cannot name a colour that is not drawn.
      // Empty unless the ribbons are actually on: a colour key beside a drawing
      // with no colours in it is a legend for nothing.
      get pathLegend() {
        const paths = self.graph?.paths
        return self.drawPaths && paths && pathColorsLegible(paths.length)
          ? pathLegend(paths)
          : []
      },
      // Every walk the graph carries, named for a picker, whatever the count.
      get walkChoices() {
        const paths = self.graph?.paths
        return paths?.length ? pathLegend(paths) : []
      },
      // The lifted walk, or undefined when none is named or the graph on
      // screen does not carry the one that was.
      get walkHighlight() {
        return self.graph && self.highlightedPath
          ? walkHighlight(self.graph, self.highlightedPath)
          : undefined
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
      // What to anchor on. An explicit choice wins; otherwise a graph cut from
      // a track is anchored on the assembly it was cut against, which is the
      // one the linear view beside it is showing.
      get preferredReferencePath() {
        return self.referencePath === ''
          ? self.loadedRegion?.assemblyName
          : self.referencePath
      },
      // The span the reference-position ramp runs over: what the snapshot
      // stated, else the region the graph was cut from. Undefined only for a
      // file-loaded graph that states neither, where the ramp falls back to the
      // drawn extent (computeReferenceRamp). A follow's re-cut moves
      // loadedRegion, so the ramp re-spans every new cut, and the lane above
      // with it.
      get rampDomain() {
        return self.colorDomain ?? self.loadedRegion
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
      get effectiveColorScheme(): ResolvedColorScheme {
        return self.colorScheme !== 'auto'
          ? self.colorScheme
          : self.graph?.anchoredBy
            ? 'reference-position'
            : 'uniform'
      },
      get nodePositions() {
        return self.layoutResult?.nodePositions
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
      // What the variant map draws. Index rows win where both exist: gfatools
      // measured every allele, the layered order only bounds them.
      get bubbles() {
        return self.indexBubbles?.length
          ? self.indexBubbles
          : self.derivedBubbles
      },
    }))
    .views(self => ({
      // As written: a session track is a plain object until something
      // hydrates it, so a slot left at its default reads undefined here.
      get sourceAdapter() {
        const track = getSession(self).tracks.find(
          t => t.trackId === self.loadedTrackId,
        )
        return track
          ? (readConfObject(track, 'adapter') as Record<string, unknown>)
          : undefined
      },
      get assemblyTrackChoices() {
        const region = self.loadedRegion
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
    }))
    .views(self => ({
      get nodeNeighbors() {
        return self.graph ? buildNeighbors(self.graph) : undefined
      },
      // How far each node's ink reaches from its centreline, for the hit test:
      // the widths the geometry draws with, from the same function.
      get nodeInk(): NodeInk {
        const { contigThickness, nodeWidth, nodeById } = self
        const mean = self.graph ? meanDepth(self.graph) : 0
        return {
          maxHalfWidthPx: maxNodeWidthPx(contigThickness, nodeWidth) / 2,
          halfWidthPx: id => {
            const node = nodeById?.get(id)
            return node
              ? nodeWidthPx(node, contigThickness, nodeWidth, mean) / 2
              : contigThickness / 2
          },
        }
      },
      // Links that skip reference sequence, i.e. the deletions this graph
      // holds. Computed once per graph rather than per geometry rebuild: it is
      // a pass over the edges and the drawing rebuilds on every pan.
      // Walk rows state what each walk skips as its own bar length, so the arcs
      // over the backbone would only say it again, across the bars.
      get deletions() {
        return self.graph && self.layoutMode !== 'walkrows'
          ? deletionEdges(self.graph)
          : []
      },
      // One bar per haplotype walk on its own bp axis, for the walk-rows
      // overlay. Empty under every other layout.
      get walkRowBars() {
        if (self.layoutMode !== 'walkrows' || !self.graph) {
          return undefined
        }
        const repeat = self.selectedRepeat
        const bars = repeat
          ? walkRows(self.graph, repeat, repeat.unit)
          : walkRows(self.graph, self.loadedRegion)
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
        return { ...bars, rows: withCalls(rows, repeat?.calls) }
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
      // Each bubble in the window with what it is, for the variant map's
      // glyphs on the reference line.
      get bubbleGlyphs() {
        const bubbles = self.layoutMode === 'variants' ? self.bubbles : []
        return bubbles.map(bubble => ({
          bubble,
          ...classifyBubble(bubble),
        }))
      },
      // Exons and names on the backbone, in layout units. Reads
      // positionsVersion so a dragged node takes its exons with it.
      get genePins() {
        dependOn(self.positionsVersion)
        const positions = self.layoutResult?.nodePositions
        return self.showGenes &&
          self.layoutMode !== 'variants' &&
          self.layoutMode !== 'walkrows' &&
          self.graph &&
          self.geneFeatures &&
          positions
          ? genePins(self.graph, self.geneFeatures, positions)
          : []
      },
      // The same bubbles over every other layout, as halos along their nodes.
      // Reads positionsVersion so a dragged node takes its halo with it.
      get bubbleHalos() {
        dependOn(self.positionsVersion)
        const positions = self.layoutResult?.nodePositions
        if (
          !self.showBubbles ||
          self.layoutMode === 'variants' ||
          self.layoutMode === 'walkrows' ||
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
      get referenceRamp() {
        return self.effectiveColorScheme === 'reference-position' && self.graph
          ? computeReferenceRamp(self.graph, self.rampDomain)
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
        const region = self.loadedRegion
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
        let bounds:
          { minX: number; minY: number; w: number; h: number } | undefined
        if (self.layoutResult) {
          let minX = Infinity
          let minY = Infinity
          let maxX = -Infinity
          let maxY = -Infinity
          for (const segments of Object.values(
            self.layoutResult.nodePositions,
          )) {
            for (const seg of segments) {
              minX = Math.min(minX, seg.x)
              minY = Math.min(minY, seg.y)
              maxX = Math.max(maxX, seg.x)
              maxY = Math.max(maxY, seg.y)
            }
          }
          const region =
            self.layoutResult.referenceAxis && self.popStack.length === 0
              ? self.loadedRegion
              : undefined
          if (region && region.end > region.start) {
            minX = region.start
            maxX = region.end
          }
          const bars = this.walkRowBars
          const extent =
            bars && self.layoutResult.extent
              ? walkRowsExtent(bars)
              : self.layoutResult.extent
          if (extent) {
            maxX = Math.max(maxX, extent.maxX)
            maxY = Math.max(maxY, extent.maxY)
          }
          bounds = { minX, minY, w: maxX - minX, h: maxY - minY }
        }
        return bounds
      },
      // The pane is as tall as the drawing, rather than a fixed box the drawing
      // floats in the middle of.
      //
      // A row layout says how tall it is outright: rows are px, so the drawing's
      // height is the row count times the pitch and this is a sum, not a
      // derivation. It used to be derived from the drawing's ASPECT RATIO
      // against the x-fit scale, because y was in bp and a height in px did not
      // exist until a scale was chosen — which is also why a ceiling had to be
      // put on the row pitch to stop tall graphs from binding the fit on the
      // wrong axis. Both are gone with the unit.
      //
      // An isotropic layout still has no height of its own and keeps the aspect
      // derivation. It reads neither `scale` nor the height it is replacing, so
      // zoomToFit consumes this without feeding back into it.
      get canvasHeight() {
        if (
          self.viewportOwner === 'host' &&
          self.hostPaneHeight !== undefined
        ) {
          return self.hostPaneHeight
        }
        const bounds = this.layoutBounds
        const usableWidth = self.width - FIT_PADDING * 2
        // `paneHeight` replaces the built-in ceiling rather than adding a
        // second clamp under it, and the floor still wins: a pane shorter than
        // MIN_CANVAS_HEIGHT leaves no room to hover a node and read its
        // tooltip, which is the reason that floor exists.
        const ceiling = Math.max(
          MIN_CANVAS_HEIGHT,
          self.paneHeight ?? MAX_CANVAS_HEIGHT,
        )
        if (!bounds) {
          return ceiling
        }
        if (self.pixelRows) {
          // The variant map's drawing is one line; its glyphs and labels are
          // painted above it by the overlay and need the room a row layout
          // would give to rows.
          const floor =
            self.layoutMode === 'variants'
              ? VARIANT_MAP_HEIGHT
              : MIN_CANVAS_HEIGHT
          return Math.min(ceiling, Math.max(floor, bounds.h + FIT_PADDING * 2))
        }
        return bounds.w > 0 && usableWidth > 0
          ? Math.min(
              ceiling,
              Math.max(
                MIN_CANVAS_HEIGHT,
                (bounds.h * usableWidth) / bounds.w + FIT_PADDING * 2,
              ),
            )
          : ceiling
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
      // The reference interval of the hovered node, for a connected linear view
      // to highlight. Only a graph cut from a track has one: a whole-file import
      // has no region, and its stable names need not name anything in a loaded
      // assembly.
      get hoverHighlight() {
        let result:
          | {
              refName: string
              assemblyName: string
              start: number
              end: number
            }
          | undefined
        const region = self.loadedRegion
        const nodeId = self.hoveredNode
        const nodeById = self.nodeById
        const neighbors = self.nodeNeighbors
        if (region && nodeId !== null && nodeById && neighbors) {
          const span = nodeReferenceSpan({ nodeId, nodeById, neighbors })
          if (span) {
            result = {
              refName: region.refName,
              assemblyName: region.assemblyName,
              ...span,
            }
          }
        }
        return result
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
    }))
    .views(self => ({
      // The contributors a view can actually be opened on: those naming an
      // assembly this session has loaded. Every strain of an E. coli pangenome
      // demo is its own assembly, so all of them resolve; an HPRC graph names
      // hundreds of haplotypes that no session loads, so only the reference
      // does.
      get launchableAssemblies() {
        return resolveContributors(
          withReferenceRegion(self.contributingAssemblies, self.loadedRegion),
          self.assemblyResolver,
        )
      },
      // Whether there is a linear view this graph may draw a highlight into —
      // the paired one, or the session's only one on the reference assembly.
      // Read by the node menu, which offers the item only when it would land
      // somewhere.
      get canHighlightInLinearView() {
        const region = self.loadedRegion
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
        const region = self.loadedRegion
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
      // The linear view's zoom past which a follow cuts the source track's
      // coarse pair, or undefined for a track with none.
      get coarseAboveBpPerPx() {
        const coarse = self.sourceAdapter?.coarse as
          { aboveBpPerPx?: unknown } | undefined
        const above = coarse?.aboveBpPerPx
        return typeof above === 'number' ? above : undefined
      },
    }))
    .views(self => ({
      get cutTier(): SubgraphTier {
        return self.coarseCut && self.coarseAboveBpPerPx !== undefined
          ? 'coarse'
          : 'fine'
      },
    }))
    .views(self => ({
      get regionCapBp() {
        return self.cutTier === 'coarse' ? Infinity : self.maxRegionBp
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
        return view !== self && isLinearHost(view) ? view : undefined
      },
    }))
    .views(self => ({
      // Whether the host places x. Only a layout whose x is reference bp can
      // take the window's transform; force, ordered and walk rows draw in
      // their own coordinates inside the track, and a popped bubble is a
      // picture of its own.
      get hostPlacesX() {
        const { host, loadedRegion: region, layoutResult: layout } = self
        return (
          host !== undefined &&
          host.initialized &&
          region !== undefined &&
          layout?.referenceAxis === true &&
          self.popStack.length === 0 &&
          !host.dynamicBlocks.contentBlocks.some(
            b => b.refName === region.refName && b.reversed,
          )
        )
      },
    }))
    .views(self => ({
      get hostFrame() {
        const { host, loadedRegion } = self
        return self.hostPlacesX && host && loadedRegion
          ? hostFrame(host, loadedRegion)
          : undefined
      },
    }))
    .actions(self => ({
      setError(error: unknown) {
        self.error = error
        self.isLoading = false
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
        self.builtViewport = built
        self.geometryVersion++
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
      setGeneTrackId(trackId: string) {
        self.geneTrackId = trackId
      },
      setRepeatTrackId(trackId: string) {
        self.repeatTrackId = trackId
      },
      setRepeatKey(key: string) {
        self.repeatKey = key
      },
      setHighlightedPath(name: string) {
        self.highlightedPath = name
      },
      // Undefined restores the built-in ceiling. Nothing recomputes: the pane
      // reads canvasHeight and the drawing is placed by zoomToFit, which the
      // caller runs if it wants the drawing refitted into the new pane.
      setPaneHeight(px: number | undefined) {
        self.paneHeight = px
        if (self.viewportOwner === 'host') {
          self.hostPaneHeight = px
        }
      },
      // The track a hosted pane cuts from. The first settle makes the cut.
      adoptTrack(trackId: string) {
        if (self.loadedTrackId !== trackId) {
          self.loadedTrackId = trackId
          self.loadedRegion = undefined
          self.coarseCut = false
          self.graph = undefined
          self.layoutResult = undefined
        }
      },
      // The caller refetches — the number only describes how the next cut is
      // made, and the graph on screen was cut with the old one.
      setSubgraphContext(hops: number) {
        self.subgraphContext = hops
      },
      // Same contract: the caller refetches, since the set describes the next
      // cut and the graph on screen was cut for the old one.
      setWalkRowSamples(samples: string[] | undefined) {
        self.walkRowSamples = samples
      },
      setSubgraphHaplotypes(haplotypes: string[] | undefined) {
        self.subgraphHaplotypes = haplotypes
      },
      // Same contract as setSubgraphContext: describes how the NEXT cut is
      // gated, so the caller refetches. See the prop for why a session is
      // allowed to move this and the launch menus are not.
      setMaxRegionBp(bp: number) {
        self.maxRegionBp = bp
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
          const region = self.loadedRegion
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
                  // Every assembly that traverses it, which is a different
                  // question and one only a path GFA can answer. Absent on an
                  // rGFA rather than approximated, so the two are never
                  // confused: there `contributingAssembly` is first-seen, not
                  // carriage.
                  carriedBy: node.samples?.join(', '),
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
        const newScale = clampZoom(self.scale * factor)
        const ratio = newScale / self.scale
        self.scale = newScale
        self.translateX = centerX - (centerX - self.translateX) * ratio
        // y only follows when it is on the same scale. A row layout's y is
        // screen px (scaleY === 1), so nothing about it changes as x zooms —
        // moving translateY by the ratio there would slide the rows off under
        // the cursor while their pitch stayed put.
        if (!self.pixelRows) {
          self.translateY = centerY - (centerY - self.translateY) * ratio
        }
      },
      setViewportDirty() {
        self.viewportDirty++
      },
      // The positions themselves moved, as opposed to the window onto them.
      setPositionsDirty() {
        self.positionsVersion++
      },
      zoomToFit() {
        // A layout is routinely degenerate on one axis: an anchored window
        // holding only backbone segments puts every node on row 0. So each axis
        // constrains the scale only when it has extent, and only a layout with
        // no extent at all is unfittable. Requiring extent on both axes left
        // that window at scale 1 with the graph off-screen entirely, since x
        // there is reference bp.
        const bounds = self.layoutBounds
        const usableWidth = self.width - FIT_PADDING * 2
        const usableHeight = self.canvasHeight - FIT_PADDING * 2
        // A host owns x, so a fit while hosted places the rows only.
        if (self.viewportOwner === 'host') {
          if (bounds && usableHeight > 0) {
            self.translateY = fittedTranslateY(
              bounds,
              usableHeight,
              self.scaleY,
            )
          }
          return
        }
        // Nothing to fit into before the canvas is measured. The autorun re-runs
        // once width lands, so skipping here beats computing a negative scale
        // and persisting that transform into the session snapshot.
        if (
          bounds &&
          usableWidth > 0 &&
          usableHeight > 0 &&
          // A row layout needs x extent specifically: y cannot stand in for it
          // there, having no scale left to solve for.
          (bounds.w > 0 || (!self.pixelRows && bounds.h > 0))
        ) {
          // A row layout fits on x ALONE, which is the point of it: the pane is
          // as tall as the rows are and the rows are as tall as they need to be,
          // so there is no height to fit into and nothing that can make the
          // backbone narrower than the pane it is supposed to line up with. That
          // is the bug this axis change is for — past ~12 rows the drawing was
          // taller than it was wide, the vertical axis bound the fit, and the
          // backbone stopped matching the linear view above it.
          //
          // An isotropic layout still fits on whichever axis binds, and the
          // leftover on the other is split evenly.
          const fitX = bounds.w > 0 ? usableWidth / bounds.w : Infinity
          const fitY = bounds.h > 0 ? usableHeight / bounds.h : Infinity
          const newScale = clampZoom(
            self.pixelRows ? fitX : Math.min(fitX, fitY),
          )
          self.scale = newScale
          self.translateX =
            FIT_PADDING -
            bounds.minX * newScale +
            (usableWidth - bounds.w * newScale) / 2
          // scaleY, which a row layout pins at 1
          self.translateY = fittedTranslateY(
            bounds,
            usableHeight,
            self.pixelRows ? 1 : newScale,
          )
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
          self.hostPaneHeight = self.canvasHeight
          self.viewportOwner = 'host'
        }
        self.scale = scale
        self.translateX = translateX
        if (engaging) {
          self.zoomToFit()
        }
      },
      // A drawing still on the reference stays where the host left it; one
      // whose x no longer means bp is refit.
      releaseHost() {
        if (self.viewportOwner === 'host') {
          self.hostPaneHeight = undefined
          if (self.layoutResult?.referenceAxis) {
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

      // `scaling.nodes` rather than the graph's own: under a compressing
      // drawn-length law a node's `length` crosses this boundary as a drawn
      // length, which is all the engine ever reads it as.
      //
      // An anchored graph also carries a seed per node, the backbone along x,
      // and asks the engine not to rotate components: FMMM then keeps the
      // reference's coarse shape instead of curling it into a C
      // (docs/layout-experiments.md, experiment 2).
      function callLayout(graph: Graph, scaling: LayoutScaling) {
        const session = getSession(self)
        const { rpcManager } = session
        // Stable grouping key for the layout RPC; a view has no display-level
        // rpcSessionId. `rpcManager.call` injects sessionId into the args.
        const sessionId = 'graph'
        const anchored = graph.nodes.some(isBackbone)
        return rpcManager.call(sessionId, 'GraphComputeLayout', {
          graph: {
            nodes: anchored ? seededNodes(graph, scaling) : scaling.nodes,
            edges: graph.edges,
          },
          options: {
            quality: self.layoutQuality,
            linearLayout: self.linearLayout,
            ...scaling.opts,
            ...(anchored ? { rotateComponents: false } : {}),
          },
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
        const anchored = graph.nodes.some(isBackbone)
        return `${self.layoutQuality}|${self.linearLayout}|${self.bubbleSpread}|${anchored}|${graph.referencePath ?? ''}`
      }

      // Single dispatch point for every layout mode. A mode that returns a
      // result computed it locally; one that returns undefined can't draw this
      // graph and hands off to the remote FMMM engine, which is also how
      // 'force' is expressed. See LAYOUT_MODES.
      function* computeLayout(graph: Graph) {
        const start = performance.now()
        const local = layoutModeByValue(self.layoutMode).run(
          graph,
          self.loadedRegion,
          self.host ? self.layoutResult?.sampleRows : undefined,
        )
        if (local) {
          return { result: local, duration: performance.now() - start }
        }
        const cache = forceLayoutsOf(graph)
        const key = forceLayoutKey(graph)
        const hit = cache.get(key)
        if (hit) {
          return { result: hit, duration: performance.now() - start }
        }
        // The engine lays out the runs, not the nodes: a base-level cut is
        // thousands of nodes in unbranching chains, and one chain per run is
        // the same drawing at a third of the time. Members take their share of
        // the run's polyline by drawn length, so the picture is per node again
        // before anything else sees it.
        const spread = spreadFor(self.bubbleSpread)
        const merged = mergeRuns(graph)
        const { result, duration } = (yield callLayout(
          merged.graph,
          layoutScaling(merged.graph, spread),
        )) as { result: LayoutResult; duration: number }
        const scaling = layoutScaling(graph, spread)
        const drawn = new Map(
          scaling.nodes.map(n => [
            n.id,
            drawnNodeLength(scaling.opts, n.length),
          ]),
        )
        const positions = splitRuns(
          result.nodePositions,
          merged.runs,
          id => drawn.get(id) ?? 0,
        )
        // Turned so the reference reads left to right, like the linear view
        // above it. Before `remember`, so the cache hands back the drawing as
        // it was shown.
        const oriented = {
          ...result,
          nodePositions: graph.nodes.some(isBackbone)
            ? orientToReference(graph, positions)
            : positions,
        }
        // Under the key read BEFORE the call: the settings that produced this
        // drawing are not necessarily the ones on screen now, and filing it
        // under the current ones would serve it up as a layout it is not.
        remember(cache, key, oriented)
        return { result: oriented, duration }
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

      // `keepSelection` for a re-cut of the same source: node ids survive one
      // where edge indexes do not, so the selection is found again by id.
      function* parseAndLayout(
        text: string,
        name: string,
        keepSelection = false,
      ) {
        self.setStatusMessage('Parsing GFA')
        const gfaGraph = parseGFA(text)
        // A general GFA states its coordinates only in its P/W lines, so the
        // walk that recovers them happens before anything reads `stable` —
        // otherwise the anchored layouts see an unanchored graph and hand off
        // to force.
        const graph = anchorGraph(
          convertGFAToGraph(gfaGraph, name),
          self.preferredReferencePath,
        )
        // Checked here, between parsing and laying out, because this is the one
        // point both load paths pass through and it is upstream of everything
        // expensive: the layout, the geometry and the per-frame draw calls all
        // scale with this number. The whole-file import path had no cap at all,
        // so a chromosome-scale GFA would parse and then freeze the tab.
        if (graph.nodes.length === 0) {
          throw new Error(`No graph segments in ${name}`)
        }
        if (graph.nodes.length > self.maxGraphNodes) {
          throw new Error(
            `Graph too large to draw: ${graph.nodes.length.toLocaleString()} nodes (limit ${self.maxGraphNodes.toLocaleString()}). Zoom in to a smaller region, or raise maxGraphNodes on this view.`,
          )
        }
        const selected = keepSelection ? self.selectedNode : null
        self.graph = graph
        self.indexBubbles = undefined
        self.geneFeatures = undefined
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

      function loadedTrack() {
        return self.loadedTrackId
          ? getSession(self).tracks.find(t => t.trackId === self.loadedTrackId)
          : undefined
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
        if (
          adapterConfig.type !== 'RgfaTabixAdapter' ||
          prefix === undefined ||
          self.cutTier === 'coarse'
        ) {
          return
        }
        try {
          const features = (yield getSession(self).rpcManager.call(
            'graph',
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
          return (yield session.rpcManager.call('graph', 'CoreGetFeatures', {
            adapterConfig: readConfObject(config, 'adapter'),
            regions: [region],
          })) as Feature[]
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

      // Inner loading logic shared by loadFromTabixSubgraph and refetchIfNeeded
      function* doSubgraphLoad(
        adapterConfig: Record<string, unknown>,
        region: SubgraphRegion,
        opts: SubgraphCutOptions = {},
      ) {
        const { isLive, signal } = beginLoad()
        const track = loadedTrack()
        const regionSize = region.end - region.start
        // Past the size cap the graph view declines rather than degrading to a
        // non-graph rectangle rendering; large-region and full-genome
        // comparison is a linear synteny view instead.
        const refusal =
          (track &&
            offReferenceProblem(
              graphReferenceAssembly(track),
              region.assemblyName,
            )) ??
          (regionSize > self.regionCapBp
            ? `Region too large (${formatSpanBp(regionSize)}) — zoom in to view graph (max ${formatSpanBp(self.regionCapBp)})`
            : undefined)
        if (refusal !== undefined) {
          self.graph = undefined
          self.layoutResult = undefined
          self.isLoading = false
          self.error = new Error(refusal)
          return
        }
        self.isLoading = true
        self.error = undefined
        self.setStatusMessage('Fetching subgraph')
        try {
          const session = getSession(self)
          const { rpcManager } = session
          const sessionId = 'graph' // getRpcSessionId(self) no rpcSessionId getter
          const fetchStart = performance.now()
          const gfaText = (yield rpcManager.call(sessionId, 'GetSubgraph', {
            adapterConfig,
            region,
            opts,
            signal,
          })) as string
          if (!isLive()) {
            return
          }
          self.setFetchMs(performance.now() - fetchStart)
          if (!gfaText) {
            throw new Error(
              'Adapter returned no GFA — region may be outside indexed data or the adapter does not implement getSubgraph',
            )
          }
          const label = locLabel(region)
          yield* parseAndLayout(gfaText, label, true)
          if (!isLive()) {
            return
          }
          // Three independent remote reads, each landing as it arrives: in
          // turn they held the overlay over a drawn graph for the sum of their
          // round trips.
          self.setStatusMessage('Reading annotations')
          yield Promise.all([
            flow(loadBubbles)(adapterConfig, region, isLive),
            flow(loadGenes)(region, isLive),
            flow(loadRepeats)(region, isLive),
          ])
        } catch (e) {
          if (isLive()) {
            console.error('[GraphGenomeView.loadFromTabixSubgraph]', e)
            self.error = e
          }
        } finally {
          if (isLive()) {
            self.isLoading = false
          }
        }
      }

      // The cut behind a graph whose source is a track in this session, which is
      // what both a launch snapshot and a restored session carry. Silent when
      // there is no such pair, which is the whole-file case. A pair naming a
      // track the session lacks is reported, because otherwise the view sits on
      // an empty import form with nothing saying why.
      //
      // Nothing here saves and restores the transform: `viewportOwner` is
      // what protects a restored session's pan/zoom, and it gates the fit
      // autorun — the only thing in this flow that would otherwise move the
      // view. A save/restore pair around the load wrote back the values it had
      // just read.
      function* cutFromLoadedTrack() {
        const region = self.loadedRegion
        const track = loadedTrack()
        if (region && self.loadedTrackId && !track) {
          self.error = new Error(
            `The track this graph was cut from, "${self.loadedTrackId}", is not in this session`,
          )
        } else if (track && region) {
          // A hop past a coarse cut reaches nothing new: every bubble node's
          // two links are indexed under the backbone either side of it.
          const coarse = self.cutTier === 'coarse'
          yield* doSubgraphLoad(readConfObject(track, 'adapter'), region, {
            hops: coarse ? 0 : self.subgraphContext,
            haplotypes: self.subgraphHaplotypes,
            tier: coarse ? 'coarse' : undefined,
          })
        }
      }

      // Raises `isLoading` before any fetch, so a view waiting on a remote file
      // shows its loading state instead of the import form. Text already in
      // hand is parsed without yielding first.
      // `region` is the window a declared file was stated beside. Held through
      // the load rather than restored after it, so the parse anchors on that
      // assembly's path and a failed or canceled load can still be retried
      // with it.
      function* loadWholeGFA(
        name: string,
        source: string | ((signal: AbortSignal) => Promise<string>),
        region?: SubgraphRegion,
      ) {
        const { isLive, signal } = beginLoad()
        self.loadedTrackId = ''
        self.loadedRegion = region
        self.coarseCut = false
        self.isLoading = true
        self.error = undefined
        try {
          const text =
            typeof source === 'string'
              ? source
              : ((yield source(signal)) as string)
          if (isLive()) {
            yield* parseAndLayout(text, name)
          }
        } catch (e) {
          if (isLive()) {
            console.error('[GraphGenomeView.loadWholeGFA]', e)
            self.error = e
          }
        } finally {
          if (isLive()) {
            self.isLoading = false
          }
        }
        return isLive()
      }

      return {
        // Back to the import form: drop the graph, everything derived from it,
        // and the source it came from. Leaving the source declared kept
        // `showLoading` true over the import form and had a reloaded session
        // cut the dismissed graph again. Any load in flight ends here too,
        // or it would land its graph afterwards.
        clearGraph() {
          loadController?.abort()
          loadController = undefined
          liveLoad++
          liveRequest++
          self.graph = undefined
          self.layoutResult = undefined
          self.loadedTrackId = ''
          self.loadedRegion = undefined
          self.coarseCut = false
          self.cutNote = undefined
          self.gfaLocation = undefined
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
        cancelLoad() {
          if (self.canCancelLoad) {
            loadController?.abort()
            loadController = undefined
            liveLoad++
            liveRequest++
            self.graph = undefined
            self.isLoading = false
            self.statusMessage = ''
            self.loadCanceled = true
          }
        },
        loadGFA: flow(function* (text: string, name = 'Imported GFA') {
          yield* loadWholeGFA(name, text)
        }),
        loadGFAFromLocation: flow(function* (location: FileLocation) {
          self.setStatusMessage('Fetching GFA')
          const stated = self.loadedRegion
          const live = yield* loadWholeGFA(
            'uri' in location
              ? (location.uri.split('/').pop() ?? 'GFA')
              : 'GFA',
            signal =>
              openLocation(location).readFile({ encoding: 'utf8', signal }),
            stated,
          )
          if (stated && live && self.graph) {
            yield* loadRepeats(stated, () => self.loadedRegion === stated)
          }
        }),
        loadFromTabixSubgraph: flow(function* (
          adapterConfig: Record<string, unknown>,
          region: SubgraphRegion,
          opts: {
            trackId?: string
          } = {},
        ) {
          self.loadedTrackId = opts.trackId ?? ''
          self.loadedRegion = opts.trackId ? region : undefined
          self.coarseCut = false
          yield* doSubgraphLoad(adapterConfig, region, {
            hops: self.subgraphContext,
            haplotypes: self.subgraphHaplotypes,
          })
        }),
        // Cut on attach only — a graph already on screen is either the user's
        // own or one this just drew.
        refetchIfNeeded: flow(function* () {
          if (!self.graph) {
            yield* cutFromLoadedTrack()
          }
        }),
        // Cut the same region again, for a change to what the cut returns
        // rather than to how it is drawn (subgraphContext).
        reloadSubgraph: flow(function* () {
          yield* cutFromLoadedTrack()
        }),
        // Re-read one annotation track alone, for a track change or a graph
        // that came from a whole file beside a stated region. The graph, its
        // layout and any open bubble stay as they are. Live only while the
        // track it read is still the one chosen, so a slow read cannot land
        // over the pick that followed it.
        reloadRepeats: flow(function* () {
          const region = self.loadedRegion
          const trackId = self.repeatTrack?.trackId
          if (region) {
            yield* loadRepeats(
              region,
              () =>
                self.loadedRegion === region &&
                self.repeatTrack?.trackId === trackId,
            )
          }
        }),
        reloadGenes: flow(function* () {
          const region = self.loadedRegion
          const trackId = self.geneTrack?.trackId
          if (region) {
            yield* loadGenes(
              region,
              () =>
                self.loadedRegion === region &&
                self.geneTrack?.trackId === trackId,
            )
          }
        }),
        // Open one bubble: the graph becomes the segments the bubble row names,
        // drawn in the layout the reader is in, or force-directed from the
        // variant map. The graph it came from stays behind it, one click away,
        // and the popped graph gets its own derived bubbles, so a superbubble
        // opens progressively.
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
              layoutMode: self.layoutMode,
              label: graph.name,
              indexBubbles: self.indexBubbles,
            },
          ]
          self.indexBubbles = undefined
          const label = `${BUBBLE_KIND_NAMES[classifyBubble(bubble).kind]} at ${bubble.refName}:${bubble.start.toLocaleString()}`
          self.graph = { ...sub, name: label }
          if (self.layoutMode === 'variants') {
            self.layoutMode = 'force'
          }
          self.clearInteractionState()
          self.viewportOwner = 'fit'
          self.isLoading = true
          try {
            if (yield* layoutInto(self.graph)) {
              self.isLoading = false
            }
          } catch (e) {
            if (isLive()) {
              self.error = e
              self.isLoading = false
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
              self.isLoading = false
            }
          } catch (e) {
            self.error = e
            self.isLoading = false
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
              self.isLoading = false
            }
          } catch (e) {
            console.error('[GraphGenomeView.recomputeLayout]', e)
            self.error = e
            self.isLoading = false
          }
        }),
      }
    })
    .actions(self => ({
      // The settle clock. A pan the cut still holds fetches nothing; one past
      // its edge re-cuts the window plus a window-width each side, on the tier
      // the zoom asks for. Overlapping re-cuts are ordered by doSubgraphLoad's
      // liveLoad, so the latest window wins.
      settleOn(seen: HostWindow) {
        const above = self.coarseAboveBpPerPx
        const tier =
          above !== undefined && seen.bpPerPx > above ? 'coarse' : 'fine'
        const cap = tier === 'coarse' ? Infinity : self.maxRegionBp
        const visible = seen.end - seen.start
        self.cutNote =
          visible > cap
            ? `Holding the last cut: ${formatSpanBp(visible)} is past the ${formatSpanBp(cap)} a cut may span`
            : undefined
        if (
          self.cutNote !== undefined ||
          (tier === self.cutTier && cutHolds(self.loadedRegion, seen))
        ) {
          return
        }
        self.coarseCut = tier === 'coarse'
        self.loadedRegion = hostCut(seen, cap)
        self.recuts++
        void self.reloadSubgraph()
      },
    }))
    .actions(self => ({
      // The host's two clocks, started by the display that hosts the pane.
      // The frame clock moves x with every frame of the linear view and
      // fetches nothing; the settle clock wakes on its debounced blocks and
      // re-cuts only when the window has left the cut, whatever the layout.
      startHosting() {
        addDisposer(
          self,
          reaction(
            () => self.hostPlacesX,
            places => {
              if (!places) {
                self.releaseHost()
              }
            },
            { name: 'GraphHostPlacesX' },
          ),
        )
        addDisposer(
          self,
          reaction(
            () => self.hostFrame,
            frame => {
              if (frame) {
                self.hostTransform(frame.scale, frame.translateX)
              }
            },
            {
              equals: (a, b) =>
                a?.scale === b?.scale && a?.translateX === b?.translateX,
              fireImmediately: true,
              name: 'GraphHostFrame',
            },
          ),
        )
        addDisposer(
          self,
          reaction(
            () => self.host?.coarseDynamicBlocks,
            blocks => {
              const { host } = self
              const seen = blocks && host ? hostWindow(host) : undefined
              if (seen) {
                self.settleOn(seen)
              }
            },
            { fireImmediately: true, name: 'GraphHostSettle' },
          ),
        )
      },
    }))
    .actions(self => ({
      startRenderingBackend(backend: Renderer) {
        if (!self.autorunsInstalled) {
          // Autorun: paint the lane this graph was cut from in the graph's own
          // reference-position ramp, so a block above and its node below share
          // a hue with nothing configured. Follows the domain, so a re-cut or
          // an opened bubble moves the lane's ramp with the drawing.
          addDisposer(
            self,
            autorun(() => {
              const domain = self.rampDomain
              const trackId = self.loadedTrackId
              if (
                domain &&
                trackId &&
                self.effectiveColorScheme === 'reference-position'
              ) {
                const display = untracked(() =>
                  sourceLaneDisplay(
                    getSession(self).views,
                    self.connectedViewId,
                    trackId,
                  ),
                )
                if (display) {
                  paintSourceLane(display, referencePositionColor(domain))
                }
              }
            }),
          )

          // Autorun: keep the view fitted to the graph until the user moves it.
          // Reads layoutResult plus (via zoomToFit) width/canvasHeight, so it
          // re-fires — and re-fits — as the layout arrives and the canvas is
          // measured, rather than firing once against not-yet-known dimensions.
          // A manual pan/zoom (or a restored-session transform) makes the
          // viewport the user's, and a host makes it the linear view's.
          addDisposer(
            self,
            autorun(() => {
              if (
                self.layoutResult &&
                untracked(() => self.viewportOwner === 'fit')
              ) {
                self.zoomToFit()
              }
            }),
          )

          // Autorun: mirror a connected linear view's hover onto the graph. An
          // LGV writes `{hoverPosition, hoverFeature}` to session.hovered on
          // every mousemove; neither field names the source view, so the guard
          // is that the position lies in the region this graph was cut from.
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
                const region = self.loadedRegion
                const graph = self.graph
                if (region && graph) {
                  self.setHoveredNode(
                    hover && hoverInRegion(hover, region)
                      ? nodeForLgvHover({ hover, nodes: graph.nodes })
                      : null,
                  )
                }
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
              const viewport = viewportOf(self)
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

          // Autorun: hover/select are draw-time colour overrides, stated whole
          // on every change, so there is nothing to restore and nothing to go
          // stale when a rebuild renumbers the batch. Tracks `geometryVersion`
          // because an upload drops the renderer's edge highlight.
          addDisposer(
            self,
            autorun(() => {
              const b = self.currentRenderingBackend as Renderer | undefined
              const hoveredNode = self.hoveredNode
              const hoveredEdge = self.hoveredEdge
              const selectedNode = self.selectedNode
              dependOn(self.geometryVersion)
              if (b) {
                const nodes = new Map<string, number>()
                if (selectedNode !== null) {
                  nodes.set(selectedNode, SELECT_BRIGHTEN)
                }
                if (hoveredNode !== null && hoveredNode !== selectedNode) {
                  nodes.set(hoveredNode, HOVER_BRIGHTEN)
                }
                b.setNodeHighlights(nodes)
                b.setEdgeHighlight(hoveredEdge, HOVER_BRIGHTEN)
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
            b.resize(self.width, self.canvasHeight)
            const nodeById = self.nodeById
            if (self.nodePositions && self.graph && nodeById) {
              // The window moved (debounced pan/zoom), or the positions did (a
              // node drag, coalesced to a frame). Both change the drawing;
              // everything below reads them untracked or not at all.
              dependOn(self.viewportDirty, self.positionsVersion)
              const geometryStart = performance.now()
              const viewportBounds = untracked(() =>
                padded(viewportOf(self), VIEWPORT_PANES_BUILT),
              )
              const batch = buildGeometry({
                nodePositions: self.nodePositions,
                graph: self.graph,
                nodeById,
                colorScheme: self.effectiveColorScheme,
                contigThickness: self.contigThickness,
                connectorThickness: self.connectorThickness,
                drawPaths: self.effectiveDrawPaths,
                nodeWidth: self.nodeWidth,
                highlight: self.walkHighlight,
                // Untracked, so a zoom does not eagerly rebuild geometry — the
                // debounced viewportDirty bump drives the scale-dependent
                // rebuild (flatness, arrow visibility, viewport culling), same
                // as pan.
                axis: untracked(() => self.axisScale),
                linearLayout: self.linearLayout,
                viewportBounds,
                // Where each node sits on the reference and what interval the
                // hue spans. Held against the graph rather than derived here,
                // the same way `deletions` is and for the same reason — see
                // the `referenceRamp` view.
                referenceRamp: self.referenceRamp,
                deletions: self.deletionEdgeIndexes,
                hiddenEdges: self.hiddenEdgeIndexes,
                // Read tracked above; passed here so the shared edge-curve
                // cache can tell a drag from a pan.
                version: self.positionsVersion,
              })
              b.uploadGeometry(batch)
              self.setGeometryMetrics(
                performance.now() - geometryStart,
                batch.nodeStrokes.length,
                { scale: untracked(() => self.scale), bounds: viewportBounds },
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
            b.render(self.darkMode ? [0.12, 0.12, 0.12, 1] : [1, 1, 1, 1])
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
      retryLoad() {
        if (self.loadedTrackId && self.loadedRegion) {
          void self.reloadSubgraph()
        } else if (self.gfaLocation) {
          void self.loadGFAFromLocation(self.gfaLocation)
        }
      },
      // A declaratively-instantiated view loads itself on attach, from either
      // declarative source: a whole-GFA `gfaLocation`, or the
      // `loadedTrackId`/`loadedRegion` pair the launch menu writes and a
      // reloaded session restores.
      //
      // This has to happen here rather than when the rendering backend starts:
      // the canvas only mounts once `hasGraph` is true, so a view whose graph
      // must be fetched would never fetch it.
      afterAttach() {
        // A restored session that already carries a non-default transform is
        // the user's own view — mark it so the fit autorun leaves it alone.
        if (!self.isDefaultViewport) {
          self.viewportOwner = 'user'
        }
        // loadGFAFromLocation leaves `gfaLocation` intact, so the source
        // round-trips through a session snapshot.
        if (self.gfaLocation && !self.graph) {
          void self.loadGFAFromLocation(self.gfaLocation)
        }
        void self.refetchIfNeeded()
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
        const onReference = target.assembly === self.loadedRegion?.assemblyName
        const viewId = showInLinearView({
          session,
          location: target.location,
          assembly: target.assembly,
          connectedViewId: self.connectedViewId,
          tracks: launchTracks({
            session,
            assemblyName: target.assembly,
            first:
              self.loadedTrackId && onReference
                ? self.loadedTrackId
                : undefined,
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
          graphTrackId: self.loadedTrackId || undefined,
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
      menuItems(): MenuItem[] {
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

export type GraphGenomeViewModel = ReturnType<
  ReturnType<typeof stateModelFactory>['create']
>
