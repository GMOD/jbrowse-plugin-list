import {
  FACET_PAD_PX,
  facetCells,
  facetGrid,
} from '@jbrowse/bandage-core/facetGrid'
import { figureSvg } from '@jbrowse/bandage-core/figure'
import {
  LEGEND_INSET_PX,
  layoutLabels,
} from '@jbrowse/bandage-core/labelLayout'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import { FIT_PADDING, fitTransform } from '@jbrowse/bandage-core/pipeline'
import { buildGeometry } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { rulerBoxes } from '@jbrowse/bandage-core/tubeMap/axis'
import {
  connectorAt,
  tubeMapConnectors,
} from '@jbrowse/bandage-core/tubeMap/connectors'
import {
  mismatchOnScreen,
  mismatchesLegible,
} from '@jbrowse/bandage-core/tubeMap/draw'
import {
  tubeMapFrame,
  tubeMapNodeAt,
} from '@jbrowse/bandage-core/tubeMap/frame'
import {
  GENE_ROW_PX,
  tubeMapGeneRows,
} from '@jbrowse/bandage-core/tubeMap/genes'
import { padded } from '@jbrowse/bandage-core/viewport'
import { walkPosition } from '@jbrowse/bandage-core/walkKey'
import {
  expandTabixShorthand,
  readConfObject,
} from '@jbrowse/core/configuration'
import { getSession } from '@jbrowse/core/util'
import { getDpr } from '@jbrowse/render-core/canvas2dUtils'
import { untracked } from 'mobx'

import { hostFrame } from '../host'
import { withHostViews } from './hostViews'
import {
  HOVER_BRIGHTEN,
  MAX_CANVAS_HEIGHT,
  MIN_CANVAS_HEIGHT,
  MIN_FIT_TUBE_PX,
  PAPER_DARK,
  PAPER_LIGHT,
  SELECT_BRIGHTEN,
  VIEWPORT_PANES_BUILT,
  dependOn,
  paneViewportOf,
  uriOf,
} from './paneBase'

import type { FacetGrid, FacetSetting } from '@jbrowse/bandage-core/facetGrid'
import type { Renderer } from '@jbrowse/bandage-core/renderer/types'
import type { LiftedWalk, WalkLift } from '@jbrowse/bandage-core/walkHighlight'
import type { FileLocation } from '@jbrowse/core/util/types'

export const withFitViews = withHostViews
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
      return this.facetGridIn(self.host ? this.canvasHeight : this.paneCeiling)
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
        deletionRoutes: self.deletionRoutes,
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
      const window = region && `${region.refName}:${region.start}-${region.end}`
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
                snarls: self.cutsWholeWalks
                  ? 'overlapping'
                  : (adapter!.subgraphSnarls as string | undefined),
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
          walkStrip: self.walkStripShown || undefined,
          walkRowSamples: self.walkStripShown ? self.walkRowSamples : undefined,
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
    // Why bandage-figure can't make this drawing again: it draws only
    // layouts with nodes, from a graph it can read for itself
    get figureSpecUnavailable() {
      return !self.drawsNodes
        ? `bandage-figure draws no ${layoutModeByValue(self.chosenLayoutMode).label} layout`
        : this.figureSpec()
          ? undefined
          : 'bandage-figure reads a graph cut from a gbz-base track or a GFA url'
    },
    // The drawing as a standalone SVG, fitted, with its genes, its lifted
    // walks' keys, facet panels and the strip of walk rows; see figureSvg
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
            walkStrip: self.walkStripRows && {
              rows: self.walkStripRows,
              rowGenes: self.walkRowGenes,
              rowGeneGaps: self.walkRowGeneGaps,
            },
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
      return reference && !self.hostPlacesX ? rulerBoxes(reference) : undefined
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
        connectorAt(self.tubeMapConnectors, self.connectorZoneBottom, sx, sy) ??
        null
      )
    },
  }))
