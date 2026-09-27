import type { Graph, GraphNode, NodeSegment } from './types'
import type { StableCoordinate } from '../gfa-core/index'

// A node whose stable coordinate is known to be present. rGFA states SN/SO/SR
// on every segment and a path walk derives the same for every segment a path
// visits (pathAnchoring.ts), so the anchored layouts and the allele projection
// all work with nodes whose `stable` is a fact rather than an optional —
// narrowing once here keeps them from asserting it at every use.
export type AnchoredNode = GraphNode & { stable: StableCoordinate }

// Stable rank: 0 is the reference backbone, higher ranks are the sequence that
// diverges from it. rGFA counts those up in build order; a path-derived graph
// has only the one distinction its paths support, on the reference or off it.
export const REFERENCE_RANK = 0

export function isAnchored(node: GraphNode): node is AnchoredNode {
  return node.stable !== undefined
}

// Narrows to AnchoredNode so `filter` yields nodes whose coordinate is a fact.
// Only use it on nodes that may be unanchored: negating a type predicate on an
// AnchoredNode narrows the other branch to `never`, which is not what "off the
// backbone" means. Where a node is already anchored, compare the rank directly.
export function isBackbone(node: GraphNode): node is AnchoredNode {
  return node.stable?.rank === REFERENCE_RANK
}

// Anchored and above rank 0: sequence that diverges from the reference. Not
// simply `!isBackbone`, which would also admit nodes carrying no coordinate.
export function isOffReference(node: GraphNode): node is AnchoredNode {
  return node.stable !== undefined && node.stable.rank > REFERENCE_RANK
}

export function backboneNodes(graph: Graph) {
  return graph.nodes.filter(isBackbone)
}

// The backbone on row 0 at its declared offsets: the x axis of every layout
// whose x is reference bp.
export function backbonePositions(backbone: AnchoredNode[]) {
  const positions: Record<string, NodeSegment[]> = {}
  for (const node of backbone) {
    positions[node.id] = [
      { x: node.stable.start, y: 0 },
      { x: node.stable.start + node.length, y: 0 },
    ]
  }
  return positions
}

// Index of the first node starting at or after `bp`, in a list sorted by start.
export function firstNodeAtOrAfter(nodes: AnchoredNode[], bp: number) {
  let lo = 0
  let hi = nodes.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (nodes[mid]!.stable.start < bp) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  return lo
}

// bp the backbone covers in this subgraph. Both anchored layouts scale their row
// spacing and their minimum drawn allele length off it.
//
// A fold rather than Math.max(...starts): the subgraph path is capped at 100 kb
// but a whole-file GFA import is not, and spreading a backbone of more than
// ~130k segments into an argument list throws RangeError.
export function backboneSpan(backbone: AnchoredNode[]) {
  let min = Infinity
  let max = -Infinity
  for (const node of backbone) {
    min = Math.min(min, node.stable.start)
    max = Math.max(max, node.stable.start + node.length)
  }
  return max - min
}

// The reference interval the drawing is scaled against: the region the cut was
// made for, when there is one.
//
// Not the same as the backbone's own extent, and the difference is not small. A
// hop reaches the far anchor of a long-range allele, and that anchor is a rank-0
// segment: in the E. coli pggb graph a 75 bp CFT073 segment bridges K12:997,574
// and K12:1,004,667, so a 484 bp window's backbone measured 7,395 bp. Everything
// scaled off that span went with it — rows 15x too far apart, and an off-
// reference floor of 111 bp inside a 484 bp window.
//
// A whole-file import has no region, and there the measured extent is the only
// answer available.
export function referenceSpan(
  backbone: AnchoredNode[],
  region?: { start: number; end: number },
) {
  return region && region.end > region.start
    ? region.end - region.start
    : backboneSpan(backbone)
}
