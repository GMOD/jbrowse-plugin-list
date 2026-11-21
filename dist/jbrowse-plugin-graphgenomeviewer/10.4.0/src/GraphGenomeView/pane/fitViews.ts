import {
  FACET_GAP_PX,
  FACET_PAD_PX,
  facetCells,
  facetGrid,
} from '@jbrowse/bandage-core/facetGrid'
import { figureSvg } from '@jbrowse/bandage-core/figure'
import { rowLabelBox } from '@jbrowse/bandage-core/graphLabels'
import { keyColumnPx, keyHeightPx } from '@jbrowse/bandage-core/keyColumn'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import { FIT_PADDING } from '@jbrowse/bandage-core/layout/fitAssumptions'
import {
  barEnd,
  boxesGenes,
  rowPitch,
  walkRowReadoutAt,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import {
  walkRowLabels,
  walkRowsExtent,
} from '@jbrowse/bandage-core/layout/walkRowLayout'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import {
  cutScale,
  drawingBounds,
  fitTransform,
  followTransform,
  layoutExtent,
  referenceProfile,
  referenceReach,
  referenceScale,
  shownBounds,
} from '@jbrowse/bandage-core/pipeline'
import { REFERENCE_STRIP_ZONE_PX } from '@jbrowse/bandage-core/referenceStrip'
import { buildGeometry } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { layoutGeometryInputs } from '@jbrowse/bandage-core/renderer/geometryInputs'
import {
  drawnSegments,
  edgeOverruns,
  referenceSegments,
  scalesByWindow,
  windowTranslateY,
} from '@jbrowse/bandage-core/trackFit'
import {
  GENE_ROW_PX,
  tubeMapGeneRows,
} from '@jbrowse/bandage-core/tubeMap/genes'
import { contains, padded } from '@jbrowse/bandage-core/viewport'
import { walkPosition } from '@jbrowse/bandage-core/walkKey'

import { cutRuleOf, hostWindow, paneWindow } from '../host'
import { measureReadout } from '../readoutMeasure'
import { sectionHeadersPx, sectionPlacement } from '../walkRowGroups'
import { withHostViews } from './hostViews'
import { fadeEntering } from './morph'
import {
  MAX_CANVAS_HEIGHT,
  MIN_CANVAS_HEIGHT,
  MIN_FIT_TUBE_PX,
  PAPER,
  SELECT_BRIGHTEN,
  VIEWPORT_PANES_BUILT,
  dependOn,
  geometryPainted,
  paneViewportOf,
  sameAxis,
} from './paneBase'
import { trackedDpr } from '../trackedDpr'

import type { BuildView } from './paneBase'
import type { SubgraphRegion } from '../../GetSubgraph'
import type { FacetGrid, FacetSetting } from '@jbrowse/bandage-core/facetGrid'
import type {
  GeneGaps,
  RowPitch,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import type { Renderer } from '@jbrowse/bandage-core/renderer/types'
import type { TrackFit } from '@jbrowse/bandage-core/trackFit'
import type { Graph, LayoutResult } from '@jbrowse/bandage-core/types'
import type { LiftedWalk, WalkLift } from '@jbrowse/bandage-core/walkHighlight'

function heldLayoutOf(
  graph: Graph,
  layout: LayoutResult,
  region: SubgraphRegion | undefined,
) {
  const profile = referenceProfile(graph, layout.nodePositions)
  return {
    profile,
    bounds: region && shownBounds(graph, layout, region),
    segments: drawnSegments(graph, layout),
    reference: referenceSegments(profile),
  }
}

const landedLayouts = new WeakMap<
  LayoutResult,
  ReturnType<typeof heldLayoutOf>
>()

export function holdReference(
  graph: Graph,
  layout: LayoutResult,
  region: SubgraphRegion | undefined,
) {
  if (!landedLayouts.has(layout)) {
    landedLayouts.set(layout, heldLayoutOf(graph, layout, region))
  }
}

export const TOOLTIP_INSET_PX = 8
export const FACET_KEY_ROW_PX = 19
// the facet key line and the grid gap above it
export const FACET_KEY_PX = FACET_GAP_PX + FACET_KEY_ROW_PX
// a two-line tooltip and its inset
const TOOLTIP_ROOM_PX = 48

export function walkRowGeneKey(
  pitch: RowPitch | undefined,
  hasGenes: boolean,
  gaps: GeneGaps | undefined,
): GeneGaps | undefined {
  if (!pitch || !hasGenes) {
    return undefined
  }
  return boxesGenes(pitch.rowPx, pitch.barPx)
    ? gaps
    : { untracked: 0, unread: 0, ...gaps, crowded: true }
}

export const withFitViews = withHostViews
  .views(self => ({
    // `paneHeight` replaces the built-in ceiling rather than adding a second
    // clamp under it, and the floor still wins: a pane shorter than
    // MIN_CANVAS_HEIGHT leaves no room to hover a node and read its tooltip,
    // which is the reason that floor exists.
    get paneCeiling(): number {
      return Math.max(MIN_CANVAS_HEIGHT, self.paneHeight ?? MAX_CANVAS_HEIGHT)
    },
    // the height a fit fills: a track's own, or the pane's ceiling
    get fitRoom(): number {
      return self.host ? this.canvasHeight : this.paneCeiling
    },
    // Walk rows pack to fill the pane, as the strip does, so every walk of a
    // cohort is on screen; rows too thin to letter put their names and
    // readouts on hover
    get walkRowPitch(): RowPitch | undefined {
      const bars = self.walkRowBars
      if (!bars) {
        return undefined
      }
      return rowPitch(
        bars.rows.length + 1,
        this.fitRoom -
          this.fitPadTop -
          FIT_PADDING -
          sectionHeadersPx(self.walkRowGroups?.sections ?? []),
      )
    },
    // Where each walk row and section header sits at the rows' pitch
    get walkRowPlacement() {
      const pitch = this.walkRowPitch
      return pitch
        ? sectionPlacement(self.walkRowGroups?.sections ?? [], pitch.rowPx)
        : undefined
    },
    // What the walk-rows key says of genes: where they went unread, or one
    // note that rows this thin box none, as the walk strip's key says
    get walkRowGeneKey() {
      return walkRowGeneKey(
        this.walkRowPitch,
        !!self.walkRowGenes?.size,
        self.walkRowGeneGaps,
      )
    },
    // Walk rows label from the bars themselves, which follow the selected
    // repeat and sample filter that the layout, run once per cut, cannot
    get drawnRowLabels() {
      const place = this.walkRowPlacement
      const labels = walkRowLabels(
        self.walkRowBars,
        self.layoutResult,
        this.walkRowPitch,
      )
      return self.walkRowBars && place
        ? labels.map((l, i) => ({ ...l, y: place.rowY(i) }))
        : labels
    },
    // The row labels on the canvas, each at its pane px `top`. A row scrolled
    // out is dropped rather than clamped to the edge, so a label never points
    // at a row that is not there.
    get visibleRowLabels() {
      return this.drawnRowLabels.flatMap(({ label, y }) => {
        const top = self.toScreen({ x: 0, y }).y
        return top >= 0 && top <= this.canvasHeight ? [{ label, y, top }] : []
      })
    },
    // The row labels are pinned to the pane's left edge, so the fit starts
    // the drawing past the widest one.
    get fitPadLeft() {
      return this.drawnRowLabels.reduce(
        (pad, r) => Math.max(pad, rowLabelBox(r.label, 0).x1 + 6),
        FIT_PADDING,
      )
    },
    // Extent of the drawing in layout units, shared by the pane height and
    // zoomToFit. On a reference-bp layout x is the cut window rather than
    // how far the drawing reaches: an allele anchored far outside it is a
    // fact about the graph, not a reason to draw the window at 6% of the
    // frame. Walk rows reach as far as
    // the bars on screen, which a repeat pick or a sample filter narrows
    // after the layout ran.
    get layoutBounds() {
      const layout = self.layoutResult
      const bars = self.walkRowBars
      const rowsExtent =
        bars && layout?.extent
          ? walkRowsExtent(bars, this.walkRowPitch)
          : undefined
      return layout
        ? drawingBounds(layout, {
            region: self.graphRegion,
            extent: rowsExtent && {
              ...rowsExtent,
              maxY: rowsExtent.maxY + (this.walkRowPlacement?.headersPx ?? 0),
            },
          })
        : undefined
    },
    // The key's column down the pane's right edge. A faceted pane mounts no
    // key, so its last measured size is stale; a tube map of reads keys
    // marks that come and go with the fit's scale, so a column for them would
    // refit the drawing it is measured from.
    get keyColumnPx() {
      return self.facetPanels || self.tubeMapReads
        ? 0
        : keyColumnPx({ legendSize: this.framedLegendSize })
    },
    get framedLegendSize() {
      return self.keyFrame ?? self.legendSize
    },
    // How far the drawing, walk rows and their readouts reach: to the key's
    // column
    get drawingWidth() {
      return self.paneWidth - this.keyColumnPx
    },
    // The height that shows every row of the key, and the drawing's own
    // floor, which leaves room to hover a node and read its tooltip
    get canvasFloor() {
      return Math.max(
        MIN_CANVAS_HEIGHT,
        self.facetPanels
          ? 0
          : keyHeightPx({
              legendSize: this.framedLegendSize,
              referenceStripZonePx: self.referenceStripZonePx,
            }),
      )
    },
    // Row i's readout as the pane places it, measured as it is drawn
    walkRowReadoutOf(i: number) {
      const bars = self.walkRowBars
      return bars
        ? walkRowReadoutAt(
            bars,
            i,
            {
              scaleX: self.scaleX,
              translateX: self.translateX,
              width: this.drawingWidth,
              measure: measureReadout,
            },
            { comparing: self.rowVisitsNeeded },
          )
        : undefined
    },
    // A hovered row's label and its readout in full, while its rows are too
    // thin to draw readouts or where its own readout is drawn cut short
    get hoveredWalkRowText() {
      const i = self.walkRowList.findIndex(r => r.name === self.hoveredWalkRow)
      const row = self.walkRowList[i]
      const at = row ? this.walkRowReadoutOf(i) : undefined
      return row && at && (this.walkRowPitch?.readouts === false || at.cut)
        ? { label: row.label, readout: at.text }
        : undefined
    },
    // The walk row under a pane point, as its index among the reference row
    // and the rows below it, where the point is on its bar or, for a readout
    // drawn cut, between the bar's end and the readout's
    walkRowAt(screenX: number, screenY: number) {
      const bars = self.walkRowBars
      const pitch = this.walkRowPitch
      const place = this.walkRowPlacement
      if (!bars || !pitch || !place) {
        return undefined
      }
      const i = place.rowAt(
        (screenY - self.translateY) / self.scaleY,
        bars.rows.length + 1,
      )
      const row = self.walkRowList[i]
      const y = place.rowY(i) * self.scaleY + self.translateY
      const bp = (screenX - self.translateX) / self.scaleX - bars.origin
      const at = row && pitch.readouts ? this.walkRowReadoutOf(i) : undefined
      const endX = row
        ? (bars.origin + barEnd(row)) * self.scaleX + self.translateX
        : 0
      const overCut =
        !!at?.cut &&
        screenX >= endX &&
        screenX <= at.x + measureReadout(at.shown)
      return row &&
        Math.abs(screenY - y) <= pitch.barPx / 2 + 2 &&
        ((bp >= 0 && bp <= barEnd(row)) || overCut)
        ? i
        : undefined
    },
    // Room over a tube map for the rows its genes need, one inside the
    // padding and one more for each further gene that overlaps it, and
    // room for the reference strip. The key has a column of its own beside
    // the drawing, so it takes no room above.
    get fitPadTop() {
      const rows = tubeMapGeneRows(self.tubeMapGenes)
      return (
        FIT_PADDING +
        Math.max(0, rows - 1) * GENE_ROW_PX +
        self.referenceStripZonePx
      )
    },
    // The pane a force layout is sized for, the one the fit maps it into:
    // the width to the key's column, and the height the fit fills less the
    // reference strip a linear view draws over it, which shows only once the
    // layout lands
    get layoutFit() {
      return {
        width: this.drawingWidth,
        height:
          this.fitRoom -
          (self.host?.initialized && self.showReferenceStrip
            ? REFERENCE_STRIP_ZONE_PX
            : 0),
      }
    },
    // A tube map on its own axis reads by panning along it, as in
    // sequenceTubeMap. Rather than shrink a long cut to a strip, the fit
    // stops where its tubes are MIN_FIT_TUBE_PX wide, or at whatever fits
    // the tallest pane, with the cut's left end on screen.
    get minFitScale() {
      const bounds = this.layoutBounds
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
      const { field, sort, columns } = self.facetSetting
      return field === ''
        ? undefined
        : sort.length === 0 && columns === undefined
          ? field
          : {
              field,
              sort: [...sort],
              ...(columns === undefined ? {} : { columns }),
            }
    },
    // Which grid cell each panel takes; see facetCells
    get facetPlacement() {
      const panels = self.facetPanels
      const { field, sort } = self.facetSetting
      return panels
        ? facetCells(
            panels.map(p => p.walks[0]!.name),
            self.hostPlacesX || field === '' ? 'walk' : field,
            sort,
          )
        : undefined
    },
    // How the facet panels tile the pane in `room` px. A track whose x the
    // linear view places stacks full-width panels so each keeps that x.
    facetGridIn(room: number): FacetGrid | undefined {
      const place = this.facetPlacement
      const bounds = this.layoutBounds
      return place && bounds && bounds.w > 0
        ? facetGrid({
            count: place.count,
            bounds,
            pixelRows: self.pixelRows,
            width: self.paneWidth,
            room,
            columns: self.hostPlacesX
              ? 1
              : (place.columns ?? self.facetSetting.columns),
          })
        : undefined
    },
    // the facet grid's room leaves the key line under it
    get facetGrid() {
      return this.facetGridIn(this.fitRoom - FACET_KEY_PX)
    },
    // The pane is as tall as the drawing, rather than a fixed box the drawing
    // floats in. A row layout's rows are px, so its height is a sum; an
    // isotropic layout has no height of its own and takes its aspect ratio
    // at the width's fit. Neither reads `scale`, so the fit reads this
    // without feeding back into it.
    get canvasHeight(): number {
      const bounds = this.layoutBounds
      const ceiling = this.paneCeiling
      if (!bounds) {
        return ceiling
      }
      const grid = this.facetGrid
      if (grid) {
        return Math.max(MIN_CANVAS_HEIGHT, grid.total + FACET_KEY_PX)
      }
      const floor = this.canvasFloor
      const pads = this.fitPads
      const padsY = pads.top + pads.bottom
      if (self.pixelRows) {
        return Math.min(ceiling, Math.max(floor, bounds.h + padsY))
      }
      const usableWidth =
        self.paneWidth - this.keyColumnPx - pads.left - pads.right
      return bounds.w > 0 && usableWidth > 0
        ? Math.min(
            ceiling,
            Math.max(
              floor,
              bounds.h * Math.max(usableWidth / bounds.w, this.minFitScale) +
                padsY,
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
    // The fit's margins: a facet panel's all round, else room for the row
    // labels, and the genes and strip above
    get fitPads() {
      return this.facetGrid
        ? {
            left: FACET_PAD_PX,
            top: FACET_PAD_PX,
            right: FACET_PAD_PX,
            bottom: FACET_PAD_PX,
          }
        : {
            left: this.fitPadLeft,
            top: this.fitPadTop,
            right: FIT_PADDING,
            bottom: FIT_PADDING,
          }
    },
    // the view box's height inside the fit's margins
    get usableHeight() {
      const { top, bottom } = this.fitPads
      return this.viewBox.height - top - bottom
    },
    // A flipped view runs bp right to left, which a held cut's slide does not
    get snapsHostCut() {
      const { host, graphRegion } = self
      const seen = host && hostWindow(host)
      return (
        !!host &&
        cutRuleOf(self.chosenLayoutMode) === 'snapped' &&
        !host.dynamicBlocks.contentBlocks.some(
          b =>
            b.reversed &&
            (b.refName === graphRegion?.refName || b.refName === seen?.refName),
        )
      )
    },
    get followsWindow() {
      const layout = self.layoutResult
      return (
        this.snapsHostCut &&
        self.drawnLayoutMode === 'force' &&
        !!layout &&
        !layout.referenceAxis &&
        !layout.pixelRows &&
        !layout.tubeMap &&
        !self.facetPanels
      )
    },
    // How a drawing the window places meets the pane's height (core's
    // trackFit). A pane of its own fits the whole cut; a track says.
    get trackFit(): TrackFit {
      return 'fit'
    },
    // The height a drawing at the window's scale keeps the window's reference
    // inside: the pane's own, or the most a track grows to
    get referenceRoom(): number {
      return this.canvasHeight
    },
    get heldLayout() {
      const { graph, layoutResult, graphRegion } = self
      return graph && layoutResult && this.followsWindow
        ? (landedLayouts.get(layoutResult) ??
            heldLayoutOf(graph, layoutResult, graphRegion))
        : undefined
    },
    get heldReference() {
      return this.heldLayout?.profile
    },
    get heldBounds() {
      return this.heldLayout?.bounds ?? this.layoutBounds
    },
    // fitPads where no facet grid tiles the pane, which a followed window
    // never has, read without the grid so a track grown to the drawing does
    // not read its own height
    get followPads() {
      return {
        padLeft: this.fitPadLeft,
        padTop: this.fitPadTop,
        padRight: FIT_PADDING,
        padBottom: FIT_PADDING,
      }
    },
    get heldWindow() {
      const { host } = self
      return host && this.followsWindow ? hostWindow(host) : undefined
    },
    get viewSpan() {
      return this.heldWindow?.span
    },
    get heldScale() {
      const pieces = this.heldReference
      const region = self.graphRegion
      const bounds = this.heldBounds
      const span = this.viewSpan
      return pieces && region && bounds && span
        ? scalesByWindow(this.trackFit)
          ? referenceScale(
              pieces,
              region,
              span,
              this.drawingWidth,
              this.referenceRoom,
              this.followPads,
            )
          : cutScale(
              pieces,
              region,
              span,
              bounds,
              this.drawingWidth,
              this.canvasHeight,
              this.followPads,
            )
        : undefined
    },
    // a window on another sequence puts the held cut past the pane's edge,
    // and a view past its sequence's end lays its bp there as the ruler does
    get windowTransform() {
      const { graphRegion, layoutResult, host } = self
      const seen = this.heldWindow
      const ruler = seen && host ? paneWindow(host) : undefined
      const pieces = this.heldReference
      const scale = this.heldScale
      const bounds = this.heldBounds
      const held = this.heldLayout
      const followed =
        seen && ruler && pieces && scale !== undefined && bounds
          ? followTransform(
              pieces,
              ruler,
              scale,
              bounds,
              this.drawingWidth,
              this.canvasHeight,
              this.followPads,
            )
          : undefined
      const placed =
        seen && followed && held && bounds && scalesByWindow(this.trackFit)
          ? {
              ...followed,
              translateY: windowTranslateY({
                segments: held.segments,
                reference: held.reference,
                held: referenceReach(held.profile, seen),
                scale: followed.scale,
                translateX: followed.translateX,
                bounds,
                paneWidth: this.drawingWidth,
                paneHeight: this.canvasHeight,
                pads: this.followPads,
              }),
            }
          : followed
      return placed &&
        layoutResult &&
        (graphRegion?.refName !== seen?.refName ||
          graphRegion?.assemblyName !== seen?.assemblyName)
        ? {
            ...placed,
            translateX:
              self.paneWidth +
              this.drawingWidth -
              placed.scale * layoutExtent(layoutResult.nodePositions).minX,
          }
        : placed
    },
    // Where the drawing runs past the pane's top, under the reference
    // strip, or its bottom, for a drawing the window places
    get edgeMarks() {
      const held = this.followsWindow ? this.heldLayout : undefined
      return held
        ? edgeOverruns(
            held.segments,
            {
              scale: self.scale,
              translateX: self.translateX,
              translateY: self.translateY,
            },
            this.drawingWidth,
            { top: self.referenceStripZonePx, bottom: this.canvasHeight },
          )
        : undefined
    },
    get runsPastEdge() {
      const marks = this.edgeMarks
      return !!marks && marks.top.length + marks.bottom.length > 0
    },
    get drawingClip() {
      return this.followsWindow
        ? `inset(0px ${self.paneWidth - this.drawingWidth}px 0px 0px)`
        : undefined
    },
    // Where the fit puts the drawing, beside the key, or undefined until
    // there is a layout and a measured canvas to fit it into
    get fittedTransform() {
      const bounds = this.layoutBounds
      const grid = this.facetGrid
      const { width, height } = grid ?? {
        width: this.drawingWidth,
        height: this.canvasHeight,
      }
      const pads = this.fitPads
      return (
        this.windowTransform ??
        (bounds
          ? fitTransform(bounds, width, height, self.pixelRows, {
              minScale: this.facetGrid ? 0 : this.minFitScale,
              padLeft: pads.left,
              padTop: pads.top,
              padRight: pads.right,
              padBottom: pads.bottom,
            })
          : undefined)
      )
    },
  }))
  .views(self => ({
    // The hover tooltip's distance from the pane's right edge: in the corner,
    // unless the key reaches down into its room, and then beside the key. A
    // faceted pane mounts no key, so its last measured size is stale.
    get tooltipRightPx() {
      return !self.facetPanels &&
        self.legendSize.width > 0 &&
        keyHeightPx(self) - LEGEND_INSET_PX >
          self.canvasHeight - TOOLTIP_ROOM_PX
        ? keyColumnPx(self)
        : TOOLTIP_INSET_PX
    },
  }))
  .views(self => ({
    // The zoom and the window the transform shows plus a pane of overscan
    // all round, which a pan inside needs no rebuild for
    get liveBuildView(): BuildView {
      return {
        axis: self.axisScale,
        bounds: padded(paneViewportOf(self), VIEWPORT_PANES_BUILT),
      }
    },
    // Whether the window settled on this layout still holds the zoom and
    // the window the pane shows
    get buildViewSettled() {
      const settled = self.settledBuildView
      return (
        settled !== undefined &&
        settled.layout === self.layoutResult &&
        sameAxis(settled.view.axis, self.axisScale) &&
        contains(settled.view.bounds, paneViewportOf(self))
      )
    },
  }))
  .views(self => ({
    // What the drawing is built for: the window last settled (afterAttach),
    // so a gesture rebuilds nothing until it ends, and the pane's view as it
    // is until one is
    get buildView() {
      return self.settledBuildView?.view ?? self.liveBuildView
    },
  }))
  .views(self => ({
    get geometryPainted() {
      return geometryPainted(self)
    },
    get paintSuperseded() {
      return !this.geometryPainted
    },
    // The app-wide readiness contract (AppReadyMarker, @jbrowse/capture)
    // reads this: a declared source still fetching, or a graph whose
    // settled geometry is not on the canvas yet.
    get showLoading() {
      return (
        self.error === undefined &&
        (self.isLoading ||
          self.hasPendingSource ||
          (self.graph !== undefined && !this.geometryPainted))
      )
    },
  }))
  .views(self => ({
    // The selection as a draw-time colour override, keyed by node so it
    // survives a rebuild renumbering the batch, and none while the drawing
    // folds it. The hover is paintHover's, on a layer of its own.
    applySelection(b: Renderer) {
      const id = self.selectedNode
      b.setNodeHighlights(
        id === null || self.folded.has(id)
          ? new Map()
          : new Map([[id, SELECT_BRIGHTEN]]),
      )
    },
    // the hovered node, unless the selection already lights it
    get hoverLayerNode() {
      const { litNode, selectedNode } = self
      return litNode === selectedNode ? null : litNode
    },
    // getDpr(), never a bare `devicePixelRatio`: it is capped at MAX_DPR so
    // this canvas costs what every other canvas in the app costs on a 3x
    // display, and it is the same read `syncCanvasSize` sizes the backing
    // store with. Tracked, so a new ratio repaints rather than leaving the
    // geometry at a different scale from the canvas under it.
    get paintTransform() {
      const dpr = trackedDpr()
      return {
        scaleX: self.scaleX * dpr,
        scaleY: self.scaleY * dpr,
        translateX: self.translateX * dpr,
        translateY: self.translateY * dpr,
        // the thicknesses in the vertex buffer are css px, expanded after
        // this transform, so they need the same ratio
        dpr,
      }
    },
  }))
  .views(self => ({
    // Draws the uploaded batch through the pane's transform
    paint(b: Renderer) {
      b.updateTransform(self.paintTransform)
      // Clear under a reference strip: GraphCanvas lays the paper below the
      // strip, so the linear view's gridlines show through between its blocks
      b.render(self.referenceStripShown ? [0, 0, 0, 0] : PAPER)
    },
  }))
  .views(self => ({
    // The drawing's batch with `highlight`'s walks lifted, for `view`. A
    // caller's autorun rebuilds it when that window moves, when a drag moves
    // the positions, and when any display option read here changes.
    buildDrawing(
      highlight: WalkLift | undefined,
      drawPaths: boolean,
      view = self.buildView,
    ) {
      const { graph, nodeById, layoutResult, deletionDrawing } = self
      if (!graph || !nodeById || !layoutResult || !deletionDrawing) {
        return undefined
      }
      dependOn(self.positionsVersion)
      const batch = buildGeometry({
        // walk rows' overlay draws every bar, the reference's among them;
        // its nodes stay in the hit index, so hovering the bar finds them
        ...layoutGeometryInputs(layoutResult, deletionDrawing, {
          drawsRows: !!self.walkRowBars,
        }),
        graph,
        nodeById,
        colorScheme: self.effectiveColorScheme,
        contigThickness: self.contigThickness,
        connectorThickness: self.connectorThickness,
        drawPaths,
        nodeWidth: self.nodeWidth,
        edgeWidth: self.linkWidth,
        highlight,
        axis: view.axis,
        linearLayout: self.linearLayout,
        viewportBounds: view.bounds,
        // Held against the graph rather than derived here, the same way the
        // deletion drawing is and for the same reason — see `drawnReferenceRamp`.
        referenceRamp: self.referenceRamp,
        // passed so the shared edge-curve cache can tell a drag from a pan
        version: self.positionsVersion,
        smallSites: self.smallSites,
      })
      const entering = self.morphEntering
      if (entering?.layout === layoutResult) {
        fadeEntering(batch, graph.edges, entering)
      }
      return { batch, view }
    },
    // Each facet panel's drawing, which the panel paints and the key reads
    get facetDrawings() {
      return self.facetPanels?.map(panel => this.buildDrawing(panel, false))
    },
    // where the hovered node sits on a lifted walk, while one is hovered
    hoveredOn(walk: LiftedWalk) {
      const id = self.hoveredNode
      const node = id ? self.nodeById?.get(id) : undefined
      return node
        ? (walkPosition(walk, node.id, node.length) ?? 'not on this walk')
        : undefined
    },
    // Why the drawing cannot be written as SVG, which draws the canvas's
    // nodes, or walk rows' bars
    get figureUnavailable() {
      return !self.layoutResult
        ? 'Nothing is drawn yet'
        : self.walkRowGroups
          ? 'The SVG export cannot group walk rows yet: set Group by... to None first'
          : self.drawsNodes || self.walkRowBars
            ? undefined
            : `${layoutModeByValue(self.chosenLayoutMode).label} draws a picture of its own, which the SVG export does not`
    },
    // The drawing as a standalone SVG with its genes, its lifted walks' keys,
    // facet panels and the strip of walk rows; see figureSvg. A track's is
    // the scene its pane shows: the drawing beside the key at the track's
    // height, framed as the screen frames it. A view's own pane fits it.
    figure() {
      const { graph, layoutResult } = self
      const framed = !!self.host && !self.facetGrid
      return graph && layoutResult && !this.figureUnavailable
        ? figureSvg(graph, layoutResult, {
            width: framed ? self.drawingWidth : self.paneWidth,
            height: framed ? self.canvasHeight : self.paneCeiling,
            frame: framed ? self.screenTransform : undefined,
            walks: self.walkLayers,
            facet: self.facetSpec,
            colorScheme: self.effectiveColorScheme,
            nodeWidth: self.nodeWidth,
            edgeWidth: self.linkWidth,
            showDeletionEdges: self.showDeletionEdges,
            smallSites: self.smallSites,
            linearLayout: self.linearLayout,
            contigThickness: self.contigThickness,
            connectorThickness: self.connectorThickness,
            region: self.graphRegion,
            colorDomain: self.statedColorDomain,
            genes: self.showGenes
              ? [...(self.backboneGenes ?? []), ...(self.ownGeneFeatures ?? [])]
              : undefined,
            walkRows: self.walkRowBars,
            walkRowPitch: self.walkRowPitch,
            rowGenes: self.walkRowGenes,
            rowGeneGaps: self.walkRowGeneGaps,
            rowAnnotation: self.walkRowAnnotation,
            walkStrip: self.walkStripRows && {
              rows: self.walkStripRows,
              rowGenes: self.walkRowGenes,
              rowGeneGaps: self.walkRowGeneGaps,
            },
          })
        : undefined
    },
  }))
  .views(self => ({
    // A drawing in its own coordinates that still follows the linear view's
    // pan and zoom as a stretched picture until the re-cut lands. The view
    // drives it, so a horizontal drag or a zoom over it is the view's.
    get followsHostView() {
      const layout = self.layoutResult
      return (
        !!self.host &&
        !self.hostPlacesX &&
        !!layout &&
        !layout.referenceAxis &&
        !layout.pixelRows &&
        !layout.tubeMap &&
        !self.facetGrid
      )
    },
  }))
