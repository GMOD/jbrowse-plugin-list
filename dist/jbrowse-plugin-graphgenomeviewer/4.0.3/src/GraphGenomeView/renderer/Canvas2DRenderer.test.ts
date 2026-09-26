import { Canvas2DRenderer } from './Canvas2DRenderer'
import { buildGeometry } from './GeometryBuilder'
import { recordingCanvas } from './recordingCanvas'

import type { TransformUniform } from './types'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

function makeRenderer() {
  const { canvas, strokes, fills, lineWidths, points } = recordingCanvas()
  return {
    renderer: new Canvas2DRenderer(canvas),
    strokes,
    fills,
    lineWidths,
    points,
  }
}

const TRANSFORM: TransformUniform = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  dpr: 1,
}

// three nodes in a row wired A -> B -> C, so edge 0 and edge 1 are distinct
// strokes and a highlight on one must not touch the other
const nodes = [
  { id: 'A+', name: 'A', length: 10, depth: 1 },
  { id: 'B+', name: 'B', length: 10, depth: 1 },
  { id: 'C+', name: 'C', length: 10, depth: 1 },
]

function batchOf2Edges() {
  return buildGeometry({
    nodePositions: {
      'A+': [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'B+': [
        { x: 40, y: 0 },
        { x: 50, y: 0 },
      ],
      'C+': [
        { x: 80, y: 0 },
        { x: 90, y: 0 },
      ],
    },
    graph: {
      name: 'test',
      nodes,
      edges: [
        { from: 'A+', to: 'B+' },
        { from: 'B+', to: 'C+' },
      ],
    },
    nodeById: new Map(nodes.map(n => [n.id, n])),
    colorScheme: 'uniform',
    contigThickness: 10,
    connectorThickness: 4,
    drawPaths: false,
    axis: iso(),
  })
}

function channels(rgba: string) {
  const m = /rgba\((\d+),(\d+),(\d+)/.exec(rgba)
  return [Number(m?.[1]), Number(m?.[2]), Number(m?.[3])]
}

function expectBrighter(a: string, b: string) {
  const [r, g, bl] = channels(a)
  const [br, bg, bb] = channels(b)
  expect(r).toBeGreaterThan(br!)
  expect(g).toBeGreaterThan(bg!)
  expect(bl).toBeGreaterThan(bb!)
}

// Two edges of one colour and weight, three nodes of one colour: a drawing is
// mostly runs of one paint, and each run is one path. This is the whole
// performance story of the renderer, so it is pinned exactly.
test('strokes every edge of one paint as one path, and every node likewise', () => {
  const { renderer, strokes } = makeRenderer()
  renderer.uploadGeometry(batchOf2Edges())
  renderer.updateTransform(TRANSFORM)
  renderer.render([1, 1, 1, 1])

  expect(strokes).toHaveLength(2)
})

test('a highlighted edge is stroked brighter, apart from its neighbour', () => {
  const { renderer, strokes } = makeRenderer()
  renderer.uploadGeometry(batchOf2Edges())
  renderer.updateTransform(TRANSFORM)
  renderer.render([1, 1, 1, 1])
  const [edges, nodeStroke] = strokes as [string, string]

  strokes.length = 0
  renderer.setEdgeHighlight(1, 1.6)
  renderer.render([1, 1, 1, 1])

  // edge 0 in its own path, then the nodes, then edge 1 on top of everything
  expect(strokes).toEqual([edges, expect.any(String), nodeStroke])
  expect(strokes[1]).not.toBe(edges)
  expectBrighter(strokes[1]!, edges)
})

test('clearing the highlight restores the base stroke', () => {
  const { renderer, strokes } = makeRenderer()
  renderer.uploadGeometry(batchOf2Edges())
  renderer.updateTransform(TRANSFORM)
  renderer.setEdgeHighlight(0, 1.6)
  renderer.render([1, 1, 1, 1])
  expect(strokes).toHaveLength(3)

  strokes.length = 0
  renderer.setEdgeHighlight(null, 1.6)
  renderer.render([1, 1, 1, 1])

  expect(strokes).toHaveLength(2)
})

// A rebuild renumbers the strokes, so an edge captured against the old batch
// could brighten an unrelated one. The model re-applies the current hover after
// every upload; the renderer's job is not to keep pointing at a stale run.
test('uploading a new batch drops the previous edge highlight', () => {
  const { renderer, strokes } = makeRenderer()
  renderer.uploadGeometry(batchOf2Edges())
  renderer.updateTransform(TRANSFORM)
  renderer.setEdgeHighlight(1, 1.6)
  renderer.render([1, 1, 1, 1])
  expect(strokes).toHaveLength(3)

  strokes.length = 0
  renderer.uploadGeometry(batchOf2Edges())
  renderer.render([1, 1, 1, 1])

  expect(strokes).toHaveLength(2)
})

// Node highlights are keyed by id rather than by position in the batch, so
// they survive a rebuild on their own and the hovered node lands on top.
test('a highlighted node is stroked brighter, last, and survives a rebuild', () => {
  const { renderer, strokes } = makeRenderer()
  renderer.uploadGeometry(batchOf2Edges())
  renderer.updateTransform(TRANSFORM)
  renderer.render([1, 1, 1, 1])
  const nodeStroke = strokes[1]!

  strokes.length = 0
  renderer.setNodeHighlights(new Map([['B+', 1.4]]))
  renderer.render([1, 1, 1, 1])
  expect(strokes).toHaveLength(3)
  expect(strokes[1]).toBe(nodeStroke)
  expectBrighter(strokes[2]!, nodeStroke)

  strokes.length = 0
  renderer.uploadGeometry(batchOf2Edges())
  renderer.render([1, 1, 1, 1])
  expect(strokes).toHaveLength(3)
})

// A thickness is quoted in CSS pixels and expanded AFTER the transform, so it
// is the one term the dpr-scaled transform does not reach. Left alone, every
// tube, connector and arrowhead came out 1/dpr of its weight on a hidpi
// display, with the positions between them correct.
//
// Asserted as "twice the backing-store pixels at twice the ratio", which is the
// same drawing in css px. The whole point is that a figure does not change
// weight with the machine it is opened on.
describe('a thickness is css pixels, whatever the device ratio', () => {
  function drawn(dpr: number) {
    const { renderer, points, lineWidths } = makeRenderer()
    renderer.uploadGeometry(batchOf2Edges())
    renderer.updateTransform({ ...TRANSFORM, scaleX: dpr, scaleY: dpr, dpr })
    renderer.render([1, 1, 1, 1])
    const xs = points.map(p => p.x)
    return {
      spanPx: Math.max(...xs) - Math.min(...xs),
      edgeWidth: lineWidths[0]!,
      nodeWidth: lineWidths[1]!,
    }
  }

  test('positions go through the transform', () => {
    // three 10-unit nodes over a 90-unit span
    expect(drawn(1).spanPx).toBeCloseTo(90, 5)
    expect(drawn(2).spanPx).toBeCloseTo(180, 5)
  })

  test('a node stroke scales its width with the ratio', () => {
    expect(drawn(1).nodeWidth).toBeCloseTo(10, 5)
    expect(drawn(2).nodeWidth).toBeCloseTo(20, 5)
  })

  test('an edge stroke scales its width with the ratio', () => {
    // connectorThickness 4 is a half-width of 2, so a 4 px stroke at ratio 1
    expect(drawn(1).edgeWidth).toBeCloseTo(4, 5)
    expect(drawn(2).edgeWidth).toBeCloseTo(8, 5)
  })
})
