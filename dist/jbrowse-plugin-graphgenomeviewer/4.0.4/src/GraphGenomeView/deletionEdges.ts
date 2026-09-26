import { firstNodeAtOrAfter, isBackbone } from './anchoredNodes'
import { computeEdgeCurves } from './util/geometry'

import type { AnchoredNode } from './anchoredNodes'
import type { Graph, GraphEdge } from './types'
import type { AxisScale } from './util/geometry'

// A deletion is the one kind of variation this view could not draw, and the
// reason is structural rather than cosmetic: extra sequence is a *node*, so it
// gets a tube, a colour and a hover. Missing sequence is an **edge** — a link
// from one backbone segment to another that is not its neighbour — and every
// edge in the drawing was painted the same grey, so the graph said nothing about
// the events a linear view is worst at.
//
// It needs no new data. Both endpoints of such an edge carry rGFA coordinates on
// the same stable sequence, so the bp the haplotype skips is the gap between
// them, and the whole classification is arithmetic on SN/SO plus the segment
// lengths already parsed. `agent-docs/reference/PANGENOME_GRAPHS.md` in
// jbrowse-components measured what this finds on the hosted HPRC graph: 8
// deletions in the 200 kb MHC class II window against 78 attributed alleles, 1
// in the 70 kb C4 window.
//
// Two things this deliberately does not do:
//
//   - it does not attribute the deletion to a haplotype. A backbone-to-backbone
//     skip has GRCh38 at both ends, so there is no `SN` naming a donor, and the
//     same reference note records why: a deletion only carries a donor when it
//     also carries novel sequence, and then it is not a clean deletion any more.
//   - it does not treat a same-position link as a deletion. Adjacent backbone
//     segments abut (gap 0) and a substitution's flanks can overlap by the
//     aligned bases, so only a positive gap counts.

// A skip has to clear this to be drawn as a deletion. minigraph's SV-resolution
// graph does not record anything smaller than tens of bp, so this is not a
// biological threshold but a guard against calling a rounding artifact a
// deletion — abutting segments are the common case and they must not light up.
const MIN_DELETION_BP = 1

export interface DeletionEdge {
  // index into graph.edges, which is what the renderer keys its curve ranges by
  edgeIndex: number
  // the edge's own endpoints, so anything that needs the arc as it is DRAWN can
  // rebuild it (deletionArcCurves) instead of approximating it from `bypassed`
  from: string
  to: string
  refName: string
  start: number
  end: number
  bp: number
  // Backbone node ids whose reference interval lies inside the skipped span:
  // the route a haplotype taking this edge does NOT take. A drawing sizes the
  // deletion's arc off their drawn length so the two arms of the bubble are
  // comparable; nothing else can supply that, because in a force layout the
  // edge's own endpoints are wherever the simulation put them.
  bypassed: string[]
}

// Where the backbone this deletion bypasses is drawn, as points. `bowAround`
// turns them into how far and which way the arc bows; this only has to say which
// points they are, and is shared so the geometry that draws the arc, the index
// that hit-tests it and the overlay that labels it all bow around the same run.
export function bypassedPoints(
  nodePositions: Record<string, { x: number; y: number }[]>,
  bypassed: string[],
) {
  return bypassed.flatMap(id => nodePositions[id] ?? [])
}

// The deletion's arc exactly as the renderer draws it, for anything that has to
// agree with the drawing: the label that rides it, and hit detection.
//
// This exists because the label used to be placed at an apex derived from the
// BYPASSED nodes while the curve was drawn between the EDGE's endpoints. In an
// anchored layout the bypassed run lies between the endpoints, so the two agreed
// and the divergence was invisible; under FMMM the endpoints are wherever the
// simulation left them and the bypassed run is elsewhere, so the words and the
// arc they named came out in different corners of the drawing
// (`pangenome/hprc_cfhr_deletion`, reviewed 2026-07-31). One function is the fix:
// a second derivation of the same curve is a second thing to keep in step.
export function deletionArcCurves(
  nodePositions: Record<string, { x: number; y: number }[]>,
  deletion: DeletionEdge,
  axis: AxisScale,
) {
  const from = nodePositions[deletion.from]
  const to = nodePositions[deletion.to]
  return from?.length && to?.length
    ? computeEdgeCurves(
        from,
        to,
        deletion.from === deletion.to,
        0,
        0,
        axis,
        bypassedPoints(nodePositions, deletion.bypassed),
      )
    : undefined
}

