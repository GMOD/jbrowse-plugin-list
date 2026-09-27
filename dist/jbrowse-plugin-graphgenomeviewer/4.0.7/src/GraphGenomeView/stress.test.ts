import { parseGFA } from '../gfa-core/index'
import { convertGFAToGraph } from './gfa/gfaConverter'
import { Canvas2DRenderer } from './renderer/Canvas2DRenderer'
import { buildGeometry } from './renderer/GeometryBuilder'
import { recordingCanvas } from './renderer/recordingCanvas'

import type { GraphNode, NodeSegment } from './types'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

// Builds a linear chain of `bubbleCount` diamond bubbles. Each bubble is
// source -> {altA, altB} -> sink, and the sink is shared with the next
// bubble's source, so the whole thing is one connected component shaped like
// a real pangenome backbone with biallelic variant sites.
//
// node count  = 3 * bubbleCount + 1
// link count  = 4 * bubbleCount
function generateBubbleGFA(bubbleCount: number) {
  const lines: string[] = ['H\tVN:Z:1.0']
  const segId = (i: number) => i + 1
  const totalNodes = 3 * bubbleCount + 1

  for (let i = 0; i < totalNodes; i++) {
    lines.push(`S\t${segId(i)}\tACGTACGT`)
  }

  // Anchor (backbone) node ids: 0, 3, 6, ... ; alts for bubble b are 3b+1, 3b+2
  const refPath: number[] = [segId(0)]
  const altPath: number[] = [segId(0)]
  for (let b = 0; b < bubbleCount; b++) {
    const source = segId(3 * b)
    const altA = segId(3 * b + 1)
    const altB = segId(3 * b + 2)
    const sink = segId(3 * b + 3)
    lines.push(
      `L\t${source}\t+\t${altA}\t+\t0M`,
      `L\t${source}\t+\t${altB}\t+\t0M`,
      `L\t${altA}\t+\t${sink}\t+\t0M`,
      `L\t${altB}\t+\t${sink}\t+\t0M`,
    )
    refPath.push(altA, sink)
    altPath.push(altB, sink)
  }

  lines.push(
    `P\tref#0#chr1\t${refPath.map(id => `${id}+`).join(',')}\t*`,
    `P\talt#0#chr1\t${altPath.map(id => `${id}+`).join(',')}\t*`,
  )
  return { gfa: lines.join('\n'), totalNodes, totalLinks: 4 * bubbleCount }
}

// Synthetic 2-segment positions for every node so buildGeometry can run
// without the Bandage WASM layout step (covered by browser tests instead).
function syntheticPositions(nodes: GraphNode[]) {
  const positions: Record<string, NodeSegment[]> = {}
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]!
    positions[n.id] = [
      { x: i * 10, y: 0 },
      { x: i * 10 + 8, y: 0 },
    ]
  }
  return positions
}

test('parse + convert scales to a few thousand bubbles', () => {
  const { gfa, totalNodes, totalLinks } = generateBubbleGFA(2000)

  const t0 = performance.now()
  const gfaGraph = parseGFA(gfa)
  const graph = convertGFAToGraph(gfaGraph, 'stress')
  const elapsed = performance.now() - t0

  expect(gfaGraph.nodes).toHaveLength(totalNodes)
  expect(gfaGraph.links).toHaveLength(totalLinks)
  // forward-strand only graph -> one GraphNode per segment
  expect(graph.nodes).toHaveLength(totalNodes)
  expect(graph.edges).toHaveLength(totalLinks)
  expect(graph.paths).toHaveLength(2)

  // every edge that lies on a path should have pathIds populated
  const edgesWithPaths = graph.edges.filter(e => e.pathIds?.length)
  expect(edgesWithPaths.length).toBeGreaterThan(0)

  // Generous ceiling — a linear pass over ~6k nodes / 8k links is milliseconds;
  // this only trips on an accidental O(n^2) regression, not on a slow runner.
  expect(elapsed).toBeLessThan(5000)
})

