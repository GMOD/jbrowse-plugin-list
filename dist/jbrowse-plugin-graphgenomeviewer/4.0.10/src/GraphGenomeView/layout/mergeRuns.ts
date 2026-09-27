import { isBackbone } from '../anchoredNodes'

import type { Graph, GraphEdge, GraphNode, NodeSegment } from '../types'

// A base-level graph chops its sequence into short nodes at every variant and
// every kilobase, so a cut of it is thousands of nodes strung in unbranching
// runs. FMMM only needs the runs: each becomes one node, laid out as one
// chain, and its positions are split back onto the members afterwards, so the
// drawing, the hit index and the labels never see the merged graph.
//
// A node joins the run before it when the run's end side and the node's start
// side each hold exactly one link, and it is that link read forward. Sides, not
// in- and out-edges: a graph holds one node per segment, so `L a + b -` joins
// b's END, and counting it as an in-edge of b both merged across it and handed
// the engine a link attached at the wrong end. A self loop keeps its node alone.

export interface MergedRuns {
  graph: Graph
  // merged node id to the member ids in chain order; a run of one is absent
  runs: Map<string, string[]>
}

type Side = 'start' | 'end'

// The strand a node's id carries, which is the one its drawn chain reads.
function ownStrand(id: string) {
  return id.endsWith('-') ? '-' : '+'
}

function flip(strand: '+' | '-') {
  return strand === '+' ? '-' : '+'
}

function sidesOf(edge: GraphEdge) {
  const from: Side =
    (edge.fromStrand ?? ownStrand(edge.from)) === ownStrand(edge.from)
      ? 'end'
      : 'start'
  const to: Side =
    (edge.toStrand ?? ownStrand(edge.to)) === ownStrand(edge.to)
      ? 'start'
      : 'end'
  return { from, to }
}

export function mergeRuns(graph: Graph): MergedRuns {
  const sides = graph.edges.map(sidesOf)
  // node side -> indexes of the edges attached there
  const at = new Map<string, number[]>()
  const attach = (id: string, side: Side, ei: number) => {
    const key = `${id}|${side}`
    const list = at.get(key)
    if (list) {
      list.push(ei)
    } else {
      at.set(key, [ei])
    }
  }
  graph.edges.forEach((edge, ei) => {
    attach(edge.from, sides[ei]!.from, ei)
    attach(edge.to, sides[ei]!.to, ei)
  })
  // the edge that carries node `a`'s run on into the next node, if one does
  const joinAfter = (a: string) => {
    const out = at.get(`${a}|end`)
    if (out?.length !== 1) {
      return undefined
    }
    const ei = out[0]!
    const edge = graph.edges[ei]!
    return edge.from === a &&
      edge.to !== a &&
      sides[ei]!.from === 'end' &&
      sides[ei]!.to === 'start' &&
      at.get(`${edge.to}|start`)?.length === 1
      ? ei
      : undefined
  }
  const joined = new Set<number>()
  const runOf = new Map<string, string>()
  const runs = new Map<string, string[]>()
  for (const node of graph.nodes) {
    const into = at.get(`${node.id}|start`)
    const pred = into?.length === 1 ? graph.edges[into[0]!]!.from : undefined
    if (
      runOf.has(node.id) ||
      (pred !== undefined && joinAfter(pred) === into![0])
    ) {
      continue
    }
    const run = [node.id]
    for (;;) {
      const ei = joinAfter(run.at(-1)!)
      const next = ei === undefined ? undefined : graph.edges[ei]!.to
      if (next === undefined || runOf.has(next)) {
        break
      }
      joined.add(ei!)
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
  // A link can only reach a run at its free ends, the first member's start and
  // the last's end, since every inner side holds exactly the join. So a
  // member's side is the run's side, and a flipped one crosses over as the
  // strand opposite the run's own.
  const seen = new Set<string>()
  const edges: GraphEdge[] = []
  graph.edges.forEach((edge, ei) => {
    const from = runOf.get(edge.from)!
    const to = runOf.get(edge.to)!
    const side = sides[ei]!
    const key = `${from}|${side.from}>${to}|${side.to}`
    if (joined.has(ei) || seen.has(key)) {
      return
    }
    seen.add(key)
    edges.push({
      from,
      to,
      ...(side.from === 'start' ? { fromStrand: flip(ownStrand(from)) } : {}),
      ...(side.to === 'end' ? { toStrand: flip(ownStrand(to)) } : {}),
    })
  })
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
