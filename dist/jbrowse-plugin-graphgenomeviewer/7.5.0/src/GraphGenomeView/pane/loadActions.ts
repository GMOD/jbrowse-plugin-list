import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { bubbleSegmentIds } from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { foldVariants } from '@jbrowse/bandage-core/foldVariants'
import { regionLabel } from '@jbrowse/bandage-core/hoverText'
import {
  clipToWindow,
  trimToWindow,
} from '@jbrowse/bandage-core/layout/trimToWindow'
import { walkRowLayoutOf } from '@jbrowse/bandage-core/layout/walkRowLayout'
import { walkRowsOf } from '@jbrowse/bandage-core/layout/walkRowRuns'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import { panSNHaplotype, panSNSample } from '@jbrowse/bandage-core/pansn'
import {
  anchorFromPaths,
  chooseReferencePath,
} from '@jbrowse/bandage-core/pathAnchoring'
import { engineSettingsOf, loadGraph } from '@jbrowse/bandage-core/pipeline'
import { assemblyWalk } from '@jbrowse/bandage-core/reference'
import { bundleRoutes } from '@jbrowse/bandage-core/tubeMap/bundle'
import { coarsenTubeMap } from '@jbrowse/bandage-core/tubeMap/coarsen'
import { readConfObject } from '@jbrowse/core/configuration'
import {
  getRpcSessionId,
  getSession,
  statusMessageText,
} from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { flow, getEnv, isAlive } from '@jbrowse/mobx-state-tree'

import {
  EMPTY_BATCH,
  TUBE_MAP_MODES,
  bubblePrefix,
  fileName,
  forceLayouts,
} from './paneBase'
import { withSettingActions } from './settingActions'
import { namesReads } from '../../GetGraphReads'
import { geneModelsFrom } from '../genes/geneFeatures'
import { gfaText } from '../gfaText'
import { repeatArraysFrom } from '../repeats/repeatFeatures'
import {
  graphOfPaths,
  tubeMapPanelGroups,
  withTubeMapPanels,
} from '../tubeMapPanels'
import { parseSamplesTsv } from '../walkRowGroups'
import { walkRowsGraph } from '../walkRowsCut.ts'

import type { SubgraphCutOptions, SubgraphRegion } from '../../GetSubgraph'
import type { WalkCut } from '../../RgfaTabixAdapter/walkCut.ts'
import type { GafReads } from '../../gaf/gafFile'
import type { PaneLayout } from '../tubeMapPanels'
import type { MinigraphBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import type { GeneModel } from '@jbrowse/bandage-core/genes/genePins'
import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'
import type { Graph, LayoutResult } from '@jbrowse/bandage-core/types'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation } from '@jbrowse/core/util/types'

const withEngineSettings = withSettingActions.views(self => ({
  get engineSettings() {
    return engineSettingsOf({
      engine: self.layoutEngine,
      quality: self.layoutQuality,
      linearLayout: self.linearLayout,
      bubbleSpread: self.bubbleSpread,
      showDeletionEdges: self.showDeletionEdges,
    })
  },
}))

