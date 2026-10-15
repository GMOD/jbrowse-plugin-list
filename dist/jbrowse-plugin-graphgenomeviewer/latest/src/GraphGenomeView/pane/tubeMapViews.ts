import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import { referenceBoxes, rulerBoxes } from '@jbrowse/bandage-core/tubeMap/axis'
import {
  connectorAt,
  drawLitConnector,
  tubeMapConnectors,
} from '@jbrowse/bandage-core/tubeMap/connectors'
import { deviationMarks } from '@jbrowse/bandage-core/tubeMap/deviations'
import {
  drawTubeMapHighlight,
  mismatchOnScreen,
  mismatchesLegible,
  tubeMapMismatchAt,
  tubeMapPicture,
  tubeMapTrackAt,
} from '@jbrowse/bandage-core/tubeMap/draw'
import {
  tubeMapFrame,
  tubeMapNodeAt,
} from '@jbrowse/bandage-core/tubeMap/frame'
import { tubeMapNodeColors } from '@jbrowse/bandage-core/tubeMap/nodeColors'
import { computed } from 'mobx'

import {
  NO_VALUE_TUBE,
  PANEL_GAP,
  PANEL_TUBE,
  TINTED_TUBES,
  boxOf,
  memberAt,
  paintPanelHover,
  walksThrough,
} from '../tubeMapPanels'
import { withFitViews } from './fitViews'
import { HOVER_BRIGHTEN } from './paneBase'
import { trackedDpr } from '../trackedDpr'

