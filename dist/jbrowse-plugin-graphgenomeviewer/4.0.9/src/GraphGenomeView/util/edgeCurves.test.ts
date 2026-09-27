import { EdgeSpatialIndex } from './SpatialIndex'
import { baseEdgeCurves } from './edgeCurves'
import { buildGeometry } from '../renderer/GeometryBuilder'

import type { Graph, GraphNode, NodeSegment } from '../types'

const nodes: GraphNode[] = [
  { id: 'a+', name: 'a', length: 100, depth: 1 },
  { id: 'b+', name: 'b', length: 100, depth: 1 },
]
const graph = {
  name: 'test',
  nodes,
  edges: [{ from: 'a+', to: 'b+' }],
} satisfies Graph

function layout(): Record<string, NodeSegment[]> {
  return {
    'a+': [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
    'b+': [
      { x: 200, y: 0 },
      { x: 300, y: 0 },
    ],
  }
}

const iso = { scaleX: 1, scaleY: 1 }

test('the same layout at the same zoom is derived once', () => {
  const positions = layout()
  expect(baseEdgeCurves(positions, graph, iso, undefined, 0)).toBe(
    baseEdgeCurves(positions, graph, iso, undefined, 0),
  )
})

// The reason this is shared at all: the drawing and the hit index used to build
// this curve separately, per edge, from identical arguments — so the index's
// whole construction was mostly work the geometry pass had just done. Asserted
// by object identity rather than by shape, because equal-looking curves derived
// twice is exactly the state this replaced.
test('the drawing and the hit index draw from the same curve objects', () => {
  const positions = layout()
  const shared = baseEdgeCurves(positions, graph, iso, undefined, 0)
  const batch = buildGeometry({
    nodePositions: positions,
    graph,
    nodeById: new Map(nodes.map(n => [n.id, n])),
    colorScheme: 'uniform',
    contigThickness: 10,
    connectorThickness: 4,
    drawPaths: false,
    axis: iso,
  })
  const index = new EdgeSpatialIndex(positions, graph, false, iso)
  expect(batch.edgeCurves[0]!.curves).toBe(shared.get(0))
  expect(index.getCurves(0)).toBe(shared.get(0))
})

// A zoom changes the curve — control-point extension is clamped in screen terms
// — so the scales are part of the key rather than something the layout stands
// in for.
test('a zoom re-derives', () => {
  const positions = layout()
  const before = baseEdgeCurves(positions, graph, iso, undefined, 0)
  expect(
    baseEdgeCurves(positions, graph, { scaleX: 4, scaleY: 4 }, undefined, 0),
  ).not.toBe(before)
})

// A node drag moves the position objects without replacing them, so their
// identity cannot report it and the version is the only thing that can. Getting
// this wrong is silent: the drawing follows the node and the curves attached to
// it do not.
test('a version bump re-derives positions mutated in place', () => {
  const positions = layout()
  const before = baseEdgeCurves(positions, graph, iso, undefined, 0).get(0)![0]!
  for (const seg of positions['a+']!) {
    seg.y += 40
  }
  const after = baseEdgeCurves(positions, graph, iso, undefined, 1).get(0)![0]!
  expect(after.y0).toBeCloseTo(before.y0 + 40, 5)
})

// An edge whose endpoints the layout never placed has no curve, and its absence
// is the same "skip it" every consumer already applies to a missing node.
test('an edge with an unplaced endpoint has no curve', () => {
  const positions = layout()
  delete positions['b+']
  expect(baseEdgeCurves(positions, graph, iso, undefined, 0).has(0)).toBe(false)
})
