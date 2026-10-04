import {
  BUBBLE_KIND_NAMES,
  bubbleSegmentIds,
  classifyBubble,
} from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { bubbleSubgraph } from '@jbrowse/bandage-core/bubbles/popBubble'
import { trimToWindow } from '@jbrowse/bandage-core/layout/trimToWindow'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import {
  anchorFromPaths,
  chooseReferencePath,
} from '@jbrowse/bandage-core/pathAnchoring'
import {
  engineKey,
  forceLayout,
  loadGraph,
} from '@jbrowse/bandage-core/pipeline'
import { assemblyWalk } from '@jbrowse/bandage-core/reference'
import { coarsenTubeMap } from '@jbrowse/bandage-core/tubeMap/coarsen'
import { readConfObject } from '@jbrowse/core/configuration'
import {
  getRpcSessionId,
  getSession,
  statusMessageText,
} from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { flow, isAlive } from '@jbrowse/mobx-state-tree'

import {
  TUBE_MAP_MODES,
  bubblePrefix,
  forceLayoutsOf,
  remember,
} from './paneBase'
import { withSettingActions } from './settingActions'
import { namesReads } from '../../GetGraphReads'
import { locLabel } from '../../launchFromGraph/contributors'
import { geneModelsFrom } from '../genes/geneFeatures'
import { repeatArraysFrom } from '../repeats/repeatFeatures'

import type { SubgraphCutOptions, SubgraphRegion } from '../../GetSubgraph'
import type { GafReads } from '../../gaf/gafFile'
import type { MinigraphBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import type { GeneModel } from '@jbrowse/bandage-core/genes/genePins'
import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'
import type { Graph, LayoutResult } from '@jbrowse/bandage-core/types'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation } from '@jbrowse/core/util/types'

export const withLoadActions = withSettingActions.actions(self => {
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

  function engineSettings() {
    return {
      quality: self.layoutQuality,
      linearLayout: self.linearLayout,
      bubbleSpread: self.bubbleSpread,
      showDeletionEdges: self.showDeletionEdges,
    }
  }

  // The engine's inputs, and only those: the graph, plus what `callLayout`
  // puts in `options`. The reference path is there because the seeds are a
  // function of it; the colour scheme and the anchored modes' own settings
  // are absent because none of them reaches the engine.
  function forceLayoutKey(graph: Graph) {
    return engineKey(graph, engineSettings())
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
      engineSettings(),
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
      // the node cap is a drawing's cost, and walk rows draw a bar per walk
      if (self.modeDrawsNodes && graph.nodes.length > self.maxGraphNodes) {
        throw new Error(
          `Graph too large to draw: ${graph.nodes.length.toLocaleString()} nodes (limit ${self.maxGraphNodes.toLocaleString()}). Pick Layout → Walk rows, zoom in to a smaller region, or raise maxGraphNodes on this view.`,
        )
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
          assemblyWalk(graph, self.assemblySpellings(region.assemblyName)) ??
          chooseReferencePath(paths, region.assemblyName)
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
    self.geneTrackFeatures = undefined
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

  // The gene track's features over the cut, which `geneFeatures` makes genes
  // of for the backbone to carry.
  function* loadGenes(region: SubgraphRegion, isLive: () => boolean) {
    const features = yield* trackFeatures(
      self.geneTrack?.trackId,
      region,
      'genes',
    )
    if (features && isLive()) {
      self.geneTrackFeatures = features
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
        typeof source === 'string' ? source : ((yield source(signal)) as string)
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

  // The graph and everything derived from it, dropped; any load in
  // flight ends too, or it would land its graph afterwards
  function dropGraph() {
    abortLoad()
    self.graph = undefined
    self.graphRegion = undefined
    self.loadedReferencePath = undefined
    self.layoutResult = undefined
    self.indexBubbles = undefined
    self.geneTrackFeatures = undefined
    self.walkGeneFeatures = undefined
    walkGeneCache.clear()
    self.repeatArrays = undefined
    self.readsShown = undefined
    self.popStack = []
    self.error = undefined
    self.isLoading = false
    self.loadCanceled = false
    self.statusMessage = ''
    self.clearInteractionState()
    self.clearPerfMetrics()
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
        'uri' in location ? (location.uri.split('/').pop() ?? 'GFA') : 'GFA',
        signal => openLocation(location).readFile({ encoding: 'utf8', signal }),
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
            self.graphRegion === region && self.geneTrack?.trackId === trackId,
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
