import { ROW_HEIGHT_PX } from './rowSpacing'
import { isBackbone } from '../anchoredNodes'

import type { AnchoredNode } from '../anchoredNodes'
import type { Graph, GraphNode, LayoutResult, NodeSegment } from '../types'

// Reference-ordered layered layout: x is reference ORDER, not bp. Backbone
// segments take increasing layers by stable offset, every other node the layer
// between the anchors it hangs off, and a node is as wide as the log of its bp,
// so a SNP allele gets the same room as a 10 kb segment and a bubble reads as a
// lens rather than a bar under a line. y is a lane in screen px with the
// reference pinned at lane 0 (docs/layout-experiments.md, experiment 3).

const GUTTER = 12
const LANE_PX = ROW_HEIGHT_PX

function nodeWidth(node: GraphNode) {
  return 10 + 8 * Math.log2(1 + node.length)
}

function compare<T extends string | number>(a: T, b: T) {
  return a < b ? -1 : a > b ? 1 : 0
}

// Where a node sorts: `at` is the rank of a placed node, the backbone and what
// the walks visit, and a node the search claims sorts before or after the one
// that claimed it, by its steps from it. A tuple rather than an offset nudged
// per step: on a base-level graph the backbone nodes are a bp apart, and a
// chain a few nodes long nudged its keys past the ones that follow.
interface OrderKey {
  at: number
  side: -1 | 0 | 1
  hops: number
}

function compareKeys(a: OrderKey, b: OrderKey) {
  return (
    compare(a.at, b.at) || compare(a.side, b.side) || compare(a.hops, b.hops)
  )
}

const UNREACHED: OrderKey = { at: Infinity, side: 0, hops: 0 }

// Every node id in reference order: backbone by stable offset, every other node
// beside a backbone node (orderKeys), nodes nothing reaches last. Name breaks
// ties, so the order is a strict total order and the same graph always gets
// the same one.
export function referenceOrder(graph: Graph) {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const key = orderKeys(graph)
  return graph.nodes
    .map(n => n.id)
    .sort(
      (a, b) =>
        compareKeys(key.get(a) ?? UNREACHED, key.get(b) ?? UNREACHED) ||
        compare(byId.get(a)!.name, byId.get(b)!.name) ||
        compare(a, b),
    )
}

// A walk states where its nodes lie, which the links alone do not. Starting
// from the backbone in offset order, each node a walk visits for the first time
// goes into the order immediately after the node that walk came from, and the
// nodes a walk visits before it meets a placed one go immediately before it.
//
// That keeps every true boundary. A walk's step joins two nodes on the same
// side of a node every haplotype crosses once, unless one of them is that
// node, so by induction the nodes between two such boundaries stay one
// unbroken stretch of the order and no link among them reaches across. On the
// eight-haplotype KIV-2 cut (15,808 nodes) the walks imply 28 bubbles and this
// derives those 28, with 5 of 65,776 walk steps against the order. Placing
// every node by the links alone derived 21, with 23,308 steps against it.
//
// A walk on the reverse strand is read end-first.
function placeByWalks(graph: Graph, backbone: AnchoredNode[]) {
  const isNode = new Set(graph.nodes.map(n => n.id))
  const startOf = new Map(backbone.map(n => [n.id, n.stable.start]))
  const next = new Map<string, string | undefined>()
  const prev = new Map<string, string | undefined>()
  backbone.forEach((n, i) => {
    prev.set(n.id, backbone[i - 1]?.id)
    next.set(n.id, backbone[i + 1]?.id)
  })
  let head = backbone[0]?.id
  const insertAfter = (at: string, id: string) => {
    const after = next.get(at)
    next.set(at, id)
    prev.set(id, at)
    next.set(id, after)
    if (after !== undefined) {
      prev.set(after, id)
    }
  }
  const insertBefore = (at: string, id: string) => {
    const before = prev.get(at)
    if (before === undefined) {
      head = id
      prev.set(id, undefined)
      next.set(id, at)
      prev.set(at, id)
    } else {
      insertAfter(before, id)
    }
  }

  for (const path of graph.paths ?? []) {
    let rising = 0
    let falling = 0
    let last: number | undefined
    for (const id of path.nodeIds) {
      const start = startOf.get(id)
      if (start !== undefined) {
        if (last !== undefined && start !== last) {
          if (start > last) {
            rising++
          } else {
            falling++
          }
        }
        last = start
      }
    }
    const ids = falling > rising ? [...path.nodeIds].reverse() : path.nodeIds
    let from: string | undefined
    const leading = new Set<string>()
    for (const id of ids) {
      if (next.has(id)) {
        if (from === undefined) {
          for (const lead of leading) {
            insertBefore(id, lead)
          }
        }
        from = id
      } else if (isNode.has(id)) {
        if (from === undefined) {
          leading.add(id)
        } else {
          insertAfter(from, id)
          from = id
        }
      }
    }
  }

  const placed: string[] = []
  for (let id = head; id !== undefined; id = next.get(id)) {
    placed.push(id)
  }
  return placed
}

