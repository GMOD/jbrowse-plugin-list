import { bubbleHalos } from '@jbrowse/bandage-core/bubbles/bubbleHalos'
import { bubblesFromGraph } from '@jbrowse/bandage-core/bubbles/bubblesFromGraph'
import { resolveColorScheme } from '@jbrowse/bandage-core/colorSchemes'
import { deletionEdges } from '@jbrowse/bandage-core/deletionEdges'
import { genePins } from '@jbrowse/bandage-core/genes/genePins'
import { rowLabelBox } from '@jbrowse/bandage-core/graphLabels'
import { ROW_HEIGHT_PX } from '@jbrowse/bandage-core/layout/rowSpacing'
import { walkRowsExtent } from '@jbrowse/bandage-core/layout/walkRowLayout'
import { filterSamples, walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import {
  layoutModeByValue,
  modeUsesLayoutEngine,
} from '@jbrowse/bandage-core/layoutModes'
import { nodeInk } from '@jbrowse/bandage-core/nodeWidths'
import {
  pathColorsLegible,
  pathGreyCssColor,
  pathLegend,
} from '@jbrowse/bandage-core/pathColors'
import { FIT_PADDING, drawingBounds } from '@jbrowse/bandage-core/pipeline'
import {
  backboneAssembly,
  featuresOnBackbone,
  graphBackbone,
} from '@jbrowse/bandage-core/reference'
import {
  buildNeighbors,
  nodeReferenceSpan,
} from '@jbrowse/bandage-core/referenceSpan'
import {
  LIFT_BACKDROP_CSS,
  computeReferenceRamp,
} from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { tubeMapNodeColors } from '@jbrowse/bandage-core/tubeMap/nodeColors'
import { axisScaleOf } from '@jbrowse/bandage-core/viewport'
import { NO_VALUE_COLOR } from '@jbrowse/bandage-core/walkEncoding'
import { facetLifts, walkLift } from '@jbrowse/bandage-core/walkHighlight'
import { readConfObject } from '@jbrowse/core/configuration'
import {
  getContainingTrack,
  getContainingView,
  getSession,
} from '@jbrowse/core/util'

import { TUBE_MAP_MODES, dependOn, geometryPainted, paneBase } from './paneBase'
import { trackAdapterConfig } from '../../panSNAliases/trackAdapterConfig'
import { GENE_ADAPTER_TYPES, pickGeneTrack } from '../genes/geneFeatures'
import {
  REPEAT_ADAPTER_TYPES,
  pickRepeatTrack,
} from '../repeats/repeatFeatures'
import { withCalls } from '../repeats/walkCalls'

import type {
  ColorScheme,
  ResolvedColorScheme,
} from '@jbrowse/bandage-core/colorSchemes'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { AssemblyNames } from '@jbrowse/bandage-core/reference'
import type { GraphNode } from '@jbrowse/bandage-core/types'
import type { NodeInk } from '@jbrowse/bandage-core/util/hitDetection'
import type { WalkLayer } from '@jbrowse/bandage-core/walkEncoding'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { FileLocation } from '@jbrowse/core/util/types'

export const withGraphViews = paneBase
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
      return self.drawPaths && pathColorsLegible(self.graph?.paths?.length ?? 0)
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
      return walks.length === 1 ? this.walkLabel(walks[0]!.name) : 'these walks'
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
    get deletionRoutes() {
      return self.layoutResult?.deletionRoutes
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
      return self.scale === 1 && self.translateX === 0 && self.translateY === 0
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
      return self.indexBubbles?.length ? self.indexBubbles : self.derivedBubbles
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
      return track ? trackAdapterConfig(self, track) : undefined
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
          adapterType: (readConfObject(t, 'adapter') as { type: string }).type,
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
    // Each walk sliced to the window, for walk rows and the strip; a repeat
    // pick slices again by its own array
    get cutWalkRows() {
      return self.graph ? walkRows(self.graph, self.graphRegion) : undefined
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
        : self.cutWalkRows
      if (!bars) {
        return undefined
      }
      const rows = filterSamples(bars.rows, self.walkRowSamples)
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
      if (!self.showBubbles || !this.drawsNodes || !self.graph || !positions) {
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
