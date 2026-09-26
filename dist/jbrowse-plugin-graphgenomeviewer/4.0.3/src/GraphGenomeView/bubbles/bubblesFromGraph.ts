import { SATURATED_PATH_COUNT } from '../../MinigraphBubbleAdapter/bubbleLine'
import { isBackbone } from '../anchoredNodes'
import { referenceOrder } from '../layout/orderedLayout'

import type {
  BubbleRoute,
  MinigraphBubble,
} from '../../MinigraphBubbleAdapter/bubbleLine'
import type { Graph, GraphNode } from '../types'

// Bubbles from the graph alone, off the reference order the ordered layout is
// also drawn from (referenceOrder): a backbone node no link reaches across is a
// bubble boundary, and whatever sorts between two consecutive boundaries is a
// bubble. Needs a reference, not an index, so it works on a GBZ cut, a pggb
// file and the inside of a popped superbubble alike.
//
// Read off the order itself, not off the layers the drawing puts it in. A
// layer is where a node is drawn, and one nothing leads into is drawn in the
// first layer wherever it sorts. That is every node a walk enters the cut at,
// the ordinary shape of a GBZ cut whose context stops short of a haplotype's
// walk: its link into the backbone then crossed every layer between, and the
// bubbles on either side of those boundaries fused into one.
//
// Route statistics come from the walks when the graph has paths (exact, and
// immune to a repeat array whose copies the order cannot direct), and from a
// DP over the ordered DAG otherwise. A reversed stretch comes out as one
// bubble whose interior runs against the reference, not as an inversion flag.

interface Routes {
  min: number
  max: number
  n: number
}

export function bubblesFromGraph(graph: Graph): MinigraphBubble[] {
  if (!graph.nodes.some(isBackbone)) {
    return []
  }
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const order = referenceOrder(graph)
  const indexOf = new Map(order.map((id, i) => [id, i]))
  // how many links reach across each place in the order, as a running sum of
  // where each one starts and stops
  const reach = new Int32Array(order.length + 1)
  // successors as a set: a repeat's back edge is the same DAG edge as its
  // forward one, and counting it twice doubles every route through the copy
  const succ = new Map<string, Set<string>>()
  const linked = new Set<string>()
  for (const e of graph.edges) {
    const a = indexOf.get(e.from)
    const b = indexOf.get(e.to)
    if (a === undefined || b === undefined || a === b) {
      continue
    }
    linked.add(`${e.from}>${e.to}`).add(`${e.to}>${e.from}`)
    const [lo, hi] = a < b ? [a, b] : [b, a]
    reach[lo + 1]!++
    reach[hi]!--
    const [from, to] = a < b ? [e.from, e.to] : [e.to, e.from]
    ;(succ.get(from) ?? succ.set(from, new Set()).get(from)!).add(to)
  }
  for (let i = 1; i < reach.length; i++) {
    reach[i]! += reach[i - 1]!
  }
  // Boundaries are nodes: every backbone node no link reaches across, plus the
  // window's first and last backbone node whatever reaches across them, since a
  // repeat array whose copies reach the last backbone node would otherwise
  // never close.
  const backbone = graph.nodes
    .filter(isBackbone)
    .sort((a, b) => a.stable.start - b.stable.start)
  const ends = new Set([backbone[0]!.id, backbone.at(-1)!.id])
  const boundaries = backbone
    .map(node => [node, indexOf.get(node.id)!] as const)
    .filter(([node, i]) => ends.has(node.id) || reach[i] === 0)
    .sort(([a, ia], [b, ib]) => ia - ib || a.stable.start - b.stable.start)
  const walkIndex = graph.paths?.map(p => {
    const at = new Map<string, number>()
    p.nodeIds.forEach((id, i) => {
      if (!at.has(id)) {
        at.set(id, i)
      }
    })
    return at
  })

  const bubbles: MinigraphBubble[] = []
  for (let i = 0; i + 1 < boundaries.length; i++) {
    const [start, i0] = boundaries[i]!
    const [end, i1] = boundaries[i + 1]!
    const interior = order.slice(i0 + 1, i1)
    if (interior.length === 0) {
      continue
    }

    const best = new Map<string, Routes>([[start.id, { min: 0, max: 0, n: 1 }]])
    for (const id of [start.id, ...interior]) {
      const cur = best.get(id)
      if (!cur) {
        continue
      }
      for (const t of succ.get(id) ?? []) {
        const ti = indexOf.get(t)!
        if (ti > i1) {
          continue
        }
        const add = t === end.id ? 0 : byId.get(t)!.length
        const prev = best.get(t)
        best.set(t, {
          min: Math.min(prev?.min ?? Infinity, cur.min + add),
          max: Math.max(prev?.max ?? -Infinity, cur.max + add),
          n: Math.min(SATURATED_PATH_COUNT, cur.n + (prev?.n ?? 0)),
        })
      }
    }
    const walked =
      walkIndex && walkRoutes(graph, byId, walkIndex, start.id, end.id)
    const crossed = walked?.n ? walked : undefined
    const routes = crossed ?? best.get(end.id) ?? { min: 0, max: 0, n: 0 }
    // A walk that enters the bubble and never reaches its other end left the
    // cut: a GBZ cut of a repeat array at 1 kb of context splits each
    // haplotype's walk into pieces, and the routes seen are then a floor.
    const walksLeave = walked !== undefined && walked.left > 0

    const refStart = start.stable.start + start.length
    const refEnd = end.stable.start
    // The reference route exists in the cut only if every backbone pair inside
    // is linked; a flank the hop reached from an allele is not.
    const chain = [
      start.id,
      ...interior.filter(id => isBackbone(byId.get(id)!)),
      end.id,
    ]
    const chainBroken = chain.some(
      (id, k) => k > 0 && !linked.has(`${chain[k - 1]}>${id}`),
    )
    const partial = chainBroken || walksLeave
    const fallback = chainBroken && !crossed
    bubbles.push({
      refName: start.stable.refName,
      start: refStart,
      end: refEnd,
      segmentCount: interior.length + 2,
      pathCount: routes.n,
      // a real inversion test needs each walk's direction relative to the
      // reference; the first visit's strand is just whichever path anchored the
      // node
      inversion: false,
      shortestAlleleLength: fallback ? refEnd - refStart : routes.min,
      longestAlleleLength: fallback ? refEnd - refStart : routes.max,
      segments: [start, ...interior.map(id => byId.get(id)!), end]
        .map(n => n.name)
        .join(','),
      shortestAllele: undefined,
      longestAllele: undefined,
      partial,
      routes: crossed?.routes,
    })
  }
  return bubbles
}