test('buildGeometry scales to a few thousand nodes', () => {
  const { gfa, totalNodes } = generateBubbleGFA(2000)
  const graph = convertGFAToGraph(parseGFA(gfa), 'stress')
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
  const nodePositions = syntheticPositions(graph.nodes)

  const t0 = performance.now()
  const batch = buildGeometry({
    nodePositions,
    graph,
    nodeById,
    colorScheme: 'depth',
    contigThickness: 10,
    connectorThickness: 4,
    drawPaths: true,
    axis: iso(),
  })
  const elapsed = performance.now() - t0

  expect(batch.nodeStrokeRuns.size).toBe(totalNodes)
  // striped: every node is on at least one of the two paths
  expect(batch.nodeStrokes.length).toBeGreaterThan(totalNodes)
  expect(batch.edgeCurves.length).toBeGreaterThan(0)
  expect(elapsed).toBeLessThan(5000)
})

test('buildGeometry scaling is roughly linear, not quadratic', () => {
  function timeBuild(bubbleCount: number) {
    const { gfa } = generateBubbleGFA(bubbleCount)
    const graph = convertGFAToGraph(parseGFA(gfa), 'stress')
    const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
    const nodePositions = syntheticPositions(graph.nodes)
    // warm + measure
    const opts = {
      nodePositions,
      graph,
      nodeById,
      colorScheme: 'uniform' as const,
      contigThickness: 10,
      connectorThickness: 4,
      drawPaths: false,
      axis: iso(),
    }
    buildGeometry(opts)
    const t0 = performance.now()
    buildGeometry(opts)
    return performance.now() - t0
  }

  const small = timeBuild(500)
  const large = timeBuild(2000) // 4x the work

  // 4x input should be well under 10x time if scaling is linear. The loose
  // bound tolerates timer noise on small absolute durations while still
  // catching a quadratic blow-up (which would be ~16x).
  expect(large).toBeLessThan(small * 10 + 50)
})

test('viewport culling drops the vast majority of off-screen nodes', () => {
  const { gfa } = generateBubbleGFA(2000)
  const graph = convertGFAToGraph(parseGFA(gfa), 'stress')
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
  const nodePositions = syntheticPositions(graph.nodes)

  // nodes are laid out along x at 10px spacing; this window covers ~50 of them
  const batch = buildGeometry({
    nodePositions,
    graph,
    nodeById,
    colorScheme: 'uniform',
    contigThickness: 10,
    connectorThickness: 4,
    drawPaths: false,
    axis: iso(),
    viewportBounds: { minX: 0, minY: -50, maxX: 500, maxY: 50 },
  })

  expect(batch.nodeStrokeRuns.size).toBeGreaterThan(0)
  expect(batch.nodeStrokeRuns.size).toBeLessThan(graph.nodes.length / 2)
})

// Draw calls per frame, which is what the Canvas2D renderer's cost tracks --
// and unlike wall-clock they are deterministic, so they can be asserted exactly.
// The renderer batches everything drawn with one paint into one path, so the
// count is a function of how many distinct colours and weights the drawing
// uses and not of how many nodes it has. It used to be 12.6 per node, with a
// fill per mesh triangle; see agent-docs/GRAPH_SCALE_AND_LOD.md.
function countDrawCalls(batch: ReturnType<typeof buildGeometry>) {
  const { canvas, strokes, fills } = recordingCanvas()
  const renderer = new Canvas2DRenderer(canvas)
  renderer.uploadGeometry(batch)
  renderer.updateTransform({
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    dpr: 1,
  })
  renderer.render([1, 1, 1, 1])
  return { strokes: strokes.length, fills: fills.length }
}

function uniformBatch(bubbleCount: number) {
  const { gfa } = generateBubbleGFA(bubbleCount)
  const graph = convertGFAToGraph(parseGFA(gfa), 'stress')
  return buildGeometry({
    nodePositions: syntheticPositions(graph.nodes),
    graph,
    nodeById: new Map(graph.nodes.map(n => [n.id, n])),
    colorScheme: 'uniform',
    contigThickness: 10,
    connectorThickness: 4,
    drawPaths: false,
    axis: iso(),
  })
}

test('draw calls per frame do not grow with the graph', () => {
  const small = countDrawCalls(uniformBatch(100))
  const large = countDrawCalls(uniformBatch(500))
  // one paint each for the edges, the nodes and the arrowheads
  expect(small).toEqual({ strokes: 2, fills: 1 })
  expect(large).toEqual(small)
})
