import { readFileSync } from 'fs'

import { anchoredLayout } from './anchoredLayout'
import { projectAlleles } from '../../alleleProjection/projectAlleles'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { anchorGraph } from '../pathAnchoring'
import { computeEdgeCurves } from '../util/geometry'

import type { ProjectedAllele } from '../../alleleProjection/projectAlleles'
import type { Graph, GraphEdge, NodeSegment } from '../types'
import type { BezierCurve } from '../util/geometry'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

// A bubble is drawn by two edges: the one entering an off-reference node and
// the one leaving it. Those two are the only pair a reader reads as one shape,
// so a crossing between them is a drawing artifact rather than the graph
// genuinely branching, and it is checkable without looking at a picture.
//
// It was not hypothetical: every allele narrower than the visibility floor drew
// as a crossed bowtie, which is what a review of pangenome/local_subgraph
// called "the bezier curves to rank 1 are weird".

function gfa(name: string) {
  return readFileSync(require.resolve(`../../../test_data/${name}`), 'utf8')
}

function sample(c: BezierCurve, t: number) {
  const u = 1 - t
  return {
    x:
      u ** 3 * c.x0 +
      3 * u * u * t * c.cx0 +
      3 * u * t * t * c.cx1 +
      t ** 3 * c.x1,
    y:
      u ** 3 * c.y0 +
      3 * u * u * t * c.cy0 +
      3 * u * t * t * c.cy1 +
      t ** 3 * c.y1,
  }
}

// Tessellate a curve list into one polyline, finely enough that a crossing
// cannot slip between two samples at the scale these are drawn.
function polyline(curves: BezierCurve[]) {
  const pts: { x: number; y: number }[] = []
  for (const c of curves) {
    for (let i = 0; i <= 64; i++) {
      pts.push(sample(c, i / 64))
    }
  }
  return pts
}

interface Point {
  x: number
  y: number
}

// Proper (non-touching) segment intersection. Touching is excluded on purpose:
// an entry and an exit edge legitimately share a backbone point when the allele
// they wrap is a pure insertion.
function segmentsCross(a1: Point, a2: Point, b1: Point, b2: Point) {
  const cross = (p: Point, q: Point, r: Point) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
  const d1 = cross(b1, b2, a1)
  const d2 = cross(b1, b2, a2)
  const d3 = cross(a1, a2, b1)
  const d4 = cross(a1, a2, b2)
  return d1 * d2 < 0 && d3 * d4 < 0
}

function polylinesCross(a: Point[], b: Point[]) {
  for (let i = 1; i < a.length; i++) {
    for (let j = 1; j < b.length; j++) {
      if (segmentsCross(a[i - 1]!, a[i]!, b[j - 1]!, b[j]!)) {
        return true
      }
    }
  }
  return false
}

function crossingBubbles(
  graph: Graph,
  positions: Record<string, NodeSegment[]>,
) {
  const curvesFor = (edge: GraphEdge) => {
    const f = positions[edge.from]
    const t = positions[edge.to]
    return f && t
      ? computeEdgeCurves(f, t, edge.from === edge.to, 0, 0, iso())
      : undefined
  }
  const crossing: string[] = []
  let checked = 0
  for (const node of graph.nodes) {
    const pos = positions[node.id]
    // y 0 is the backbone row; only an off-reference node has a bubble
    if (pos && pos[0]!.y !== 0) {
      const entry = graph.edges.find(
        e => e.to === node.id && e.from !== node.id,
      )
      const exit = graph.edges.find(e => e.from === node.id && e.to !== node.id)
      const ec = entry ? curvesFor(entry) : undefined
      const xc = exit ? curvesFor(exit) : undefined
      if (ec && xc) {
        checked++
        if (polylinesCross(polyline(ec), polyline(xc))) {
          crossing.push(node.id)
        }
      }
    }
  }
  return { crossing, checked }
}

test('no bubble crosses itself on the pggb subgraph', () => {
  const graph = anchorGraph(
    convertGFAToGraph(parseGFA(gfa('ecoli_pggb_subgraph.gfa'))),
    'K12',
  )
  const { crossing, checked } = crossingBubbles(
    graph,
    anchoredLayout(graph)!.nodePositions,
  )
  // so the assertion below cannot pass by checking nothing
  expect(checked).toBeGreaterThan(5)
  expect(crossing).toEqual([])
})

// The rGFA slice, whose runs are deep multi-rank bubble chains rather than the
// pggb subgraph's mostly-single-segment alleles, so it is the fixture that
// exercises where a member sits *within* its run. It used to fail this check
// because placeOffReference concatenated a run in collectRun's DFS pop order:
// on the 21-node allele at K12#1#chr:1,196,361-1,223,579 that put graph
// neighbours 26 kb apart, and the edges spanning those gaps drew the long X in
// the pangenome/rgfa_subgraph_launch figure.
//
// The rGFA slice also carries reverse-complement links, which used to be
// excluded here: `L s381 - s2087 +` and `L s2087 + s378 -` say NCTC86 crosses
// that locus right to left, the first link touching s381's LEFT end and the
// second s378's RIGHT end, and an edge drawn unconditionally from the source's
// last point to the target's first ran 7 kb backwards over the segment it
// rejoins. GraphEdge carries each link's strands as `sides` now, so no
// exclusion: every bubble in the slice is checked.
test('no bubble crosses itself on the rGFA slice', () => {
  const graph = convertGFAToGraph(parseGFA(gfa('ecoli_rgfa_slice.gfa')))
  const { crossing, checked } = crossingBubbles(
    graph,
    anchoredLayout(graph)!.nodePositions,
  )
  expect(checked).toBeGreaterThan(5)
  expect(crossing).toEqual([])
})

// The placement property the crossing check rests on, stated on its own so a
// regression says which of the two broke: two members joined by an edge occupy
// disjoint x, so the edge spans the gap between them rather than doubling back
// over one of them. Which of the two is on the left is deliberately not
// asserted — a GFA states a reverse-complement link backwards (`L s1751 -
// s1292 -` is the forward edge s1292 -> s1751), so from/to carries no direction
// to sort on, and the sweep orders a run by distance from its entry anchor.
test('two members joined by an edge do not overlap in x', () => {
  const graph = convertGFAToGraph(parseGFA(gfa('ecoli_rgfa_slice.gfa')))
  const positions = anchoredLayout(graph)!.nodePositions
  const runOf = new Map<string, ProjectedAllele>()
  for (const allele of projectAlleles(graph)) {
    for (const id of allele.nodeIds) {
      runOf.set(id, allele)
    }
  }
  const overlapping = graph.edges.filter(e => {
    const run = runOf.get(e.from)
    const from = positions[e.from]
    const to = positions[e.to]
    return (
      run !== undefined &&
      runOf.get(e.to) === run &&
      from !== undefined &&
      to !== undefined &&
      to[0]!.x < from[1]!.x &&
      from[0]!.x < to[1]!.x
    )
  })
  expect(overlapping).toEqual([])
})