// For every walk that passes both boundary nodes, the bp between them and the
// step sequence, so routes are distinct sequences and lengths are the true
// haplotype lengths. `left` counts the walks that pass one boundary and end
// before the other.
//
// `byId` is the caller's: this runs once per bubble, and a map of every node
// built here made the whole pass quadratic, seven seconds at 15k nodes.
function walkRoutes(
  graph: Graph,
  byId: Map<string, GraphNode>,
  walkIndex: Map<string, number>[],
  startId: string,
  endId: string,
): (Routes & { left: number; routes: BubbleRoute[] }) | undefined {
  const seen = new Map<string, BubbleRoute>()
  let min = Infinity
  let max = -Infinity
  let left = 0
  graph.paths!.forEach((p, k) => {
    const i0 = walkIndex[k]!.get(startId)
    const i1 = walkIndex[k]!.get(endId)
    if (i0 === undefined || i1 === undefined) {
      if (i0 !== undefined || i1 !== undefined) {
        left++
      }
      return
    }
    // Start to end, whichever way the walk crosses: a contig on the reverse
    // strand takes the same route, and read end-first it keyed as a second one.
    const steps = p.nodeIds.slice(Math.min(i0, i1) + 1, Math.max(i0, i1))
    if (i1 < i0) {
      steps.reverse()
    }
    let bp = 0
    for (const id of steps) {
      bp += byId.get(id)?.length ?? 0
    }
    const key = steps.join(',')
    const route = seen.get(key) ?? { steps, bp, walks: [] }
    route.walks.push(p.name)
    seen.set(key, route)
    min = Math.min(min, bp)
    max = Math.max(max, bp)
  })
  return seen.size || left
    ? { min, max, n: seen.size, left, routes: [...seen.values()] }
    : undefined
}
