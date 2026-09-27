import {
  nodeLabelBudget,
  placeSizeLabels,
  rowLabelBox,
  sizeLabelCandidates,
} from './graphLabels'
import {
  LABEL_CHAR_PX,
  LABEL_PAD,
  LABEL_PX,
  labelWidth,
  occupancy,
  placeLabels,
} from './overlayLabels'

import type { BubbleHalo, RouteLabel } from './bubbles/bubbleHalos'
import type { BubbleKind } from './bubbles/classifyBubble'
import type { DeletionEdge } from './deletionEdges'
import type { GenePin } from './genes/genePins'
import type { GraphLabel } from './graphLabels'
import type { Box, PlacedLabel } from './overlayLabels'
import type { AlleleDeletion, NodeSegment } from './types'
import type { AxisScale } from './util/geometry'
import type { MinigraphBubble } from '../MinigraphBubbleAdapter/bubbleLine'

export const HALO_FACTOR = 3.4
export const LEGEND_INSET_PX = 6
// routes whose own stretches are drawn on top of each other stack their chips
const ROUTE_STACK = 8
const GENE_PIN_DROP_PX = 18
// the variant map's names stack in rows above its reference line, keeping
// this much of the line's height for the glyphs
const GLYPH_ROOM_PX = 60
const MAX_GLYPH_LABEL_ROWS = 8
// a chip's baseline this far down is the highest it sits whole in the pane
const TOPMOST_BASELINE = LABEL_PX + LABEL_PAD

export interface BubbleGlyph {
  bubble: MinigraphBubble
  kind: BubbleKind
  label: string
}

export interface LabelLayoutSource {
  paneWidth: number
  canvasHeight: number
  axisScale: AxisScale
  translateX: number
  translateY: number
  contigThickness: number
  legendSize: { width: number; height: number }
  drawnRowLabels: { label: string; y: number }[]
  bubbleHalos: BubbleHalo[]
  bubbleGlyphs: BubbleGlyph[]
  genePins: GenePin[]
  poppedFrom?: { label: string }
  nodePositions?: Record<string, NodeSegment[]>
  // false where the drawing is not the canvas's nodes (the tube map), so a
  // length label would sit on a box's tubes rather than beside a node
  labelsNodeSizes: boolean
  nodeLengths: Map<string, number>
  showDeletionEdges: boolean
  deletions: DeletionEdge[]
  alleleDeletions: AlleleDeletion[]
  positionsVersion: number
}

export interface LabelLayout {
  bubbles: PlacedLabel<BubbleHalo>[]
  // x of the glyph each name leads back to
  glyphs: PlacedLabel<{ glyph: BubbleGlyph; glyphX: number }>[]
  genes: PlacedLabel<GenePin>[]
  routes: PlacedLabel<{ halo: BubbleHalo; route: RouteLabel }>[]
  sizes: GraphLabel[]
}

function byExtent<T>(items: T[], extent: (item: T) => number) {
  return [...items].sort((a, b) => extent(b) - extent(a))
}

// The order is what survives a crowd: the bubble's name, then the gene's, then
// what a deletion skips, then who takes each route, and a node's length last.
export function layoutLabels(m: LabelLayoutSource): LabelLayout {
  const { paneWidth: width, canvasHeight: height, translateX, translateY } = m
  const { scaleX, scaleY } = m.axisScale
  const frame = { width, height }
  const screen = (p: { x: number; y: number }) => ({
    x: p.x * scaleX + translateX,
    y: p.y * scaleY + translateY,
  })
  const reserved: Box[] = m.drawnRowLabels.map(({ label, y }) =>
    rowLabelBox(label, y * scaleY + translateY),
  )
  if (m.legendSize.width > 0) {
    reserved.push({
      x0: width - LEGEND_INSET_PX - m.legendSize.width,
      x1: width,
      y0: 0,
      y1: LEGEND_INSET_PX + m.legendSize.height,
    })
  }
  if (m.poppedFrom) {
    reserved.push({
      x0: 0,
      x1: 60 + m.poppedFrom.label.length * LABEL_CHAR_PX * 1.2,
      y0: 0,
      y1: 44,
    })
  }
  const take = occupancy(frame, reserved)

  // On a row layout a bubble's name goes in the band above the top row, which
  // is the reference it varies, and stays at the pane's top edge once that row
  // scrolls out. Above its own nodes, a lower row's allele would put it on the
  // reference line.
  const onRows = m.drawnRowLabels.length > 0
  const rowsTop = onRows
    ? Math.min(...m.drawnRowLabels.map(r => r.y))
    : Infinity
  const halo = m.contigThickness * HALO_FACTOR
  const byBubble = byExtent(m.bubbleHalos, h => h.members)
  const bubbles = placeLabels(
    byBubble.map(h => {
      const { x, y } = screen({
        x: h.labelAt.x,
        y: Math.min(h.labelAt.y, rowsTop),
      })
      const baseline = y - halo / 2 - 6
      return {
        item: h,
        x,
        y: onRows ? Math.max(baseline, TOPMOST_BASELINE) : baseline,
        text: h.label,
      }
    }),
    frame,
    take,
  )

  const glyphRows = Math.max(
    2,
    Math.min(
      MAX_GLYPH_LABEL_ROWS,
      Math.floor((translateY - GLYPH_ROOM_PX) / (LABEL_PX + LABEL_PAD * 2)),
    ),
  )
  const glyphs = placeLabels(
    byExtent(m.bubbleGlyphs, g => g.bubble.end - g.bubble.start).flatMap(
      glyph => {
        const glyphX =
          ((glyph.bubble.start + glyph.bubble.end) / 2) * scaleX + translateX
        const half = labelWidth(glyph.label) / 2
        return glyphX < 0 || glyphX > width
          ? []
          : [
              {
                item: { glyph, glyphX },
                x: Math.min(Math.max(glyphX, half), width - half),
                y: TOPMOST_BASELINE,
                text: glyph.label,
                stack: glyphRows - 1,
              },
            ]
      },
    ),
    frame,
    take,
  )

  const genes = placeLabels(
    byExtent(m.genePins, pin => pin.gene.end - pin.gene.start).map(pin => {
      const { x, y } = screen(pin.at)
      return {
        item: pin,
        x,
        y: y + m.contigThickness + GENE_PIN_DROP_PX,
        text: pin.covered < 0.98 ? `${pin.gene.name} …` : pin.gene.name,
      }
    }),
    frame,
    take,
  )
  const sizeCandidates =
    m.nodePositions && m.labelsNodeSizes
      ? sizeLabelCandidates({
          nodePositions: m.nodePositions,
          nodeLengths: m.nodeLengths,
          deletions: m.showDeletionEdges ? m.deletions : [],
          alleleDeletions: m.alleleDeletions,
          axis: m.axisScale,
          translateX,
          translateY,
          width,
          height,
          version: m.positionsVersion,
        })
      : { deletions: [], nodes: [] }
  const deletionLabels = placeSizeLabels(sizeCandidates.deletions, take)
  const routes = placeLabels(
    byBubble.flatMap(h =>
      h.routes.map(route => {
        const { x, y } = screen(route.at)
        return {
          item: { halo: h, route },
          x,
          y: y + 4,
          text: route.text,
          stack: ROUTE_STACK,
        }
      }),
    ),
    frame,
    take,
  )
  const nodeLabels = placeSizeLabels(
    sizeCandidates.nodes,
    take,
    nodeLabelBudget(width, height),
  )
  return {
    bubbles,
    glyphs,
    genes,
    routes,
    sizes: [...deletionLabels, ...nodeLabels],
  }
}
