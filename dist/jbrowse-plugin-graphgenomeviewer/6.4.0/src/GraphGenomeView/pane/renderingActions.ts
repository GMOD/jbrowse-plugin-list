import { contains } from '@jbrowse/bandage-core/viewport'
import { getSession } from '@jbrowse/core/util'
import { addDisposer } from '@jbrowse/mobx-state-tree'
import { autorun, reaction, untracked } from 'mobx'

import { withLoadActions } from './loadActions'
import { EMPTY_BATCH, dependOn, paneViewportOf } from './paneBase'
import {
  hoverInRegion,
  nodeForLgvHover,
  readLgvHover,
} from '../../hoverSync/lgvHover'
import { walksForRow } from '../../hoverSync/rowWalks'

import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { Renderer } from '@jbrowse/bandage-core/renderer/types'

export const withRenderingActions = withLoadActions
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
        // Walk rows read the source track's samples TSV, for Group by...
        addDisposer(
          self,
          reaction(
            () =>
              self.chosenLayoutMode === 'walkrows'
                ? JSON.stringify(self.walkRowSamplesTsv ?? null)
                : undefined,
            key => {
              if (key !== undefined) {
                void self.loadWalkRowSampleTable()
              }
            },
            { fireImmediately: true },
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
        releaseTargets: (b: Renderer) => {
          b.releaseOffscreenTargets()
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
    // Deletion edges shape a force layout, so it is laid out again without them
    toggleDeletionEdges() {
      self.setShowDeletionEdges(!self.showDeletionEdges)
      return self.usesLayoutEngine ? self.recomputeLayout() : undefined
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
