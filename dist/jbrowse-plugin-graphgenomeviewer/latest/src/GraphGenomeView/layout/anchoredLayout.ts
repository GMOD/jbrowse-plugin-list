import { placeOffReference } from './placeOffReference'
import { ROW_HEIGHT_PX } from './rowSpacing'
import {
  backboneNodes,
  backbonePositions,
  referenceSpan,
} from '../anchoredNodes'

import type { Graph, LayoutResult, RowLabel } from '../types'

// Layout for rGFA, where the graph states its own backbone instead of leaving a
// force simulation to find one. Every segment carries SN/SO/SR (gfatools
// doc/rGFA.md), so both axes come from the file:
//
//   x  reference bp, for every segment. Rank-0 segments sit at the offset they
//      declare; an off-reference segment cannot use its own SO, which is an
//      offset on a different stable sequence, so it takes the slice of the
//      reference its allele replaces (placeOffReference).
//   y  one row per stable rank *present in this subgraph*, the way lh3's own
//      rGFA viewer (VRPG) does it: rank 0 is the reference line, higher ranks
//      below it in order. In SCREEN PIXELS, not bp — see rowSpacing.ts, shared
//      with the sample-row layout.

// Rank is a property of the whole graph, not of the window being drawn: HPRC's
// minigraph graph ranks up to 89, but an MHC window holds only ranks
// 0/1/3/6/14/23. Indexing rows by raw rank would leave 17 of 24 rows empty and
// zoom-to-fit would shrink the drawing to fit that void (measured: 0.3% scale).
// So rows are the ranks actually present, in rank order — identical to the raw
// rank whenever the window happens to hold a contiguous run from 0.
function rankRows(graph: Graph) {
  const present = new Set<number>()
  for (const node of graph.nodes) {
    if (node.stable) {
      present.add(node.stable.rank)
    }
  }
  return new Map([...present].sort((a, b) => a - b).map((r, i) => [r, i]))
}

export function anchoredLayout(
  graph: Graph,
  region?: { start: number; end: number },
): LayoutResult | undefined {
  const backbone = backboneNodes(graph)
  if (backbone.length === 0) {
    return undefined
  }

  const span = referenceSpan(backbone, region)
  const rows = rankRows(graph)

  // Row 0 by construction: a backbone exists, so rank 0 is present, and
  // `rankRows` numbers the present ranks in ascending order.
  const nodePositions = backbonePositions(backbone)

  const alleleDeletions = placeOffReference({
    graph,
    span,
    rowY: node =>
      (node.stable ? (rows.get(node.stable.rank) ?? rows.size) : rows.size) *
      ROW_HEIGHT_PX,
    positions: nodePositions,
  })

  // Named from the same `rows` map that placed every node, so the axis and the
  // drawing cannot disagree. Rank 0 is spelled out: "the reference" is what a
  // reader needs, and "Rank 0" alone reads as an ordinal with no meaning.
  const rowLabels: RowLabel[] = [...rows].map(([rank, row]) => ({
    label: rank === 0 ? 'Reference (rank 0)' : `Rank ${rank}`,
    y: row * ROW_HEIGHT_PX,
  }))

  return {
    nodePositions,
    rowLabels,
    referenceAxis: true,
    pixelRows: true,
    alleleDeletions,
  }
}