// The backbone by stable sequence, each sorted by start, so the run a deletion
// bypasses is a slice rather than a scan. Filtering the whole backbone per
// candidate edge is O(edges x backbone), which at the node budget this view
// accepts (20,000) is hundreds of millions of comparisons for a pass that runs
// once per graph.
function backboneBySequence(graph: Graph) {
  const bySequence = new Map<string, AnchoredNode[]>()
  for (const node of graph.nodes) {
    if (isBackbone(node)) {
      const list = bySequence.get(node.stable.refName)
      if (list) {
        list.push(node)
      } else {
        bySequence.set(node.stable.refName, [node])
      }
    }
  }
  for (const list of bySequence.values()) {
    list.sort((a, b) => a.stable.start - b.stable.start)
  }
  return bySequence
}

// Backbone nodes lying wholly inside [start, end) on `refName`. Sorted by
// start, so the candidates are one contiguous run and the walk stops at the
// first node starting past the end; only the upper bound still needs testing
// per node, since a long node can start inside and finish outside.
function bypassedNodes(
  nodes: AnchoredNode[] | undefined,
  start: number,
  end: number,
) {
  const bypassed: string[] = []
  if (nodes) {
    for (let i = firstNodeAtOrAfter(nodes, start); i < nodes.length; i++) {
      const node = nodes[i]!
      if (node.stable.start >= end) {
        break
      }
      if (node.stable.start + node.length <= end) {
        bypassed.push(node.id)
      }
    }
  }
  return bypassed
}

// A link leaves the END of `from` as it reads it and arrives at the START of
// `to`. Read the way the reference reads a node, its end is its right side, so
// a link leaves `from` on the right when the two readings agree and arrives at
// `to` on the left when they do.
//
// A deletion joins the right side of the left node to the left side of the
// right one, from whichever strand the file states it: `L 1 + 3 +`, or the
// same link as `L 3 - 1 -`. `L 3 + 1 +` joins the right side of the RIGHT node
// to the left side of the left one, sequence read again, a duplication. A link
// with one reading against the reference lands on a node's far side, an
// inversion. Neither skips anything. Coordinates alone could not tell them
// from a deletion: each was drawn as one, and hidden with them by default.
//
// A link stating no strands is judged by its coordinates, as all once were.
function skipsBetween(
  edge: GraphEdge,
  from: AnchoredNode,
  to: AnchoredNode,
  forwards: boolean,
) {
  const { fromStrand, toStrand } = edge
  if (fromStrand === undefined || toStrand === undefined) {
    return true
  }
  const leavesRight = fromStrand === (from.stable.strand ?? '+')
  const arrivesLeft = toStrand === (to.stable.strand ?? '+')
  return forwards ? leavesRight && arrivesLeft : !leavesRight && !arrivesLeft
}

// Every edge that skips reference sequence, in graph.edges order.
export function deletionEdges(graph: Graph): DeletionEdge[] {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const backbone = backboneBySequence(graph)
  const found: DeletionEdge[] = []
  for (let edgeIndex = 0; edgeIndex < graph.edges.length; edgeIndex++) {
    const edge = graph.edges[edgeIndex]!
    const from = byId.get(edge.from)
    const to = byId.get(edge.to)
    if (
      from !== undefined &&
      to !== undefined &&
      isBackbone(from) &&
      isBackbone(to) &&
      from.stable.refName === to.stable.refName
    ) {
      // Which endpoint is upstream comes from the coordinates, since a file
      // may state a link from either strand. Whether it SKIPS what lies
      // between comes from its sides: a deletion leaves the right side of the
      // left node and arrives at the left side of the right one.
      const forwards = from.stable.start <= to.stable.start
      const [left, right] = forwards ? [from, to] : [to, from]
      const start = left.stable.start + left.length
      const end = right.stable.start
      const bp = end - start
      if (bp >= MIN_DELETION_BP && skipsBetween(edge, from, to, forwards)) {
        const refName = left.stable.refName
        found.push({
          edgeIndex,
          from: edge.from,
          to: edge.to,
          refName,
          start,
          end,
          bp,
          bypassed: bypassedNodes(backbone.get(refName), start, end),
        })
      }
    }
  }
  return found
}