import type { HoveredTube } from './paneBase'
import type { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import type { RenderBatch } from '@jbrowse/bandage-core/renderer/types'
import type { TubeMapPicture } from '@jbrowse/bandage-core/tubeMap/draw'
import type { TubeMapTransform } from '@jbrowse/bandage-core/tubeMap/frame'
import type { TubeMapMismatch } from '@jbrowse/bandage-core/tubeMap/mismatches'

const MAX_SHOWN_BASES = 20
// a squeezed stack of panels thins no further, as one tube map does
const MIN_PANEL_Y_SCALE = 0.05

const MAX_LISTED = 6

function listed(names: string[]) {
  const more = names.length - MAX_LISTED
  return more > 0
    ? `${names.slice(0, MAX_LISTED).join(', ')} and ${more} more`
    : names.join(', ')
}

function mismatchText(m: TubeMapMismatch) {
  if (m.kind === 'deletion') {
    return `deletion of ${formatBp(m.length)}`
  }
  if (m.kind === 'substitution') {
    return `substitution ${m.seq}`
  }
  const seq = m.seq ?? ''
  const shown =
    seq.length > MAX_SHOWN_BASES ? `${seq.slice(0, MAX_SHOWN_BASES)}…` : seq
  return `insertion of ${formatBp(seq.length)} ${shown}`.trim()
}

// Which kinds of read mark are on screen, stopping once all three are found
function mismatchKindsShown(
  picture: TubeMapPicture | undefined,
  frame: TubeMapTransform | undefined,
  width: number,
) {
  const kinds = { substitution: false, insertion: false, deletion: false }
  if (picture && frame && mismatchesLegible(frame.yScale)) {
    let missing = 3
    for (const m of picture.mismatches) {
      if (!kinds[m.kind] && mismatchOnScreen(m, { x: frame.x, width })) {
        kinds[m.kind] = true
        if (--missing === 0) {
          break
        }
      }
    }
  }
  return kinds
}

export const withTubeMapViews = withFitViews
  .views(self => ({
    get tubeMapFrame() {
      const drawing = self.layoutResult?.tubeMap
      return drawing
        ? tubeMapFrame(drawing, {
            ...self.screenTransform,
            usableHeight: self.usableHeight,
          })
        : undefined
    },
    // the reference ruler under the tubes, unless the linear view's ruler
    // is already the axis
    get tubeMapRulerBoxes() {
      const reference = self.tubeMapReference
      return reference && !self.hostPlacesX && !self.layoutResult?.tubeMapPanels
        ? rulerBoxes(reference)
        : undefined
    },
    // Split on the reference axis, the panels share x, so one ruler under
    // the last reads for them all; on the own axis each panel has its own
    get tubeMapPanelRulerBoxes() {
      const { layoutResult } = self
      const last = layoutResult?.tubeMapPanels?.at(-1)
      return last && layoutResult?.referenceAxis && !self.hostPlacesX
        ? rulerBoxes(referenceBoxes(last.result.tubeMap))
        : undefined
    },
    // The connectors run from the top of the pane down to the tubes' top
    get connectorZoneBottom() {
      const picture = self.tubeMapPicture
      const frame = this.tubeMapFrame
      return picture && frame ? frame.y(picture.bounds.minY) - 2 : 0
    },
    // The bands' tops follow every frame of a pan in the linear view and
    // their bottoms every pan of the tubes
    get tubeMapConnectors() {
      const boxes = self.tubeMapConnectedBoxes
      const frame = this.tubeMapFrame
      const bp = boxes && frame ? self.hostBpFrame : undefined
      return boxes && frame && bp
        ? tubeMapConnectors(
            boxes,
            b => b * bp.scale + bp.translateX,
            frame.x,
            self.paneWidth,
          )
        : []
    },
    // What each panel of a split tube map draws, which no pan or hover
    // changes: its picture, its tubes, its boxes' tints and its folded
    // variants
    get tubeMapPanelPictures() {
      const panels = self.layoutResult?.tubeMapPanels
      if (!panels) {
        return undefined
      }
      const { field } = self.facetSetting
      return panels.map(panel => {
        const drawing = panel.result.tubeMap
        const { graph, coarse } = drawing
        return {
          panel,
          label:
            panel.label ??
            (field === 'walk' ? self.walkLabel(panel.paths[0]!) : panel.key),
          picture: tubeMapPicture(drawing),
          tubeColors: self.tubeColorsOf(graph, drawing.pathColors),
          nodeColors: self.tubeMapNodeColors
            ? tubeMapNodeColors(
                graph,
                self.effectiveColorScheme,
                self.referenceRamp,
              )
            : undefined,
          deviations: coarse ? deviationMarks(drawing, coarse.deviations) : [],
        }
      })
    },
  }))
  .views(self => ({
    // The node the pointer is on: inside a merged run, the member at the
    // pointer's bp, so a run spanning the window counts what is under it
    get hoveredMember() {
      const id = self.hoveredNode
      const members =
        id === null ? undefined : self.hoverDrawing?.members.get(id)
      if (!members) {
        return id
      }
      const at = self.hoveredAt
      const i = self.hoveredPanel
      const under = i === null ? undefined : this.tubeMapPanelViews?.[i]
      // sparse, so forEach, which skips its holes, as tubeMapNodeAt does
      let box: { x: number; pixelWidth: number } | undefined
      under?.panel.result.tubeMap.layout.nodes.forEach(n => {
        if (n.name === id) {
          box = n
        }
      })
      const member =
        at && under && box
          ? memberAt(
              members,
              m => self.nodeSpan(m),
              under.frame.x(box.x),
              under.frame.x(box.x + box.pixelWidth),
              at.x,
            )
          : undefined
      return member ?? members[0]
    },
    // For the hovered box, the box each panel draws it in and how many of
    // that panel's haplotypes pass through it: a frequency per group
    get tubeMapPanelHover() {
      const id = self.hoveredNode
      const pictures = self.tubeMapPanelPictures
      if (id === null || !pictures) {
        return undefined
      }
      const node = this.hoveredMember ?? id
      return pictures.map(({ panel }) => {
        const drawing = panel.result.tubeMap
        const box = boxOf(drawing, node)
        return box ? { box, ...walksThrough(drawing.graph, box) } : undefined
      })
    },
    // apart from the pictures, so a lane row's hover redraws no panel
    get tubeMapPanelTubeColors() {
      return self.tubeMapPanelPictures?.map(({ panel, tubeColors }) => {
        const { graph } = panel.result.tubeMap
        return self.fadeUnhovered(
          tubeColors,
          graph.paths ?? [],
          graph.referencePath,
        )
      })
    },
    // Each panel through the pane's transform at its place down the stack.
    // On the reference axis the stack squeezes into the pane as one map does.
    get tubeMapPanelViews() {
      const pictures = self.tubeMapPanelPictures
      const tubeColors = this.tubeMapPanelTubeColors
      const layout = self.layoutResult
      if (!pictures || !tubeColors || !layout) {
        return undefined
      }
      // the titles keep their px and the drawings squeeze into the rest
      const titles = pictures.length * PANEL_GAP
      const drawings = pictures.reduce((h, p) => h + p.panel.height, 0)
      const usable = self.usableHeight - titles
      const yScale =
        self.scaleY *
        (layout.referenceAxis && drawings > 0
          ? Math.max(MIN_PANEL_Y_SCALE, Math.min(1, usable / drawings))
          : 1)
      let y = self.translateY
      return pictures.map((p, i) => {
        const { panel } = p
        const minY = panel.result.extent?.minY ?? 0
        const titleTop = y
        const top = titleTop + PANEL_GAP
        y = top + panel.height * yScale
        return {
          ...p,
          tubeColors: tubeColors[i]!,
          frame: tubeMapFrame(panel.result.tubeMap, {
            scaleX: self.scaleX,
            translateX: self.translateX,
            scaleY: yScale,
            translateY: top - minY * yScale,
            usableHeight: Infinity,
          }),
          titleTop,
          top,
          bottom: y,
        }
      })
    },
    // the panel a pane y falls in, its title's gap included
    tubeMapPanelAt(sy: number) {
      const i =
        this.tubeMapPanelViews?.findIndex(
          v => v.titleTop <= sy && sy <= v.bottom,
        ) ?? -1
      return i < 0 ? null : i
    },
  }))
  .views(self => ({
    // The hover alone, onto a transparent canvas over the drawing, so a
    // pointer move repaints what it lights rather than every stroke under
    // it. `batch` is what the canvas below holds.
    paintHover(r: Canvas2DRenderer, batch: RenderBatch) {
      const picture = self.tubeMapPicture
      const frame = self.tubeMapFrame
      const node = self.hoverLayerNode
      if (picture && frame) {
        const { ctx, canvas } = r
        const dpr = trackedDpr(self.paneWidth, self.canvasHeight)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        const panels = self.tubeMapPanelViews
        if (panels) {
          paintPanelHover(ctx, panels, self.tubeMapPanelHover, {
            width: self.paneWidth,
            lit: node !== null,
          })
        } else {
          drawTubeMapHighlight(ctx, picture, {
            ...frame,
            width: self.paneWidth,
            highlightNode: node,
          })
        }
        drawLitConnector(
          ctx,
          self.tubeMapConnectors,
          self.connectorZoneBottom,
          node,
        )
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      } else {
        r.uploadGeometry(batch)
        r.setNodeHighlights(
          node === null ? new Map() : new Map([[node, HOVER_BRIGHTEN]]),
        )
        r.setEdgeHighlight(self.hoveredEdge, HOVER_BRIGHTEN)
        r.updateTransform(self.paintTransform)
        r.renderHighlights()
      }
    },
  }))
  .views(self => {
    // Compared by value: the marks in view are read off the transform, and
    // the legend should redraw when a kind comes or goes, not every pan frame
    const keys = computed(
      () => {
        const layout = self.layoutResult
        const split = layout?.tubeMapPanels !== undefined
        const reads = split ? [] : (layout?.tubeMap?.layout.reads ?? [])
        const paths = self.drawnGraph?.paths ?? []
        const coloring = self.tubeMapColoring
        const kind = self.tubeColorKind
        return {
          bundled: paths.some(p => p.members),
          // tubes in a column's hues, keyed value by value
          values:
            kind === 'value' && coloring
              ? [
                  ...[...coloring.palette].map(([value, color]) => ({
                    value,
                    color,
                  })),
                  ...(coloring.unvalued
                    ? [
                        {
                          value: `${coloring.field}: none`,
                          color: NO_VALUE_TUBE,
                        },
                      ]
                    : []),
                ]
              : undefined,
          // tubes coloured reference and haplotype rather than per walk
          roles: kind === 'role' || kind === 'tinted',
          haplotypeTube: kind === 'tinted' ? TINTED_TUBES[0]! : PANEL_TUBE,
          logWidths: layout?.tubeMap !== undefined && !layout.referenceAxis,
          foldBp:
            self.tubeMapDeviations.length > 0 ? self.tubeMapFold : undefined,
          forwardReads: reads.some(r => !r.is_reverse),
          reverseReads: reads.some(r => r.is_reverse),
          ...mismatchKindsShown(
            split ? undefined : self.tubeMapPicture,
            self.tubeMapFrame,
            self.paneWidth,
          ),
        }
      },
      { equals: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    )
    return {
      // What the tube map's legend has to explain: that on the own axis a
      // box is as wide as the log of its length, the fold its walks' ticks
      // stand for, the reads' strands, and the marks on the reads in view
      get tubeMapKeys() {
        return keys.get()
      },
    }
  })
  .views(self => ({
    // The drawing under a pane y: its panel's while the map is split
    tubeMapUnder(sy: number) {
      const views = self.tubeMapPanelViews
      if (views) {
        const i = self.tubeMapPanelAt(sy)
        const v = i === null ? undefined : views[i]
        return v && { drawing: v.panel.result.tubeMap, ...v }
      }
      const drawing = self.layoutResult?.tubeMap
      const picture = self.tubeMapPicture
      const frame = self.tubeMapFrame
      return drawing && picture && frame
        ? { drawing, picture, frame }
        : undefined
    },
    tubeMapNodeAt(sx: number, sy: number) {
      const under = this.tubeMapUnder(sy)
      return (
        (under ? tubeMapNodeAt(under.drawing, under.frame, sx, sy) : null) ??
        connectorAt(self.tubeMapConnectors, self.connectorZoneBottom, sx, sy) ??
        null
      )
    },
    // The tube under a pane point, and the mismatch mark on it if any
    tubeAt(sx: number, sy: number): HoveredTube | null {
      const under = this.tubeMapUnder(sy)
      if (!under) {
        return null
      }
      const { picture, frame } = under
      const mismatch = tubeMapMismatchAt(picture, frame, sx, sy)
      const track = mismatch?.readId ?? tubeMapTrackAt(picture, frame, sx, sy)
      return track === undefined ? null : { track, mismatch }
    },
    // A tube names its haplotype; a read its MAPQ and strand, and the
    // mismatch under the pointer
    get hoveredTubeText() {
      const tube = self.hoveredTube
      const layout = self.layoutResult?.tubeMap?.layout
      const read = tube && layout?.reads.find(r => r.id === tube.track)
      if (tube && read) {
        const mapq = read.mapping_quality
        return {
          label: read.name ?? 'read',
          readout: [
            `MAPQ ${mapq ?? 'unknown'}`,
            `${read.is_reverse ? 'reverse' : 'forward'} strand`,
            ...(tube.mismatch ? [mismatchText(tube.mismatch)] : []),
          ].join(', '),
        }
      }
      const path = tube ? self.hoverGraph?.paths?.[tube.track] : undefined
      const members = path?.members
      return members
        ? {
            label: `${members.length} haplotypes`,
            readout: `one route: ${listed(members.map(m => self.walkLabel(m)))}`,
          }
        : path
          ? { label: self.walkLabel(path.name), readout: 'haplotype' }
          : undefined
    },
  }))