// The nodes no walk visits, which is every off-reference node of a graph with
// no walks: each goes beside the nearest placed node that reaches it (BFS over
// the links as undirected, seeded in order so a tie goes left).
//
// That search meets itself in the middle of an allele, so the far half of a
// chain A>X1>X2>B is claimed from B, its RIGHT anchor. Placed after B, as every
// claimed node once was, X2 sorted past the node it leads into, its link was
// turned round, and the insertion stopped being a bubble. So a run of nodes
// claimed from one placed node lies BEFORE it, farthest node first, when it is
// such a far half: it touches nothing right of that node, and every dead end of
// the search inside it is a place the search from the left arrived. Steps are
// a position only along a chain. In a tangle the farthest node is a dead end
// with nothing before it, and sorted first its links to its real neighbours
// sweep across every boundary between, so any other run stays after.
function placeBySearch(
  adjacent: Map<string, string[]>,
  key: Map<string, OrderKey>,
) {
  const queue = [...key.entries()]
    .sort(([a, ka], [b, kb]) => compareKeys(ka, kb) || compare(a, b))
    .map(([id]) => id)
  const placed = queue.length
  // the queue grows while the loop walks it, which for-of follows
  for (const id of queue) {
    const from = key.get(id)!
    for (const nb of adjacent.get(id) ?? []) {
      if (!key.has(nb)) {
        key.set(nb, { at: from.at, side: 1, hops: from.hops + 1 })
        queue.push(nb)
      }
    }
  }

  const searched = new Set(queue.slice(placed))
  const sided = new Set<string>()
  for (const seed of searched) {
    if (sided.has(seed)) {
      continue
    }
    const { at } = key.get(seed)!
    const run = [seed]
    sided.add(seed)
    let farHalf = true
    for (const id of run) {
      const { hops } = key.get(id)!
      let deadEnd = true
      let touchesLeft = false
      for (const nb of adjacent.get(id) ?? []) {
        const other = key.get(nb)!
        if (other.at === at && searched.has(nb)) {
          deadEnd &&= other.hops <= hops
          if (!sided.has(nb)) {
            sided.add(nb)
            run.push(nb)
          }
        } else if (other.at !== at) {
          touchesLeft ||= other.at < at
          farHalf &&= other.at < at
        }
      }
      farHalf &&= !deadEnd || touchesLeft
    }
    if (farHalf) {
      for (const id of run) {
        const k = key.get(id)!
        key.set(id, { ...k, side: -1, hops: -k.hops })
      }
    }
  }
}

function orderKeys(graph: Graph) {
  const ids = new Set(graph.nodes.map(n => n.id))
  const adjacent = new Map<string, string[]>()
  for (const e of graph.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) {
      continue
    }
    ;(adjacent.get(e.from) ?? adjacent.set(e.from, []).get(e.from)!).push(e.to)
    ;(adjacent.get(e.to) ?? adjacent.set(e.to, []).get(e.to)!).push(e.from)
  }
  const backbone = graph.nodes
    .filter(isBackbone)
    .sort(
      (a, b) =>
        compare(a.stable.start, b.stable.start) || compare(a.name, b.name),
    )
  const key = new Map<string, OrderKey>()
  placeByWalks(graph, backbone).forEach((id, rank) => {
    key.set(id, { at: rank, side: 0, hops: 0 })
  })
  placeBySearch(adjacent, key)
  return key
}

export interface LayeredGraph {
  layers: string[][]
  layerOf: Map<string, number>
  // predecessors in layer order, for the y sweep
  preds: Map<string, string[]>
}

