import { describe, test } from 'vitest'

import { deletionEdges } from './deletionEdges'
import { graphLabels } from './graphLabels'
import { buildGeometry, computeReferenceRamp } from './renderer/GeometryBuilder'
import { EdgeSpatialIndex, SpatialIndex } from './util/SpatialIndex'

import type { Graph, GraphNode, NodeSegment } from './types'

// `pnpm bench`. Not part of `pnpm test`: these assert nothing, they report the
// cost of the four passes that run while a user is holding the mouse down.
//
// Which pass runs when, because the difference is the whole point of the
// numbers:
//
//   graphLabels     every mousemove of a pan, undebounced — it places labels in
//                   screen space, so a translate genuinely moves them
//   buildGeometry   once per debounced pan/zoom, and once per frame of a drag
//   the two indexes lazily, on the first mousemove after the positions move
//
// So a millisecond in `graphLabels` costs about ten times what a millisecond in
// `buildGeometry` does, and both are budgeted against the ~10 ms that
// agent-docs/GRAPH_SCALE_AND_LOD.md measures a redraw of a 1-2k node cut at.
//
// Vitest 5 moved `bench` from a top-level export to a test-context fixture:
// each measurement is a `test()` that awaits `bench(name, fn).run()`.

// A bubble-chain rGFA: a rank-0 backbone with an alt allele and a bare deletion
// edge hanging off every other segment. Both anchored layouts draw this shape,
// and it is what the scale notes above were measured on.
function benchGraph(backboneCount: number) {
  const nodes: GraphNode[] = []
  const edges: Graph['edges'] = []
  let pos = 0
  for (let i = 0; i < backboneCount; i++) {
    const length = 300 + (i % 17) * 40
    nodes.push({
      id: `b${i}+`,
      name: `b${i}`,
      length,
      depth: 5,
      stable: { refName: 'chr1', start: pos, rank: 0 },
    })
    pos += length
    if (i > 0) {
      edges.push({ from: `b${i - 1}+`, to: `b${i}+` })
    }
    if (i % 2 === 1 && i > 1) {
      nodes.push({
        id: `a${i}+`,
        name: `a${i}`,
        length: 40 + (i % 7) * 11,
        depth: 2,
        stable: { refName: `HG${i % 40}#1#chr1`, start: i * 100, rank: 1 },
      })
      edges.push({ from: `b${i - 2}+`, to: `a${i}+` })
      edges.push({ from: `a${i}+`, to: `b${i}+` })
      edges.push({ from: `b${i - 2}+`, to: `b${i}+` })
    }
  }
  return { name: 'bench', nodes, edges, anchoredBy: 'tags' } satisfies Graph
}

// The anchored layout's shape: one row per rank, y already in screen px, so the
// two axes are in different units — the case every `yToX` conversion is for.
function benchLayout(graph: Graph) {
  const nodePositions: Record<string, NodeSegment[]> = {}
  for (const node of graph.nodes) {
    const { start, rank } = node.stable!
    nodePositions[node.id] = [
      { x: start, y: rank * 20 },
      { x: start + node.length, y: rank * 20 },
    ]
  }
  return nodePositions
}

const AXIS = { scaleX: 0.01, scaleY: 1 }
const VIEWPORT = { translateX: 40, translateY: 40, width: 900, height: 600 }

for (const backbone of [1000, 5000]) {
  const graph = benchGraph(backbone)
  const nodePositions = benchLayout(graph)
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
  const nodeLengths = new Map(graph.nodes.map(n => [n.id, n.length]))
  const deletions = deletionEdges(graph)
  const bypassed = new Map(deletions.map(d => [d.edgeIndex, d.bypassed]))
  const referenceRamp = computeReferenceRamp(graph, {
    start: 0,
    end: pos(graph),
  })

  describe(`${graph.nodes.length} nodes / ${graph.edges.length} edges`, () => {
    // The pan case: same layout, same zoom, a new translate. Everything a frame
    // can reuse is reused, so this is the number that has to stay small.
    let tx = VIEWPORT.translateX
    test('graphLabels (pan)', async ({ bench }) => {
      await bench('graphLabels (pan)', () => {
        graphLabels({
          nodePositions,
          nodeLengths,
          deletions,
          axis: AXIS,
          ...VIEWPORT,
          translateX: tx++ % 80,
        })
      }).run()
    })

    // The drag case: the positions moved in place, so nothing carries over.
    let version = 0
    test('graphLabels (drag)', async ({ bench }) => {
      await bench('graphLabels (drag)', () => {
        graphLabels({
          nodePositions,
          nodeLengths,
          deletions,
          axis: AXIS,
          ...VIEWPORT,
          version: ++version,
        })
      }).run()
    })

    test('buildGeometry', async ({ bench }) => {
      await bench('buildGeometry', () => {
        buildGeometry({
          nodePositions,
          graph,
          nodeById,
          colorScheme: 'reference-position',
          contigThickness: 10,
          connectorThickness: 4,
          drawPaths: false,
          axis: AXIS,
          referenceRamp,
          deletions: bypassed,
        })
      }).run()
    })

    // Once per graph, feeding the pass above.
    test('computeReferenceRamp', async ({ bench }) => {
      await bench('computeReferenceRamp', () => {
        computeReferenceRamp(graph, { start: 0, end: pos(graph) })
      }).run()
    })

    test('SpatialIndex (nodes)', async ({ bench }) => {
      await bench('SpatialIndex (nodes)', () => {
        new SpatialIndex(nodePositions)
      }).run()
    })

    test('EdgeSpatialIndex', async ({ bench }) => {
      await bench('EdgeSpatialIndex', () => {
        new EdgeSpatialIndex(
          nodePositions,
          graph,
          false,
          AXIS,
          undefined,
          bypassed,
        )
      }).run()
    })
  })
}

function pos(graph: Graph) {
  return graph.nodes.reduce((sum, n) => sum + n.length, 0)
}