export const withLoadActions = withEngineSettings.actions(self => {
  let loadController: AbortController | undefined
  // the samples TSV location the table was read from, or is being read from
  let sampleTableKey: string | undefined
  // The engine run the live layout waits on, which alone writes the status
  // line, and each run by the promise the force cache hands every request
  // that shares it
  let awaitedRun: object | undefined
  const runOf = new WeakMap<Promise<unknown>, object>()

  // A StatusCallback takes an RpcStatus, which `statusMessageText` reads
  function callEngine(request: EngineRequest, run: object) {
    const { rpcManager } = getSession(self)
    return rpcManager.call(getRpcSessionId(self), 'GraphComputeLayout', {
      ...request,
      signal: loadController?.signal,
      statusCallback: status => {
        if (run === awaitedRun) {
          self.setStatusMessage(statusMessageText(status) ?? '')
        }
      },
    }) as Promise<{ result: LayoutResult; duration: number }>
  }

  // the node cap is a drawing's cost
  function assertDrawable(graph: Graph) {
    if (graph.nodes.length > self.maxGraphNodes) {
      throw new Error(
        `Graph too large to draw: ${graph.nodes.length.toLocaleString()} nodes (limit ${self.maxGraphNodes.toLocaleString()}). Pick Layout → Walk rows, zoom in to a smaller region, or raise the node limit in Graph settings.`,
      )
    }
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
    const laid = coarse?.graph ?? drawn
    const bundled = (g: Graph) =>
      tubeMap && self.tubeMapRoutes !== 'each'
        ? bundleRoutes(
            g,
            self.tubeMapColoring?.valueOf,
            self.tubeMapRoutes === 'bundled',
          )
        : g
    const runs = self.walkCut?.walkRowRuns
    const local =
      self.chosenLayoutMode === 'walkrows' && runs
        ? walkRowLayoutOf(graph, walkRowsOf(runs), self.graphRegion)
        : layoutModeByValue(self.chosenLayoutMode).run(
            bundled(laid),
            self.graphRegion,
            self.host ? self.layoutResult?.sampleRows : undefined,
          )
    if (local) {
      const withCoarse = (r: LayoutResult) =>
        coarse && r.tubeMap ? { ...r, tubeMap: { ...r.tubeMap, coarse } } : r
      const whole = withCoarse(local)
      const split = self.tubeMapPanelSplit
      const result: PaneLayout =
        tubeMap && split
          ? withTubeMapPanels(
              whole,
              tubeMapPanelGroups(laid, split).map(group => {
                const panel = layoutModeByValue(self.chosenLayoutMode).run(
                  bundled(graphOfPaths(laid, group.paths)),
                  self.graphRegion,
                )
                return { ...group, result: panel && withCoarse(panel) }
              }),
            )
          : whole
      return {
        result,
        duration: performance.now() - start,
        mode: self.chosenLayoutMode,
      }
    }
    // walk rows and tube maps fall back here for a graph with no walks
    assertDrawable(graph)
    const settings = self.engineSettings
    const hit = forceLayouts.ready(graph, settings)
    if (hit) {
      return {
        result: hit,
        duration: performance.now() - start,
        mode: 'force' as const,
      }
    }
    const run = {}
    const pending = forceLayouts.layout(graph, settings, r =>
      callEngine(r, run),
    )
    awaitedRun = runOf.get(pending) ?? run
    runOf.set(pending, awaitedRun)
    const forced = (yield pending) as { result: LayoutResult; duration: number }
    return { ...forced, mode: 'force' as const }
  }

  // Which layout request is the live one. A layout is async and nothing in
  // the UI waits for it, so several are routinely in flight: every engine
  // setting lays the graph out again on change, and a force layout takes
  // seconds where an anchored one is instant.
  //
  // The graph identity below is not enough to order them, because the
  // competing requests are usually layouts of the SAME graph. Left to
  // resolve order the last one to FINISH won rather than the last one
  // asked for, so switching away from a slow force layout — to an anchored
  // mode, a cheaper bubble spread, a lower quality — drew the abandoned
  // one over the top of the chosen one seconds later, with the dropdown
  // still naming the choice that was discarded.
  let liveRequest = 0
  let liveRequestPending = false
  // the error the last failed layout raised, which the next one to land clears
  let layoutError: unknown
  // the graph the layout on screen was computed for
  let laidOutGraph: Graph | undefined
  // a haplotype's genes by track and contig span
  const walkGeneCache = new Map<string, GeneModel[]>()

  function dropLayoutOfReplacedGraph() {
    if (self.graph !== laidOutGraph) {
      laidOutGraph = undefined
      self.layoutResult = undefined
      self.drawnLayoutMode = undefined
    }
  }

  // Applied under a guard because a layout is async and the user can load a
  // different graph, or ask for a different layout of it, while one is in
  // flight; the stale result must not land.
  function* layoutInto(graph: Graph) {
    const request = ++liveRequest
    liveRequestPending = true
    awaitedRun = undefined
    const isLive = () => self.graph === graph && request === liveRequest
    const signal = loadController?.signal
    let computed
    try {
      // walk rows draw a bar per walk, not a node each
      if (self.modeDrawsNodes) {
        assertDrawable(graph)
      }
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
      layoutError = e
      dropLayoutOfReplacedGraph()
      throw e
    } finally {
      if (request === liveRequest) {
        liveRequestPending = false
        settle()
      }
    }
    const live = isLive()
    if (live) {
      if (layoutError !== undefined && self.error === layoutError) {
        self.error = undefined
      }
      layoutError = undefined
      const previous = self.layoutResult
      const before = self.screenTransform
      laidOutGraph = graph
      self.layoutResult = computed.result
      self.drawnLayoutMode = computed.mode
      self.setLayoutMs(computed.duration)
      self.followNewLayout(previous)
      self.morphFrom(previous, before)
    }
    return live
  }

  // The walk a path graph's track puts on the region's assembly: the one
  // that names it, else the one chooseReferencePath infers
  function loadedReference(graph: Graph, region: SubgraphRegion) {
    const paths = graph.anchorPaths
    return graph.anchoredBy === 'paths' && paths
      ? (
          assemblyWalk(graph, self.assemblySpellings(region.assemblyName)) ??
          chooseReferencePath(paths, region.assemblyName)
        )?.name
      : undefined
  }

  // A cut parsed, its reference walk named: a tag-anchored walk-file cut
  // anchors on its nodes' tags, and names its walk on the region's assembly
  // so walk keys measure against it
  function parseCut(
    source: string | WalkCut,
    name: string,
    region: SubgraphRegion | undefined,
    whole = false,
  ) {
    const referencePath = self.referencePath || region?.assemblyName
    const parsed =
      typeof source !== 'string' && source.walkRowRuns && !whole
        ? walkRowsGraph(source, name, referencePath)
        : loadGraph(source, name, { referencePath })
    if (
      parsed.anchoredBy === 'tags' &&
      !parsed.referencePath &&
      parsed.paths?.length &&
      region
    ) {
      parsed.referencePath = assemblyWalk(
        parsed,
        self.assemblySpellings(region.assemblyName),
      )?.name
    }
    return parsed
  }

  // Replaces the graph on screen and the cut it came from, and drops the
  // annotations read beside the last graph. It drops the hover and the
  // selection too, because hoveredEdge is an index into graph.edges and
  // hoveredNode/selectedNode are ids, which would point the tooltip and the
  // highlight at whatever sits there in the new graph.
  function resetCut(cut?: {
    graph: Graph
    walkCut: WalkCut | undefined
    region: SubgraphRegion | undefined
    loadedReferencePath: string | undefined
    foldedBelowBp: number | undefined
    readsShown: { shown: number; total: number } | undefined
  }) {
    self.graph = cut?.graph
    self.walkCut = cut?.walkCut
    self.graphRegion = cut?.region
    self.loadedReferencePath = cut?.loadedReferencePath
    self.foldedBelowBp = cut?.foldedBelowBp
    self.readsShown = cut?.readsShown
    self.indexBubbles = undefined
    self.geneTrackFeatures = undefined
    self.walkGeneFeatures = undefined
    self.ownGeneFeatures = undefined
    walkGeneCache.clear()
    self.repeatArrays = undefined
    self.clearInteractionState()
  }

  // `keepSelection` for a re-cut of the same source: node ids survive one
  // where edge indexes do not, so the selection is found again by id.
  // `readsOf` fetches the reads over the parsed graph before its one
  // layout, since the tube map lays them out with the paths. `foldBelowBp`
  // is what a host's zoom cannot show: variants under it fold into the
  // reference, and the drawing is clipped to the region it was cut for.
  function* parseAndLayout(
    source: string | WalkCut,
    name: string,
    region: SubgraphRegion | undefined,
    keepSelection = false,
    readsOf?: (graph: Graph) => Promise<GafReads>,
    foldBelowBp = 0,
    // reads over the cut that need no layout, started with it so a layout
    // that fails or runs long neither drops nor delays them
    alongside?: () => Promise<unknown>,
  ) {
    const signal = loadController?.signal
    const walkCut =
      typeof source !== 'string' && source.walkRowRuns ? source : undefined
    const parsed = parseCut(source, name, region)
    const loaded = region ? loadedReference(parsed, region) : undefined
    const anchored =
      !self.referencePath &&
      loaded !== undefined &&
      loaded !== parsed.referencePath
        ? anchorFromPaths(parsed, loaded)
        : parsed
    const folded =
      foldBelowBp > 0 && !readsOf
        ? foldVariants(anchored, foldBelowBp, { cut: true })
        : anchored
    const graph =
      region && folded !== anchored
        ? clipToWindow(folded, region, foldBelowBp)
        : folded
    let readsShown: { shown: number; total: number } | undefined
    if (readsOf) {
      self.setStatusMessage('Reading alignments')
      try {
        const { records, total } = (yield readsOf(graph)) as GafReads
        graph.reads = records
        readsShown = { shown: records.length, total }
      } catch (e) {
        if (signal?.aborted) {
          return
        }
        console.warn('[GraphGenomeView] no reads for this graph', e)
      }
      if (signal?.aborted) {
        return
      }
    }
    const selected = keepSelection ? self.selectedNode : null
    resetCut({
      graph,
      walkCut,
      region,
      loadedReferencePath: loaded,
      foldedBelowBp: folded === anchored ? undefined : foldBelowBp,
      readsShown,
    })
    // a re-cut keeps the bubbles still in it open
    const names = new Set(graph.nodes.map(n => n.name))
    self.openBubbles = self.openBubbles.filter(b =>
      bubbleSegmentIds(b).some(id => names.has(id)),
    )
    // against the new graph's own nodes: nodeById reads through the layout,
    // which is still the last graph's
    if (selected !== null && graph.nodes.some(n => n.id === selected)) {
      self.selectedNode = selected
    }
    self.setStatusMessage('Computing layout')
    const reads = alongside?.()
    reads?.catch(() => undefined)
    yield* layoutInto(graph)
    // a load superseded mid-layout leaves the status to the one replacing it
    if (reads && !signal?.aborted) {
      self.setStatusMessage('Reading annotations')
      yield reads
    }
  }

  // Which load is the live one, for the reason liveRequest orders layouts:
  // every change in the settings dialog re-cuts, a remote cut takes seconds,
  // and the last one to finish is not the last one asked for.
  let liveLoad = 0
  // the load still fetching, parsing or reading annotations, whose spinner a
  // layout of the graph already on screen must not clear
  let loadInFlight: number | undefined

  function beginLoad() {
    const load = ++liveLoad
    loadController?.abort()
    loadController = new AbortController()
    loadInFlight = load
    self.loadCanceled = false
    return {
      isLive: () => load === liveLoad,
      signal: loadController.signal,
    }
  }

  // The spinner stays up while a load or the layout last asked for is in
  // flight. Clearing it sooner reports "done" while the layout the user
  // asked for is still computing, the common case when a cheap choice
  // follows an expensive one.
  function settle() {
    if (loadInFlight === undefined && !liveRequestPending) {
      self.finishLoading()
    }
  }

  function endLoad() {
    loadInFlight = undefined
    settle()
  }

  // Runs `body` as a load. It raises the spinner and clears the error first,
  // and while it is the live load it reports a failure and ends the spinner.
  function* runLoad(
    label: string,
    body: (load: {
      isLive: () => boolean
      signal: AbortSignal
    }) => Generator<PromiseLike<unknown>, void, unknown>,
  ) {
    const load = beginLoad()
    self.isLoading = true
    self.error = undefined
    try {
      yield* body(load)
    } catch (e) {
      if (load.isLive()) {
        console.error(`[GraphGenomeView.${label}]`, e)
        self.error = e
      }
    } finally {
      if (load.isLive()) {
        endLoad()
      }
    }
  }

  // Features over the cut. A failed read warns and returns undefined, so an
  // annotation never fails the load.
  function* readFeatures(
    adapterConfig: Record<string, unknown>,
    region: SubgraphRegion,
    what: string,
    signal?: AbortSignal,
  ) {
    try {
      return (yield getSession(self).rpcManager.call(
        getRpcSessionId(self),
        'CoreGetFeatures',
        { adapterConfig, regions: [region], signal },
      )) as Feature[]
    } catch (e) {
      // a cut the next one replaced aborts its reads, which is not a failure
      if (!signal?.aborted) {
        console.warn(`[GraphGenomeView] no ${what} for this graph`, e)
      }
      return undefined
    }
  }

  // Bubble indexes a read failed on, so a graph without one, the ordinary
  // case, is not asked again on every re-cut of a pan
  const missingBubbleIndexes = new Set<string>()

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
    signal?: AbortSignal,
    foldBelowBp = 0,
  ) {
    // The track config arrives as written, so the prefix is either the
    // `uri` shorthand or the segments location it expands to.
    const prefix = bubblePrefix(adapterConfig)
    const uri = `${prefix}.bubbles.bed.gz`
    if (
      adapterConfig.type !== 'RgfaTabixAdapter' ||
      prefix === undefined ||
      missingBubbleIndexes.has(uri)
    ) {
      return
    }
    const features = yield* readFeatures(
      {
        type: 'MinigraphBubbleAdapter',
        uri,
        baseUri: adapterConfig.baseUri,
        assemblyNameToPanSN: adapterConfig.assemblyNameToPanSN,
      },
      region,
      'bubble index',
      signal,
    )
    if (features === undefined && !signal?.aborted) {
      missingBubbleIndexes.add(uri)
    }
    if (features && isLive()) {
      self.indexBubbles = features.flatMap(f => {
        const start = f.get('start')
        const end = f.get('end')
        const longestAlleleLength = f.get('longestAlleleLength') as number
        return Math.max(end - start, longestAlleleLength) < foldBelowBp
          ? []
          : [
              {
                refName: region.refName,
                start,
                end,
                segmentCount: f.get('segmentCount') as number,
                pathCount: (f.get('pathCount') as number | undefined) ?? 0,
                inversion: f.get('inversion') as boolean,
                shortestAlleleLength: f.get('shortestAlleleLength') as number,
                longestAlleleLength,
                segments: f.get('segments') as string,
                shortestAllele: undefined,
                longestAllele: undefined,
              },
            ]
      })
    }
  }

  // A session track's features over the cut, undefined when the session has
  // no such track
  function* trackFeatures(
    trackId: string | undefined,
    region: SubgraphRegion,
    what: string,
    signal?: AbortSignal,
  ) {
    const config = trackId ? self.sessionTrack(trackId) : undefined
    if (!config) {
      return undefined
    }
    return yield* readFeatures(
      readConfObject(config, 'adapter'),
      region,
      what,
      signal,
    )
  }

  // A haplotype assembly's genes over a span of its own contig, named for
  // that contig whatever the track calls it, read once per cut
  function* haplotypeGenes(trackId: string, region: SubgraphRegion) {
    const cacheKey = `${trackId} ${region.refName}:${region.start}-${region.end}`
    let genes = walkGeneCache.get(cacheKey)
    if (!genes) {
      const features = yield* trackFeatures(trackId, region, 'haplotype genes')
      if (!features) {
        return undefined
      }
      genes = geneModelsFrom(features).map(g => ({
        ...g,
        refName: region.refName,
      }))
      walkGeneCache.set(cacheKey, genes)
    }
    return genes
  }

  // The annotation tracks read over the cut: genes, which `geneFeatures`
  // makes genes of for the backbone to carry, and tandem repeat arrays, for
  // the walk rows to measure between and tile by
  const annotations = {
    genes: {
      trackId: () => self.geneTrack?.trackId,
      set: (features: Feature[] | undefined) => {
        self.geneTrackFeatures = features
      },
    },
    repeats: {
      trackId: () => self.repeatTrack?.trackId,
      set: (features: Feature[] | undefined) => {
        self.repeatArrays = features && repeatArraysFrom(features)
      },
    },
  }
  type Annotation = keyof typeof annotations

  // Lands only while the track it read is still the one chosen, so a slow
  // read cannot land over the pick that followed it
  function* loadAnnotation(
    kind: Annotation,
    region: SubgraphRegion,
    isLive: () => boolean,
    signal?: AbortSignal,
  ) {
    const { trackId, set } = annotations[kind]
    const track = trackId()
    const features = yield* trackFeatures(track, region, kind, signal)
    if (features && isLive() && trackId() === track) {
      set(features)
    }
  }

  // The annotation reads over a cut, each landing as it arrives
  function annotationReads(
    region: SubgraphRegion,
    isLive: () => boolean,
    signal: AbortSignal,
  ) {
    return (['genes', 'repeats'] as const).map(kind =>
      flow(loadAnnotation)(kind, region, isLive, signal),
    )
  }

  // One annotation read again alone, for a track change
  function* reloadAnnotation(kind: Annotation) {
    const region = self.graphRegion
    if (region) {
      annotations[kind].set(undefined)
      yield* loadAnnotation(kind, region, () => self.graphRegion === region)
    }
  }

  // Raises `isLoading` before any fetch, so a view waiting on a remote file
  // shows its loading state instead of the import form. Text already in
  // hand is parsed without yielding first. `region` is the window a
  // declared file was stated beside, which the parse anchors on and the
  // annotations are read over.
  function* loadWholeGFA(
    name: string,
    source: string | ((signal: AbortSignal) => Promise<string>),
    region?: SubgraphRegion,
  ) {
    yield* runLoad('loadWholeGFA', function* ({ isLive, signal }) {
      const text =
        typeof source === 'string' ? source : ((yield source(signal)) as string)
      if (!isLive()) {
        return
      }
      yield* parseAndLayout(
        text,
        name,
        region,
        false,
        undefined,
        0,
        region && (() => Promise.all(annotationReads(region, isLive, signal))),
      )
    })
  }

  function abortLoad() {
    loadController?.abort()
    loadController = undefined
    loadInFlight = undefined
    liveLoad++
    liveRequest++
    liveRequestPending = false
    awaitedRun = undefined
  }

  // The graph a layout of the current mode draws: a walk-rows cut's
  // stepless walks parsed whole once a layout that draws nodes needs them
  function wholeGraph() {
    const cut = self.walkCut
    const graph = self.graph
    if (!cut || !graph || self.chosenLayoutMode === 'walkrows') {
      return graph
    }
    const whole = parseCut(cut, graph.name, self.graphRegion, true)
    self.graph = whole
    self.walkCut = undefined
    return whole
  }

  // Drops the graph and all it derived, and ends any load in flight, which
  // would otherwise land its graph afterwards
  function dropGraph() {
    abortLoad()
    self.finishMorph()
    self.morphEntering = undefined
    self.drawnBatch = EMPTY_BATCH
    self.paintedViewport = undefined
    resetCut()
    laidOutGraph = undefined
    layoutError = undefined
    self.layoutResult = undefined
    self.drawnLayoutMode = undefined
    self.walkRowSampleTable = undefined
    sampleTableKey = undefined
    self.openBubbles = []
    self.error = undefined
    self.isLoading = false
    self.loadCanceled = false
    self.statusMessage = ''
    self.clearPerfMetrics()
    // the next graph has nothing to do with where the user left this one
    if (self.viewportOwner === 'user') {
      self.viewportOwner = 'fit'
    }
  }

  return {
    // back to the import form
    clearGraph() {
      dropGraph()
    },
    // The user's stop before anything is drawn. The source stays, so a
    // retry can load it again.
    cancelLoad() {
      if (self.canCancelLoad) {
        dropGraph()
        self.loadCanceled = true
      }
    },
    // The user's stop, leaving whatever is drawn under it, and dropping a
    // swapped-in graph whose layout never landed
    stopLoad() {
      abortLoad()
      dropLayoutOfReplacedGraph()
      if (!self.layoutResult) {
        resetCut()
      }
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
    // A file the user picked, read inside the load so the form shows its
    // progress rather than sitting idle through a large read
    loadGFAFile: flow(function* (file: Blob, name: string) {
      self.setStatusMessage('Reading file')
      yield* loadWholeGFA(name, () =>
        file.arrayBuffer().then(buf => gfaText(new Uint8Array(buf))),
      )
    }),
    loadGFAFromLocation: flow(function* (
      location: FileLocation,
      region?: SubgraphRegion,
    ) {
      self.setStatusMessage('Fetching GFA')
      yield* loadWholeGFA(
        fileName(location) || 'GFA',
        signal =>
          openLocation(location, getEnv(self).pluginManager)
            .readFile({ signal })
            .then(gfaText),
        region,
      )
    }),
    // One cut of a region, laid out with the annotations over it. Whether
    // the region may be cut is the caller's call; overlapping cuts are
    // ordered by liveLoad, so the latest one lands.
    cutSubgraph: flow(function* (
      adapterConfig: Record<string, unknown>,
      region: SubgraphRegion,
      opts: SubgraphCutOptions = {},
      foldBelowBp = 0,
    ) {
      yield* runLoad('cutSubgraph', function* ({ isLive, signal }) {
        self.setStatusMessage('Fetching subgraph')
        const fetchStart = performance.now()
        const cut = (yield getSession(self).rpcManager.call(
          getRpcSessionId(self),
          'GetSubgraph',
          { adapterConfig, region, opts, signal },
        )) as string | WalkCut
        if (!isLive()) {
          return
        }
        self.setFetchMs(performance.now() - fetchStart)
        if (!cut) {
          throw new Error(
            'Adapter returned no GFA — region may be outside indexed data or the adapter does not implement getSubgraph',
          )
        }
        yield* parseAndLayout(
          cut,
          regionLabel(region),
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
          foldBelowBp,
          // Independent remote reads, each landing as it arrives. A coarse
          // cut reads no bubble index: its nodes are the bubbles, and the
          // index over its window can run to a chromosome's rows.
          () =>
            Promise.all([
              opts.tier === 'coarse'
                ? undefined
                : flow(loadBubbles)(
                    adapterConfig,
                    region,
                    isLive,
                    signal,
                    self.foldedBelowBp,
                  ),
              ...annotationReads(region, isLive, signal),
            ]),
        )
      })
    }),
    // A track change re-reads that annotation alone. The graph, its layout
    // and any open bubble stay as they are.
    reloadRepeats: flow(function* () {
      yield* reloadAnnotation('repeats')
    }),
    reloadGenes: flow(function* () {
      yield* reloadAnnotation('genes')
    }),
    // The source track's samples TSV, read once per location, for walk
    // rows to group by. A failed read leaves the rows ungrouped, says so,
    // and is tried again on the next call.
    loadWalkRowSampleTable: flow(function* () {
      const location = self.walkRowSamplesTsv
      const key = location ? JSON.stringify(location) : undefined
      if (key === sampleTableKey) {
        return
      }
      sampleTableKey = key
      self.walkRowSampleTable = undefined
      if (!location) {
        return
      }
      try {
        const text = (yield openLocation(
          location,
          getEnv(self).pluginManager,
        ).readFile('utf8')) as string
        if (isAlive(self) && key === sampleTableKey) {
          self.walkRowSampleTable = parseSamplesTsv(text)
        }
      } catch (e) {
        if (isAlive(self) && key === sampleTableKey) {
          sampleTableKey = undefined
          getSession(self).notify(
            `Walk rows cannot be grouped: the samples table did not load (${String(e)})`,
            'warning',
          )
        }
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
            const genes = yield* haplotypeGenes(trackId, region)
            if (genes) {
              fetched.set(row, genes)
            }
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
    // Each loaded haplotype's genes on its own off-reference nodes, renamed
    // to those nodes' stable sequence so genePins lands them there
    loadOwnGenes: flow(function* () {
      const reads = self.ownGeneReads
      const key = JSON.stringify(reads)
      const graph = self.graph
      const fetched = (yield Promise.all(
        reads.map(({ stableRefName, trackId, region }) =>
          flow(function* () {
            const genes = yield* haplotypeGenes(trackId, region)
            // a chip reading LPA twice would not say whose copy each is
            const whose =
              panSNHaplotype(stableRefName) ?? panSNSample(stableRefName)
            return (genes ?? []).map(g => ({
              ...g,
              name: `${g.name} · ${whose}`,
              refName: stableRefName,
            }))
          })(),
        ),
      )) as GeneModel[][]
      if (
        isAlive(self) &&
        self.graph === graph &&
        JSON.stringify(self.ownGeneReads) === key
      ) {
        self.ownGeneFeatures = reads.length ? fetched.flat() : undefined
      }
    }),
    // Open a bubble in place: it keeps its colour, the rest of the drawing
    // greys, and the bubbles inside it get labels of their own. Opening an
    // open one closes it and those inside it.
    toggleBubble(bubble: MinigraphBubble) {
      const open = self.openBubbles
      const at = open.findIndex(o => sameBubble(o, bubble))
      if (at >= 0) {
        self.openBubbles = open.slice(0, at)
        return
      }
      const names = new Set(bubbleSegmentIds(bubble))
      if (!self.graph?.nodes.some(n => names.has(n.name))) {
        getSession(self).notify(
          'None of the segments of this bubble are in the cut; widen the graph context to open it',
          'info',
        )
        return
      }
      const insides = self.openBubbleInsides
      let parent = insides.length - 1
      while (
        parent >= 0 &&
        !insides[parent]!.some(b => sameBubble(b, bubble))
      ) {
        parent--
      }
      self.openBubbles = [...open.slice(0, parent + 1), bubble]
    },
    closeBubbles() {
      if (self.openBubbles.length > 0) {
        self.openBubbles = []
      }
    },
    recomputeLayout: flow(function* () {
      const graph = wholeGraph()
      if (!graph) {
        return
      }
      self.isLoading = true
      self.setStatusMessage('Computing layout')
      try {
        yield* layoutInto(graph)
      } catch (e) {
        console.error('[GraphGenomeView.recomputeLayout]', e)
        self.error = e
      }
    }),
  }
})
