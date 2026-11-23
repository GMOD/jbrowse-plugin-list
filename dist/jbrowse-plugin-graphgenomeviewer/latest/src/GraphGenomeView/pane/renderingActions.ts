import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { getSession } from '@jbrowse/core/util'
import { addDisposer, isAlive } from '@jbrowse/mobx-state-tree'
import { autorun, computed, reaction } from 'mobx'

import { withLoadActions } from './loadActions'
import { EMPTY_BATCH, TUBE_MAP_MODES, dependOn } from './paneBase'
import {
  bubbleForLgvHover,
  hoverFromPair,
  hoverInRegion,
  nodeForLgvHover,
  readLgvHover,
  readSelectedFeature,
} from '../../hoverSync/lgvHover'
import { walksForRow } from '../../hoverSync/rowWalks'
import { liveViewIds } from '../../launchFromGraph/linearViewTarget'
import { trackedDpr } from '../trackedDpr'
import { routesToLoad, tubeMapWalksToLoad } from '../unloadedWalks'

import type { LayoutEngineKind } from '@jbrowse/bandage-core/layoutEngines'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type {
  RenderBatch,
  Renderer,
} from '@jbrowse/bandage-core/renderer/types'

// How long after a cut's layout lands its labels wait for reads still on
// their way. The slowest ordinary read measured landed 0.92 s after the
// layout; one that never lands must not leave the view unlabelled.
export const READ_WAIT_MS = 1500

