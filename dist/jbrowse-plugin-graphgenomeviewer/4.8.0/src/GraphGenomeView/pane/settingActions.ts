import { FACET_PAD_PX } from '@jbrowse/bandage-core/facetGrid'
import { segmentAt } from '@jbrowse/bandage-core/layout/walkStrip'
import { anchorFromPaths } from '@jbrowse/bandage-core/pathAnchoring'
import {
  FIT_PADDING,
  clampZoom,
  fittedTranslateY,
} from '@jbrowse/bandage-core/pipeline'
import { nodeReferenceSpan } from '@jbrowse/bandage-core/referenceSpan'
import { zoomAbout } from '@jbrowse/bandage-core/viewport'
import { getSession, isSessionModelWithWidgets } from '@jbrowse/core/util'
import { isAlive } from '@jbrowse/mobx-state-tree'

import { withFitViews } from './fitViews'
import { VIEWPORT_DEBOUNCE_MS, inheritForceLayouts } from './paneBase'
import { nodeOwnLocation } from '../../launchFromGraph/contributors'
import { withRows } from '../../launchFromGraph/linearViewTarget'

import type { BubbleSpread } from '@jbrowse/bandage-core/bubbleSpreads'
import type { MinigraphBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import type { ColorScheme } from '@jbrowse/bandage-core/colorSchemes'
import type { FacetSetting } from '@jbrowse/bandage-core/facetGrid'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { NodeWidth } from '@jbrowse/bandage-core/nodeWidths'
import type { Bounds } from '@jbrowse/bandage-core/pipeline'
import type {
  WalkEncoding,
  WalkLayer,
} from '@jbrowse/bandage-core/walkEncoding'

export const withSettingActions = withFitViews
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
    setWalkStrip(show: boolean) {
      self.walkStrip = show
      self.stripHover = null
    },
    // The pointer over the strip: the node under it becomes the hovered
    // node, so the drawing, the tooltip and a linked linear view follow
    setStripHover(hover: { row: string; offset: number } | null) {
      self.stripHover = hover
      const bars = self.walkStripRows
      const frame = self.walkStripFrame
      const row =
        hover && bars
          ? [bars.reference, ...bars.rows].find(r => r.name === hover.row)
          : undefined
      const node =
        row && frame && self.graph
          ? segmentAt(self.graph, row, hover!.offset, frame.scaleX)
          : undefined
      self.hoveredNode = node ?? null
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
                sampleCount: node.samples?.length,
                samples: node.samples,
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
