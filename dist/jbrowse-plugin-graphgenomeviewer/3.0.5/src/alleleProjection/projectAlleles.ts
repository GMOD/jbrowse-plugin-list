import { REFERENCE_RANK, isAnchored } from '../GraphGenomeView/anchoredNodes'
import { buildNeighbors } from '../GraphGenomeView/referenceSpan'

import type { AnchoredNode } from '../GraphGenomeView/anchoredNodes'
import type { Graph } from '../GraphGenomeView/types'

// An rGFA subgraph's alleles on the reference axis, from the stable
// coordinates and the L lines alone: an allele is a run of off-reference
// segments, and the rank-0 segments it detaches from and reattaches to give it
// a reference span. rGFA carries no W or P lines, so nothing here reads a walk.

export interface ProjectedAllele {
  // reference bp the allele replaces, from the flanking rank-0 segments
  start: number
  refSpan: number
  // the run's strand-suffixed node ids, ordered by `nodeOffsets`
  nodeIds: string[]
  // bp from the allele's entry to the start of each node, along the run's own
  // edges, so a layout puts a node where it sits within the allele
  nodeOffsets: number[]
  // bp of the longest path through the run, the denominator for nodeOffsets:
  // a bubble's branches are alternatives, so their sum is no assembly's length
  pathLength: number
}

// PanSN is `sample#haplotype#contig`, but minigraph accepts a bare contig name
// and the E. coli fixture is `K12#1#chr`, so this parses what is there.
export function parsePanSN(refName: string) {
  const parts = refName.split('#')
  const haplotype = parts.length >= 2 ? Number(parts[1]) : Number.NaN
  return {
    sample: parts[0] ?? refName,
    haplotype: Number.isFinite(haplotype) ? haplotype : undefined,
  }
}

// One connected run of off-reference segments and the rank-0 segments on its
// boundary. Walked through anchored nodes only: everything reported about a
// run is read off a stable coordinate.
function collectRun(
  seed: string,
  byId: Map<string, AnchoredNode>,
  adj: Map<string, string[]>,
  claimed: Set<string>,
) {
  const members: AnchoredNode[] = []
  const anchors: AnchoredNode[] = []
  const queue = [seed]
  claimed.add(seed)

  while (queue.length > 0) {
    const id = queue.pop()!
    const node = byId.get(id)
    if (node) {
      members.push(node)
      for (const neighborId of adj.get(id) ?? []) {
        const neighbor = byId.get(neighborId)
        if (neighbor) {
          if (neighbor.stable.rank === REFERENCE_RANK) {
            anchors.push(neighbor)
          } else if (!claimed.has(neighborId)) {
            claimed.add(neighborId)
            queue.push(neighborId)
          }
        }
      }
    }
  }
  return { members, anchors }
}

// The reference interval an allele replaces: from the end of the last backbone
// segment before it to the start of the first one after it. Anchors on two
// stable sequences, or in an order that runs backwards (an inverted or
// translocated attachment), state no span rather than a negative one.
function anchorSpan(anchors: AnchoredNode[]) {
  const refNames = new Set(anchors.map(a => a.stable.refName))
  if (refNames.size !== 1 || anchors.length < 2) {
    return undefined
  }
  const sorted = [...anchors].sort((a, b) => a.stable.start - b.stable.start)
  const first = sorted[0]!
  const last = sorted.at(-1)!
  const start = first.stable.start + first.length
  const end = last.stable.start
  return end >= start ? { start, end, entry: first } : undefined
}

// Shortest-path bp from the upstream anchor to each member over the run's own
// edges, which only orders the run. The edges are undirected (a GFA states a
// reverse-complement link backwards and single-node mode collapses both
// orientations), so there is no topological order and a longest-path
// relaxation would not converge.
function runDistances(
  members: AnchoredNode[],
  entry: AnchoredNode,
  adj: Map<string, string[]>,
) {
  const byId = new Map(members.map(m => [m.id, m]))
  const dist = new Map<string, number>()
  const queue: string[] = []
  for (const neighborId of adj.get(entry.id) ?? []) {
    if (byId.has(neighborId)) {
      dist.set(neighborId, 0)
      queue.push(neighborId)
    }
  }
  if (queue.length === 0) {
    for (const member of members) {
      dist.set(member.id, 0)
      queue.push(member.id)
    }
  }
  for (const id of queue) {
    const reach = dist.get(id)! + byId.get(id)!.length
    for (const neighborId of adj.get(id) ?? []) {
      if (byId.has(neighborId)) {
        const known = dist.get(neighborId)
        if (known === undefined || reach < known) {
          dist.set(neighborId, reach)
          queue.push(neighborId)
        }
      }
    }
  }
  return dist
}

// Where each member sits within the allele: ordered by distance from the entry
// and swept forward, so a node starts where the last of its already-placed
// neighbours ends. Offsets are then monotone along every edge in the run, which
// is what keeps a bubble's entry and exit curves from crossing; where the two
// branches differ in length the short one gets slack rather than the long one a
// backwards edge.
function runOffsets(
  members: AnchoredNode[],
  entry: AnchoredNode,
  adj: Map<string, string[]>,
) {
  const dist = runDistances(members, entry, adj)
  const ordered = [...members].sort((a, b) => dist.get(a.id)! - dist.get(b.id)!)
  const rank = new Map(ordered.map((m, i) => [m.id, i]))
  const byId = new Map(members.map(m => [m.id, m]))
  const offsets = new Map<string, number>()
  for (const [i, member] of ordered.entries()) {
    let offset = 0
    for (const neighborId of adj.get(member.id) ?? []) {
      const neighbor = byId.get(neighborId)
      if (neighbor && rank.get(neighborId)! < i) {
        offset = Math.max(offset, offsets.get(neighborId)! + neighbor.length)
      }
    }
    offsets.set(member.id, offset)
  }
  return { offsets, ordered }
}

// Every allele with a reference span, by start. A run that reaches the edge of
// the cut has one anchor and no span, which is the ordinary case at a window
// boundary; placeOffReference chains those off wherever they branch.
export function projectAlleles(graph: Graph): ProjectedAllele[] {
  const byId = new Map(
    graph.nodes.filter(isAnchored).map(n => [n.id, n] as const),
  )
  const adj = buildNeighbors(graph)
  const claimed = new Set<string>()
  const alleles: ProjectedAllele[] = []

  for (const node of byId.values()) {
    if (node.stable.rank !== REFERENCE_RANK && !claimed.has(node.id)) {
      const { members, anchors } = collectRun(node.id, byId, adj, claimed)
      const span = anchorSpan(anchors)
      if (span) {
        const { offsets, ordered } = runOffsets(members, span.entry, adj)
        alleles.push({
          start: span.start,
          refSpan: span.end - span.start,
          nodeIds: ordered.map(m => m.id),
          nodeOffsets: ordered.map(m => offsets.get(m.id)!),
          pathLength: ordered.reduce(
            (max, m) => Math.max(max, offsets.get(m.id)! + m.length),
            0,
          ),
        })
      }
    }
  }

  return alleles.sort((a, b) => a.start - b.start)
}