export const withRenderingActions = withLoadActions
  .views(self => ({
    get keyShape() {
      return self.keyShapeOf?.()
    },
  }))
  .views(self => ({
    // The key as it is now is not measured yet
    get keyAwaitsMeasure() {
      return (
        self.keyShape !== undefined &&
        self.legendAtRest &&
        self.measuredKeyShape !== self.keyShape
      )
    },
  }))
  .views(self => ({
    // A build window the settle autorun is about to move: onto a new layout,
    // or to a fit
    get buildViewPending() {
      const settled = self.settledBuildView
      return (
        settled !== undefined &&
        !self.buildViewSettled &&
        (settled.layout !== self.layoutResult || self.viewportOwner === 'fit')
      )
    },
    // A view kept fitted whose fit has moved, which GraphKeepFitted applies
    get fitPending() {
      const fit =
        self.viewportOwner === 'fit' ? self.fittedTransform : undefined
      return (
        !!fit &&
        (fit.scale !== self.scale ||
          fit.translateX !== self.translateX ||
          fit.translateY !== self.translateY)
      )
    },
  }))
  // The frame the labels are placed in, settled: the layout is in, and built
  // where a canvas draws it, no morph is sliding to it, no read of genes, repeats or bubbles is on its
  // way while the cut's labels await them, the key's size is measured for the
  // key as it is now, and a track has grown to hold it. The key's height never waits on the labels, since
  // it keeps its line for the unlabelled count whenever placeholders are
  // drawn, so placing them settles nothing again.
  .views(self => ({
    get labelFrameSettled() {
      const keyMeasured = !self.keyAwaitsMeasure
      const heightAnswered =
        self.answeredKeyFloor === undefined ||
        self.answeredKeyFloor === self.canvasFloor
      return (
        self.layoutResult !== undefined &&
        (self.currentRenderingBackend === undefined ||
          self.settledLayout === self.layoutResult) &&
        !self.morphing &&
        (self.featureReadsInFlight === 0 || !self.labelsAwaitReads) &&
        keyMeasured &&
        heightAnswered
      )
    },
  }))
  .actions(self => ({
    startRenderingBackend(backend: Renderer) {
      if (!self.autorunsInstalled) {
        // A cut's labels wait for its reads until first placed, and no
        // longer than READ_WAIT_MS after its layout lands; a read landing
        // after that lays them out again
        let readWait: ReturnType<typeof setTimeout> | undefined
        addDisposer(self, () => {
          clearTimeout(readWait)
        })
        addDisposer(
          self,
          reaction(
            () => (self.labelsAwaitReads ? self.layoutResult : undefined),
            laid => {
              clearTimeout(readWait)
              readWait = laid
                ? setTimeout(() => {
                    if (isAlive(self)) {
                      self.stopAwaitingReads()
                    }
                  }, READ_WAIT_MS)
                : undefined
            },
            { fireImmediately: true },
          ),
        )
        addDisposer(
          self,
          reaction(
            () => self.labelFrameSettled,
            settled => {
              if (settled) {
                self.stopAwaitingReads()
              }
            },
            { fireImmediately: true },
          ),
        )
        // Keep the view fitted to the graph until the user moves it.
        // fittedTransform tracks everything the fit depends on, so
        // it re-fits as the layout arrives, the canvas is measured and the
        // genes over a tube map claim their rows. A manual pan/zoom (or a
        // restored-session transform) makes the viewport the user's, and a
        // host makes it the linear view's.
        addDisposer(
          self,
          reaction(
            () => self.fittedTransform,
            fit => {
              if (fit && self.viewportOwner === 'fit') {
                self.zoomToFit()
              }
            },
            { fireImmediately: true, name: 'GraphKeepFitted' },
          ),
        )

        // A narrower or shorter pane can leave a placed drawing off screen
        addDisposer(
          self,
          reaction(
            () => `${self.viewBox.width} ${self.viewBox.height}`,
            () => {
              self.keepDrawingInView()
            },
          ),
        )
        addDisposer(
          self,
          // Faceting on or off, its columns, its count of panels and what
          // they split by each reshape the boxes the drawing is fitted into
          reaction(
            () => {
              const grid = self.facetGrid
              return grid
                ? `${self.facetSetting.field} ${self.facetPanels?.length} ${grid.columns}`
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
        // and the haplotypes' own genes on their nodes off the reference
        addDisposer(
          self,
          reaction(
            () => ({
              graph: self.graph,
              reads: JSON.stringify(self.ownGeneReads),
            }),
            () => {
              void self.loadOwnGenes()
            },
            {
              fireImmediately: true,
              equals: (a, b) => a.graph === b.graph && a.reads === b.reads,
            },
          ),
        )
        // Walk rows and tube map panels read the source track's samples
        // TSV, to group by its columns, and lifted walks to take its colours,
        // again for a graph after a dropped one, and each new cut retries a
        // read that failed
        addDisposer(
          self,
          reaction(
            () =>
              self.graph &&
              (self.chosenLayoutMode === 'walkrows' ||
                TUBE_MAP_MODES.has(self.chosenLayoutMode) ||
                self.walkLayers.length > 0)
                ? [self.graph, JSON.stringify(self.walkRowSamplesTsv ?? null)]
                : undefined,
            wanted => {
              if (wanted) {
                void self.loadWalkRowSampleTable()
              }
            },
            { fireImmediately: true },
          ),
        )
        // A host fits the rows when it takes the pane over, which is before
        // the legend measures the room it needs above them and before a split
        // into panels changes how tall the drawing is
        addDisposer(
          self,
          reaction(
            () =>
              `${self.fitPadTop} ${self.layoutBounds?.h} ${self.usableHeight}`,
            () => {
              if (self.viewportOwner === 'host') {
                self.zoomToFit()
              }
            },
          ),
        )

        // Mirror a connected linear view's hover onto the graph. An
        // LGV writes `{hoverPosition, hoverFeature}` to session.hovered on
        // every mousemove; neither field names the source view, so the guard
        // is that the position lies in the region this graph was cut from.
        // A pointer over the pane itself is the host's too, at a bp its x
        // only means on a reference-axis layout, so there the pane's own hit
        // test is the hover. A row naming a walk always lifts it; the node at
        // a bp lights only on `hover: 'everything'`, since every track's
        // pointer passes over some node's bp.
        //
        // Only `hovered` and the setting are watched, so a geometry rebuild
        // can't re-fire this and clobber a hover the canvas itself set.
        // Assigning an unchanged id doesn't notify, so a hover that travels
        // within one segment costs nothing downstream.
        addDisposer(
          self,
          reaction(
            () => ({
              hover: readLgvHover(getSession(self).hovered),
              lightsNode: self.hoverLightsEverything,
            }),
            ({ hover, lightsNode }) => {
              const region = self.graphRegion
              const graph = self.graph
              const inRegion =
                hover &&
                region &&
                hoverInRegion(hover, region) &&
                hoverFromPair(
                  hover,
                  self.pairedViewId,
                  liveViewIds([...getSession(self).views]),
                )
                  ? hover
                  : undefined
              // a row naming a walk is the hover, not the node at its bp,
              // whose band would cover the row's own cells
              const rowWalks =
                inRegion?.featureName && graph?.paths
                  ? walksForRow(inRegion.featureName, graph.paths)
                  : []
              // a bubble track's feature, or a graph-derived VCF record,
              // names a whole bubble, which lights whatever the setting
              const bubble =
                inRegion && bubbleForLgvHover(inRegion, () => self.bubbles)
              if (region && graph && !self.pointerInPane) {
                self.setHoveredBubble(bubble ?? null)
                self.setHoveredNode(
                  inRegion && lightsNode && rowWalks.length === 0 && !bubble
                    ? nodeForLgvHover({ hover: inRegion, nodes: graph.nodes })
                    : null,
                )
              }
              self.setHoveredRowWalks(rowWalks)
            },
            { fireImmediately: true, name: 'GraphMirrorLgvHover' },
          ),
        )

        // A click on a bubble feature or graph-derived variant in a linear
        // view opens its bubble here, as clicking its label would
        addDisposer(
          self,
          reaction(
            () => readSelectedFeature(getSession(self).selection),
            selected => {
              const region = self.graphRegion
              const bubble =
                selected &&
                region &&
                hoverInRegion(selected, region) &&
                bubbleForLgvHover(selected, () => self.bubbles)
              if (
                bubble &&
                !self.openBubbles.some(open => sameBubble(open, bubble))
              ) {
                self.toggleBubble(bubble)
              }
            },
          ),
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
              self.clearHover()
            },
            { name: 'GraphClearHoverOnViewportChange' },
          ),
        )

        // Autorun: the selection. The hover paints on a layer of its own.
        addDisposer(
          self,
          autorun(() => {
            const b = self.currentRenderingBackend as Renderer | undefined
            if (b) {
              self.applySelection(b)
              self.renderNow()
            }
          }),
        )
      }

      // The second argument is a SETUP THUNK, not the callbacks themselves:
      // anything it closes over lives exactly as long as the callbacks that
      // read it, which is what lets a per-backend memo work.
      // eslint-disable-next-line no-restricted-syntax -- the pane uploads one batch, not keyed cells, which installUpload has no form for
      self.attachRenderingBackend<Renderer>(backend, () => {
        // The drawing, kept while the upload waits on the key, so a wait that
        // ends with nothing changed builds nothing again
        const drawing = computed(
          () => {
            const start = performance.now()
            const built = self.buildDrawing(
              self.drawnHighlight,
              self.effectiveDrawPaths,
            )
            return built && { ...built, ms: performance.now() - start }
          },
          { keepAlive: true },
        )
        let sent: { backend: Renderer; batch: RenderBatch } | undefined
        const send = (b: Renderer, batch: RenderBatch) => {
          b.uploadGeometry(batch)
          sent = { backend: b, batch }
        }
        return {
          // Autorun: rebuild geometry when graph data, display options or the
          // build window change. The transform itself repaints, in `render`.
          upload: (b: Renderer) => {
            if (self.layoutResult?.tubeMap) {
              send(b, EMPTY_BATCH)
              self.setGeometryMetrics(0, EMPTY_BATCH, self.buildView)
              return true
            }
            // The panels paint the drawings, so the view recorded as built is
            // theirs
            const panel = self.facetDrawings?.[0]
            if (panel) {
              send(b, EMPTY_BATCH)
              self.setGeometryMetrics(0, EMPTY_BATCH, panel.view)
              return true
            }
            // A key that changed is measured, the fit beside it made and the
            // build window settled on it before the drawing is built, as the
            // key's column moves the fit the build is made at
            if (
              self.keyAwaitsMeasure ||
              self.fitPending ||
              self.buildViewPending
            ) {
              return false
            }
            const built = drawing.get()
            if (built) {
              if (sent?.backend !== b || sent.batch !== built.batch) {
                send(b, built.batch)
                self.setGeometryMetrics(built.ms, built.batch, built.view)
              }
              return true
            }
            // Nothing reached the backend, so the autorun may skip the redraw
            // it would otherwise force: with no positions there is nothing to
            // draw, which is the same case `render` below returns false for.
            return false
          },
          // Autorun: re-render on pan/zoom/theme without rebuilding geometry.
          // The canvas is sized here, not in `upload`, so a pane that grows
          // under a key measured after the build repaints without a rebuild.
          render: (b: Renderer) => {
            dependOn(trackedDpr())
            b.resize(self.paneWidth, self.canvasHeight)
            if (!self.nodePositions) {
              return false
            }
            self.paint(b)
            self.markPainted()
            return true
          },
          releaseTargets: (b: Renderer) => {
            b.releaseOffscreenTargets()
          },
        }
      })
    },
  }))
  .actions(self => ({
    // The drawing made again for a layout mode that changed from `from`; a
    // host overrides it with what its source needs, such as a recut
    relayoutFrom(_from: LayoutModeValue): Promise<unknown> {
      return self.recomputeLayout()
    },
  }))
  .actions(self => ({
    relayout(from: LayoutModeValue) {
      self.handledLayoutMode = self.chosenLayoutMode
      return self.relayoutFrom(from)
    },
  }))
  .actions(self => ({
    // A layout picked from a menu: the mode, then the drawing it makes.
    switchLayout(mode: LayoutModeValue) {
      const from = self.chosenLayoutMode
      self.setLayoutMode(mode)
      return self.relayout(from)
    },
    // loads the source again, for a host that has one
    retryLoad() {},
    afterCreate() {
      addDisposer(
        self,
        reaction(
          () => self.referencePath,
          () => {
            if (self.anchorOnReferencePath()) {
              void self.recomputeLayout()
            }
          },
        ),
      )
    },
    afterAttach() {
      // A restored session that already carries a non-default transform is
      // the user's own view — mark it so the fit autorun leaves it alone.
      if (!self.isDefaultViewport) {
        self.viewportOwner = 'user'
      }
      // A gene or repeat track change over the same cut re-reads that
      // annotation alone, whatever made it: the settings dialog, a track
      // added to the session, undo or a session delta. A new cut reads its
      // own.
      for (const [trackOf, reload] of [
        [() => self.geneTrack?.trackId, () => self.reloadGenes()],
        [() => self.repeatTrack?.trackId, () => self.reloadRepeats()],
      ] as const) {
        addDisposer(
          self,
          reaction(
            () => ({ track: trackOf(), region: self.graphRegion }),
            (now, was) => {
              if (now.region && now.region === was.region) {
                void reload()
              }
            },
            {
              equals: (a, b) => a.track === b.track && a.region === b.region,
            },
          ),
        )
      }
      // The layout set by anything but the menu: the config editor, Reset
      // track settings, undo, a session delta
      addDisposer(
        self,
        reaction(
          () => self.chosenLayoutMode,
          (to, from) => {
            if (to !== self.handledLayoutMode) {
              void self.relayout(from)
            }
          },
        ),
      )
      // An engine setting or the node cap lays the graph out again whatever
      // changed it: the settings dialog, the menu, the config editor, Reset
      // track settings, undo or a session delta. A change of layout mode lays
      // the graph out through relayout, so this reaction skips it.
      addDisposer(
        self,
        reaction(
          () => ({
            mode: self.chosenLayoutMode,
            engine: JSON.stringify(self.engineSettings),
            maxNodes: self.maxGraphNodes,
          }),
          (now, was) => {
            if (
              self.graph &&
              now.mode === was.mode &&
              ((now.engine !== was.engine && self.usesLayoutEngine) ||
                (now.maxNodes !== was.maxNodes && self.modeDrawsNodes))
            ) {
              void self.recomputeLayout()
            }
          },
          {
            equals: (a, b) =>
              a.mode === b.mode &&
              a.engine === b.engine &&
              a.maxNodes === b.maxNodes,
          },
        ),
      )
      // a tube map lays out again for its fold, its panels, its routes and
      // the column its routes split by
      addDisposer(
        self,
        reaction(
          () =>
            TUBE_MAP_MODES.has(self.chosenLayoutMode)
              ? JSON.stringify({
                  fold: self.tubeMapFold,
                  facet: self.facetSetting,
                  groupBy: self.walkRowGroupBy,
                  table: self.walkRowGroupBy && self.walkRowSampleTable?.length,
                  routes: self.tubeMapRoutes,
                  bundledBy:
                    self.tubeMapRoutes !== 'each'
                      ? self.tubeMapColoring?.field
                      : undefined,
                })
              : undefined,
          (facet, was) => {
            if (facet !== undefined && was !== undefined && self.graph) {
              void self.recomputeLayout()
            }
          },
        ),
      )
    },
  }))
  .actions(self => ({
    // Sets the engine and the mode in one action, so the engine reaction
    // sees the mode change and leaves the relayout to switchLayout
    switchForceEngine(engine: LayoutEngineKind) {
      self.setLayoutEngine(engine)
      return self.chosenLayoutMode === 'force'
        ? undefined
        : self.switchLayout('force')
    },
  }))
  .actions(self => ({
    expandWalks(names: string[]) {
      const more = names.filter(name => !self.expandedWalks.includes(name))
      if (more.length > 0) {
        self.expandedWalks = self.expandedWalks.concat(more)
      }
    },
  }))
  .actions(self => ({
    expandWalk(name: string) {
      self.expandWalks([name])
    },
    // A lifted walk's key states its length, a tube map draws the nodes of
    // the walks it shows while they are few enough, and ribbons, shared blocks
    // and the shared order compare nodes, so the cut fetches the steps of such
    // walks it left out. Walk rows draw a walk the same either way, so they
    // fetch only what a comparison needs.
    afterAttach() {
      addDisposer(
        self,
        reaction(
          () => {
            const lifted = self.abridged
              .map(walk => walk.name)
              .filter(name => self.walkLayers.some(l => l.walk === name))
            const tubeMap = TUBE_MAP_MODES.has(self.chosenLayoutMode)
              ? tubeMapWalksToLoad(self.graph, self.abridged)
              : []
            return Array.from(
              new Set(lifted.concat(tubeMap, routesToLoad(self.comparedRows))),
            )
          },
          names => {
            self.expandWalks(names)
          },
          {
            fireImmediately: true,
            equals: (a, b) => a.join('\n') === b.join('\n'),
          },
        ),
      )
    },
  }))
