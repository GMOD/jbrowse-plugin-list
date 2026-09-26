import { isBackbone } from '../anchoredNodes'
import { buildNeighbors } from '../referenceSpan'
import { drawnNodeLength } from './drawnScale'

import type { LayoutScaling } from './drawnScale'
import type { Graph, GraphNode } from '../types'

// A node as the engine takes it: an optional `x`/`y` is where FMMM starts the
// node's chain (`addToOgdfGraph`, graphlayout.cpp).
export type LayoutNode = GraphNode & { x?: number; y?: number }

export interface Seed {
  x: number
  y: number
}

// y per BFS step off the backbone. FMMM keeps only the coarse shape of these
// (OGDF applies the initial placement at its coarsest multilevel graph), so
// the gap needs to say "below the line", not to place a lane.
const LANE_GAP = 30

// Initial positions for a reference-anchored graph: the backbone end to end
// along x at drawn length, each off-reference node at the midpoint of the node
// a BFS from the backbone reached it from, a lane lower per step. Two alleles
// off one anchor share a seed; FMMM separates them. Nodes no backbone reaches
// spread along x below everything rather than piling on one point.
//
// Lengths come from `scaling.nodes`, not the graph's bp: under a compressing
// spread a node's `length` crosses the RPC as drawn units times 1000 with a
// matching `nodeLengthPerMegabase`, and a seed from bp would misplace every
// chain against the one the engine builds.
export function referenceSeeds(
  graph: Graph,
  scaling: LayoutScaling,
): Map<string, Seed> {
  const { opts } = scaling
  const drawn = new Map(
    scaling.nodes.map(node => [node.id, drawnNodeLength(opts, node.length)]),
  )
  const drawnOf = (id: string) => drawn.get(id) ?? opts.minimumNodeLength
  const backbone = graph.nodes
    .filter(isBackbone)
    .sort((a, b) => a.stable.start - b.stable.start)

  const seeds = new Map<string, Seed>()
  let x = 0
  for (const node of backbone) {
    seeds.set(node.id, { x, y: 0 })
    x += drawnOf(node.id) + opts.edgeLength
  }

  const adjacent = buildNeighbors(graph)

  const depth = new Map(backbone.map(node => [node.id, 0]))
  // for-of over an array that grows as it goes: the iterator reads the live
  // length, so nodes pushed here are visited
  const queue = backbone.map(node => node.id)
  for (const id of queue) {
    const at = seeds.get(id)!
    const next = depth.get(id)! + 1
    for (const neighbour of adjacent.get(id) ?? []) {
      if (depth.has(neighbour)) {
        continue
      }
      depth.set(neighbour, next)
      seeds.set(neighbour, { x: at.x + drawnOf(id) / 2, y: LANE_GAP * next })
      queue.push(neighbour)
    }
  }

  let unreached = 0
  for (const node of graph.nodes) {
    if (!seeds.has(node.id)) {
      seeds.set(node.id, {
        x: (unreached++ * x) / graph.nodes.length,
        y: LANE_GAP * 3,
      })
    }
  }
  return seeds
}

export function seededNodes(
  graph: Graph,
  scaling: LayoutScaling,
): LayoutNode[] {
  const seeds = referenceSeeds(graph, scaling)
  return scaling.nodes.map(node => ({ ...node, ...seeds.get(node.id) }))
}
