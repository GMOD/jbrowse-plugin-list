import type { Graph, NodeSegment } from '@jbrowse/bandage-core/types'

type Positions = Record<string, NodeSegment[]>
type Strand = '+' | '-' | undefined

// a link as one of its nodes sees it: the node at its other end, and which
// end of that node it attaches to
interface Attachment {
  id: string
  strand: Strand
  leaving: boolean
}

export interface PaneTransform {
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
}

// Morphs above this many nodes snap instead: each frame rebuilds the
// geometry, which past it no longer fits a frame (GRAPH_SCALE_AND_LOD.md)
export const MORPH_MAX_NODES = 3000
export const MORPH_MS = 350
// the most of the morph one frame may take, so a busy main thread delays
// the motion rather than skipping it
export const MORPH_MAX_STEP_MS = 34

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

// `line` as `count` points spaced evenly along its length
function resample(line: NodeSegment[], count: number): NodeSegment[] {
  if (line.length === 1 || count === 1) {
    return Array.from({ length: count }, () => ({ ...line[0]! }))
  }
  const arc = arcPrefix(line)
  const total = arc.at(-1)!
  const out: NodeSegment[] = []
  let j = 1
  for (let k = 0; k < count; k++) {
    const at = (total * k) / (count - 1)
    while (j < line.length - 1 && arc[j]! < at) {
      j++
    }
    const span = arc[j]! - arc[j - 1]!
    const f = span > 0 ? (at - arc[j - 1]!) / span : 0
    const a = line[j - 1]!
    const b = line[j]!
    out.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f })
  }
  return out
}

// Sweeps of the relaxation that places nodes new to a cut; a chain of n new
// nodes bridging two shared ones converges in about n² of them
const RELAX_SWEEPS = 400

// the point of `line` a link attaches to: it leaves the end of `from` and
// arrives at the start of `to`, each as its strand reads the node
function attachPoint(line: NodeSegment[], strand: Strand, leaving: boolean) {
  return leaving === (strand !== '-') ? line.at(-1)! : line[0]!
}

// Where each node of `next` starts a morph from the drawing `prev` left on
// screen. A node both share starts where it was drawn, carried through the
// old transform onto the screen and back through the new one. A node new to
// the drawing starts collapsed on one point, the mean of where its links
// attach to its neighbours, so a new flank grows out of the node it hangs
// from and a new allele out of the line between its two ends. Collapsing on
// one neighbour stretched the link to the other across the pane: 289 px on
// the first frame of a 2x bovine zoom-out, against 162 px this way.
// Anything no shared node reaches starts where it ends. Each start has its
// end's point count, so a frame is a pointwise blend.
export function morphStarts(
  prev: Positions,
  prevTransform: PaneTransform,
  next: Positions,
  nextTransform: PaneTransform,
  edges: Graph['edges'],
): Positions {
  const toNext = (p: NodeSegment) => ({
    x:
      (p.x * prevTransform.scaleX +
        prevTransform.translateX -
        nextTransform.translateX) /
      nextTransform.scaleX,
    y:
      (p.y * prevTransform.scaleY +
        prevTransform.translateY -
        nextTransform.translateY) /
      nextTransform.scaleY,
  })
  const starts: Positions = {}
  for (const [id, line] of Object.entries(next)) {
    const before = prev[id]
    if (before?.length && line.length) {
      starts[id] = resample(before.map(toNext), line.length)
    }
  }

  const neighbours = new Map<string, Attachment[]>()
  const link = (id: string, other: Attachment) => {
    const list = neighbours.get(id)
    if (list) {
      list.push(other)
    } else {
      neighbours.set(id, [other])
    }
  }
  for (const { from, to, fromStrand, toStrand } of edges) {
    if (from !== to && next[from]?.length && next[to]?.length) {
      link(from, { id: to, strand: toStrand, leaving: false })
      link(to, { id: from, strand: fromStrand, leaving: true })
    }
  }

  const point = new Map<string, NodeSegment>()
  const attachedAt = (n: Attachment) =>
    point.get(n.id) ?? attachPoint(starts[n.id]!, n.strand, n.leaving)
  const queue = Object.keys(starts)
  const placed: string[] = []
  for (const id of queue) {
    for (const n of neighbours.get(id) ?? []) {
      if (starts[n.id] || point.has(n.id)) {
        continue
      }
      const back = neighbours.get(n.id)!.find(m => m.id === id)!
      point.set(n.id, { ...attachedAt(back) })
      queue.push(n.id)
      placed.push(n.id)
    }
  }
  for (let sweep = 0; sweep < RELAX_SWEEPS; sweep++) {
    let moved = 0
    for (const id of placed) {
      const list = neighbours.get(id)!
      let x = 0
      let y = 0
      for (const n of list) {
        const p = attachedAt(n)
        x += p.x
        y += p.y
      }
      const p = point.get(id)!
      x /= list.length
      y /= list.length
      moved = Math.max(moved, Math.abs(x - p.x) + Math.abs(y - p.y))
      p.x = x
      p.y = y
    }
    if (moved < 1e-9) {
      break
    }
  }
  for (const id of placed) {
    const p = point.get(id)!
    starts[id] = next[id]!.map(() => ({ ...p }))
  }
  for (const [id, line] of Object.entries(next)) {
    starts[id] ??= line.map(p => ({ ...p }))
  }
  return starts
}

function nearest(line: NodeSegment[], p: NodeSegment) {
  let best = 0
  let bestDistance = Infinity
  line.forEach((q, k) => {
    const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2
    if (d < bestDistance) {
      bestDistance = d
      best = k
    }
  })
  return best
}

// Where each deletion route starts: its end shape moved as its two nodes
// move, each point by the blend of the displacements at the node points its
// ends attach to. Routes are keyed `from>to`.
export function routeStarts(
  routes: Positions,
  nodeStarts: Positions,
  nodeEnds: Positions,
): Positions {
  const shift = (id: string, at: NodeSegment) => {
    const a = nodeStarts[id]
    const b = nodeEnds[id]
    if (!a || !b || b.length === 0) {
      return { x: 0, y: 0 }
    }
    const k = nearest(b, at)
    return { x: a[k]!.x - b[k]!.x, y: a[k]!.y - b[k]!.y }
  }
  return Object.fromEntries(
    Object.entries(routes).map(([key, line]) => {
      const [from = '', to = ''] = key.split('>')
      const d0 = shift(from, line[0]!)
      const d1 = shift(to, line.at(-1)!)
      return [
        key,
        line.map((p, k) => {
          const f = line.length > 1 ? k / (line.length - 1) : 0
          return {
            x: p.x + d0.x + (d1.x - d0.x) * f,
            y: p.y + d0.y + (d1.y - d0.y) * f,
          }
        }),
      ]
    }),
  )
}

export function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

// Writes the blend of `starts` and `ends` at `t` into `into` IN PLACE, the
// way a node drag moves positions (settingActions' moveNode)
export function blendInto(
  into: Positions,
  starts: Positions,
  ends: Positions,
  t: number,
) {
  for (const [id, line] of Object.entries(into)) {
    const a = starts[id]
    const b = ends[id]
    if (!a || !b) {
      continue
    }
    line.forEach((p, k) => {
      p.x = t === 1 ? b[k]!.x : a[k]!.x + (b[k]!.x - a[k]!.x) * t
      p.y = t === 1 ? b[k]!.y : a[k]!.y + (b[k]!.y - a[k]!.y) * t
    })
  }
}
