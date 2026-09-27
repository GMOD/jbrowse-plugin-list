import { ROW_HEIGHT_PX } from './rowSpacing'
import { walkRows } from './walkRows'
import { backboneNodes, backbonePositions } from '../anchoredNodes'

import type { WalkRows } from './walkRows'
import type { Graph, LayoutResult, RowLabel } from '../types'

// The reference walk as the backbone on row 0, at its bp, and a row per other
// walk below it. The rows themselves are not nodes: a node the renderer draws
// once cannot sit on nine rows, so WalkRowsOverlay draws each walk's bar from
// `walkRows`, and this layout only reserves the rows and states how far the
// bars reach so the fit and the pane height include them.
// The fit leaves this much past the longest bar for its readout and the legend.
const READOUT_ROOM = 1.3

// How far the bars reach, so the fit and the pane height include them. The
// model reads it again for the bars it actually draws, which a repeat pick or
// a sample filter can narrow after this layout ran.
export function walkRowsExtent(walks: WalkRows) {
  let longest = walks.reference.bp
  for (const row of walks.rows) {
    longest = Math.max(longest, row.bp)
  }
  return {
    maxX: walks.origin + longest * READOUT_ROOM,
    maxY: walks.rows.length * ROW_HEIGHT_PX,
  }
}

export function walkRowLayout(
  graph: Graph,
  region?: { start: number; end: number },
): LayoutResult | undefined {
  const backbone = backboneNodes(graph)
  const walks = walkRows(graph, region)
  if (backbone.length === 0 || !walks) {
    return undefined
  }
  const nodePositions = backbonePositions(backbone)
  const rowLabels: RowLabel[] = [
    { label: walks.reference.label, y: 0 },
    ...walks.rows.map((row, i) => ({
      label: row.label,
      y: (i + 1) * ROW_HEIGHT_PX,
    })),
  ]
  return {
    nodePositions,
    rowLabels,
    referenceAxis: true,
    pixelRows: true,
    extent: walkRowsExtent(walks),
  }
}
