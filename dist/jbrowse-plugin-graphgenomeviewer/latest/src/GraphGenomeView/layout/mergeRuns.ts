import { isBackbone } from '../anchoredNodes'

import type { Graph, GraphNode, NodeSegment } from '../types'

// A base-level graph chops its sequence into short nodes at every variant and
// every kilobase, so a cut of it is thousands of nodes strung in unbranching
// runs. FMMM only needs the runs: each becomes one node, laid out as one
// chain, and its positions are split back onto the members afterwards, so the
// drawing, the hit index and the labels never see the merged graph.
//
// A node joins the run before it when that node's only in-edge is the run's
// only out-edge. A self loop counts on both sides and so keeps its node alone.

export interface MergedRuns {
  graph: Graph
  // merged node id to the member ids in chain order; a run of one is absent
  runs: Map<string, string[]>
}

export function mergeRuns(graph: Graph): MergedRuns {
  const outOf = new Map<string, string[]>()
  const inOf = new Map<string, string[]>()
  const push = (map: Map<string, string[]>, key: string, value: string) => {
    const list = map.get(key)
    if (list) {
      list.push(value)
    } else {
      map.set(key, [value])
    }
  }
  for (const edge of graph.edges) {
    push(outOf, edge.from, edge.to)
    push(inOf, edge.to, edge.from)
  }
  const joins = (a: string, b: string) =>
    a !== b && outOf.get(a)?.length === 1 && inOf.get(b)?.length === 1
  const runOf = new Map<string, string>()
  const runs = new Map<string, string[]>()
  for (const node of graph.nodes) {
    const pred = inOf.get(node.id)
    if (
      runOf.has(node.id) ||
      (pred?.length === 1 && joins(pred[0]!, node.id))
    ) {
      continue
    }
    const run = [node.id]
    for (;;) {
      const next = outOf.get(run.at(-1)!)?.[0]
      if (next === undefined || runOf.has(next) || !joins(run.at(-1)!, next)) {
        break
      }
      run.push(next)
    }
    for (const id of run) {
      runOf.set(id, node.id)
    }
    if (run.length > 1) {
      runs.set(node.id, run)
    }
  }
  // a cycle with no branch has no run start; the loop above never reached it
  for (const node of graph.nodes) {
    if (!runOf.has(node.id)) {
      runOf.set(node.id, node.id)
    }
  }

  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const nodes: GraphNode[] = []
  for (const node of graph.nodes) {
    if (runOf.get(node.id) !== node.id) {
      continue
    }
    const run = runs.get(node.id)
    if (!run) {
      nodes.push(node)
      continue
    }
    const members = run.map(id => byId.get(id)!)
    const backbone = members.filter(isBackbone)
    const first = backbone.length
      ? backbone.reduce((a, b) => (a.stable.start <= b.stable.start ? a : b))
      : members[0]!
    nodes.push({
      id: node.id,
      name: node.name,
      length: members.reduce((sum, n) => sum + n.length, 0),
      depth: node.depth,
      stable: first.stable,
    })
  }
  const internal = new Set<string>()
  for (const run of runs.values()) {
    for (let i = 1; i < run.length; i++) {
      internal.add(`${run[i - 1]}>${run[i]}`)
    }
  }
  const seen = new Set<string>()
  const edges = []
  for (const edge of graph.edges) {
    const key = `${runOf.get(edge.from)}>${runOf.get(edge.to)}`
    if (internal.has(`${edge.from}>${edge.to}`) || seen.has(key)) {
      continue
    }
    seen.add(key)
    edges.push({ from: runOf.get(edge.from)!, to: runOf.get(edge.to)! })
  }
  return {
    graph: { ...graph, nodes, edges, paths: undefined, pathVisits: undefined },
    runs,
  }
}

// Each member takes the stretch of its run's polyline its weight entitles it
// to, in chain order, with the shared points interpolated so the members abut.
export function splitRuns(
  positions: Record<string, NodeSegment[]>,
  runs: Map<string, string[]>,
  weightOf: (id: string) => number,
) {
  const out: Record<string, NodeSegment[]> = { ...positions }
  for (const [id, members] of runs) {
    const line = positions[id]
    if (!line?.length) {
      continue
    }
    delete out[id]
    const arc = arcPrefix(line)
    const total = arc.at(-1)!
    const weights = members.map(m => Math.max(weightOf(m), 0))
    const weightSum = weights.reduce((a, b) => a + b, 0) || members.length
    let from = 0
    members.forEach((member, k) => {
      const share = weightSum
        ? (weights[k]! / weightSum) * total
        : total / members.length
      const to = k === members.length - 1 ? total : from + share
      out[member] = slice(line, arc, from, to)
      from = to
    })
  }
  return out
}

// The stretch of a polyline between two fractions of its arc length, with the
// ends interpolated. What splitRuns cuts a run with, and what the gene pins cut
// a backbone node with to place an exon.
export function polylineSlice(line: NodeSegment[], from: number, to: number) {
  if (line.length === 0) {
    return []
  }
  const arc = arcPrefix(line)
  const total = arc.at(-1)!
  return slice(line, arc, from * total, to * total)
}

// The point halfway along a polyline by arc length, where a node's label goes.
export function polylineMidpoint(line: NodeSegment[]): NodeSegment {
  const arc = arcPrefix(line)
  return pointAt(line, arc, arc.at(-1)! / 2)
}

// Cumulative distance to each point of a polyline, starting at 0.
function arcPrefix(line: NodeSegment[]) {
  const arc = [0]
  for (let i = 1; i < line.length; i++) {
    arc.push(
      arc[i - 1]! +
        Math.hypot(line[i]!.x - line[i - 1]!.x, line[i]!.y - line[i - 1]!.y),
    )
  }
  return arc
}

function pointAt(line: NodeSegment[], arc: number[], s: number): NodeSegment {
  if (s <= 0) {
    return { ...line[0]! }
  }
  let i = 1
  while (i < arc.length && arc[i]! < s) {
    i++
  }
  if (i >= arc.length) {
    return { ...line.at(-1)! }
  }
  const span = arc[i]! - arc[i - 1]!
  const t = span > 0 ? (s - arc[i - 1]!) / span : 0
  const a = line[i - 1]!
  const b = line[i]!
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function slice(line: NodeSegment[], arc: number[], from: number, to: number) {
  const points = [pointAt(line, arc, from)]
  for (let i = 0; i < line.length; i++) {
    if (arc[i]! > from && arc[i]! < to) {
      points.push({ ...line[i]! })
    }
  }
  points.push(pointAt(line, arc, to))
  return points
}