// The layered DAG the ordered layout draws and the bubble decomposition reads
// (bubbles/bubblesFromGraph.ts), from one function so the two cannot disagree
// about which nodes share a layer.
export function layerGraph(graph: Graph): LayeredGraph {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const order = referenceOrder(graph)
  const key = new Map(order.map((id, i) => [id, i]))
  const isRef = (id: string) => isBackbone(byId.get(id)!)

  // Every edge directed from lower reference key to higher, so the graph is
  // acyclic by construction and no cycle-removal heuristic can misplace the
  // reference.
  const preds = new Map<string, string[]>(order.map(id => [id, []]))
  const succs = new Map<string, string[]>(order.map(id => [id, []]))
  const link = (a: string, b: string) => {
    preds.get(b)!.push(a)
    succs.get(a)!.push(b)
  }
  for (const e of graph.edges) {
    if (e.from === e.to || !key.has(e.from) || !key.has(e.to)) {
      continue
    }
    if (key.get(e.from)! < key.get(e.to)!) {
      link(e.from, e.to)
    } else {
      link(e.to, e.from)
    }
  }
  // The backbone chained by virtual edges, so the reference stays monotone even
  // where adjacent segments are not linked inside the cut.
  const backbone = order.filter(isRef)
  for (let i = 1; i < backbone.length; i++) {
    link(backbone[i - 1]!, backbone[i]!)
  }

  // Longest-path layering; the key order is a topological order of this DAG.
  const layerOf = new Map<string, number>()
  for (const id of order) {
    let l = 0
    for (const p of preds.get(id)!) {
      l = Math.max(l, layerOf.get(p)! + 1)
    }
    layerOf.set(id, l)
  }
  // Then each allele slides right to centre between the layer its predecessors
  // force and the one its successors allow, so a short allele sits in the
  // middle of its bubble rather than hugging the left anchor.
  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i]!
    const s = succs.get(id)!
    if (isRef(id) || s.length === 0) {
      continue
    }
    let minSucc = Infinity
    for (const t of s) {
      minSucc = Math.min(minSucc, layerOf.get(t)!)
    }
    const lo = layerOf.get(id)!
    const hi = Math.max(lo, minSucc - 1)
    layerOf.set(id, Math.floor((lo + hi) / 2))
  }

  const layers: string[][] = []
  for (const id of order) {
    ;(layers[layerOf.get(id)!] ??= []).push(id)
  }
  return { layers, layerOf, preds }
}

export function orderedLayout(graph: Graph): LayoutResult | undefined {
  if (!graph.nodes.some(isBackbone)) {
    return undefined
  }
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const isRef = (id: string) => isBackbone(byId.get(id)!)
  const { layers, layerOf: layer, preds } = layerGraph(graph)

  const layerWidth = layers.map(ids => {
    let w = 0
    for (const id of ids) {
      w = Math.max(w, nodeWidth(byId.get(id)!))
    }
    return w
  })
  const layerX: number[] = []
  let x = 0
  for (let l = 0; l < layers.length; l++) {
    layerX[l] = x
    x += layerWidth[l]! + GUTTER
  }

  // y: sweep the layers left to right, each allele at the barycenter of its
  // placed predecessors, then at the nearest FREE lane to it. Lane 0 is the
  // reference line and stays reserved even in a layer with no backbone node,
  // or an allele between two backbone segments reads as reference.
  const y = new Map<string, number>()
  for (const ids of layers) {
    const free: { id: string; ideal: number }[] = []
    for (const id of ids) {
      if (isRef(id)) {
        y.set(id, 0)
        continue
      }
      const placed = preds.get(id)!.filter(p => y.has(p))
      let ideal = 0
      for (const p of placed) {
        ideal += y.get(p)! / placed.length
      }
      // a node straight off the backbone wants to leave it, not sit on it
      free.push({ id, ideal: ideal === 0 ? LANE_PX : ideal })
    }
    free.sort((a, b) => a.ideal - b.ideal)
    const taken = new Set([0])
    for (const { id, ideal } of free) {
      let lane = Math.round(ideal / LANE_PX)
      if (lane === 0) {
        lane = ideal >= 0 ? 1 : -1
      }
      for (let d = 1; taken.has(lane); d++) {
        if (!taken.has(lane + d)) {
          lane += d
        } else if (!taken.has(lane - d)) {
          lane -= d
        }
      }
      taken.add(lane)
      y.set(id, lane * LANE_PX)
    }
  }

  const nodePositions: Record<string, NodeSegment[]> = {}
  for (const n of graph.nodes) {
    const l = layer.get(n.id)!
    const w = nodeWidth(n)
    const cx = layerX[l]! + layerWidth[l]! / 2
    const ny = y.get(n.id)!
    nodePositions[n.id] = [
      { x: cx - w / 2, y: ny },
      { x: cx + w / 2, y: ny },
    ]
  }
  return { nodePositions, referenceAxis: false, pixelRows: true }
}
