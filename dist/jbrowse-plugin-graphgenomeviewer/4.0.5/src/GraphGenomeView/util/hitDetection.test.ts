import {
  distanceToCubicBezier,
  distanceToSegment,
  findHoveredEdge,
  findHoveredNode,
} from './hitDetection'

import type { Graph } from '../types'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

describe('distanceToSegment', () => {
  test('point on the segment', () => {
    expect(distanceToSegment(5, 0, 0, 0, 10, 0)).toBeCloseTo(0)
  })

  test('point perpendicular to segment midpoint', () => {
    expect(distanceToSegment(5, 3, 0, 0, 10, 0)).toBeCloseTo(3)
  })

  test('point closest to segment start', () => {
    expect(distanceToSegment(-1, 0, 0, 0, 10, 0)).toBeCloseTo(1)
  })

  test('point closest to segment end', () => {
    expect(distanceToSegment(11, 0, 0, 0, 10, 0)).toBeCloseTo(1)
  })

  test('zero-length segment (point)', () => {
    expect(distanceToSegment(3, 4, 0, 0, 0, 0)).toBeCloseTo(5)
  })
})

describe('distanceToCubicBezier', () => {
  test('straight-line bezier at midpoint', () => {
    // control points on the line = straight bezier
    const dist = distanceToCubicBezier(5, 1, 0, 0, 3.3, 0, 6.6, 0, 10, 0)
    expect(dist).toBeLessThan(1.5)
  })

  test('point far from bezier', () => {
    const dist = distanceToCubicBezier(100, 100, 0, 0, 3, 0, 7, 0, 10, 0)
    expect(dist).toBeGreaterThan(100)
  })

  // A deletion arc is routinely this long on screen. Measured to the sampled
  // points alone, a cursor on the curve between two of them read as up to 25
  // away, past the hover tolerance, at most positions along it.
  test('a point on a long curve is on it wherever along it the point lies', () => {
    for (let x = 0; x <= 1000; x += 7) {
      const dist = distanceToCubicBezier(x, 0, 0, 0, 333, 0, 667, 0, 1000, 0)
      expect(dist).toBeLessThan(0.001)
    }
  })

  test('distance off a long curve is the distance to the curve', () => {
    const dist = distanceToCubicBezier(525, 4, 0, 0, 333, 0, 667, 0, 1000, 0)
    expect(dist).toBeCloseTo(4)
  })
})

describe('findHoveredNode', () => {
  const nodePositions = {
    'A+': [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ],
    'B+': [
      { x: 20, y: 20 },
      { x: 30, y: 20 },
    ],
  }

  test('finds node when cursor is on segment', () => {
    expect(findHoveredNode(nodePositions, 5, 0, iso())).toBe('A+')
  })

  test('finds node when cursor is near segment', () => {
    expect(findHoveredNode(nodePositions, 5, 3, iso())).toBe('A+')
  })

  test('returns null when cursor is far from nodes', () => {
    expect(findHoveredNode(nodePositions, 50, 50, iso())).toBeNull()
  })

  test('respects scale for threshold', () => {
    // At scale 10, threshold is 5/10 = 0.5, so a point 3 units away should miss
    expect(findHoveredNode(nodePositions, 5, 3, iso(10))).toBeNull()
  })

  // A node drawn thick by its depth is 18 px across at the defaults, so the
  // pointer can be on its ink 8 px from its centreline. A fixed 5 px missed
  // it there, and the link beside it took the hover instead.
  test('a node answers anywhere on the ink it is drawn with', () => {
    const drawn = {
      halfWidthPx: (id: string) => (id === 'A+' ? 9 : 3),
      maxHalfWidthPx: 9,
    }
    expect(findHoveredNode(nodePositions, 5, 8, iso())).toBeNull()
    expect(findHoveredNode(nodePositions, 5, 8, iso(), 0, drawn)).toBe('A+')
    expect(findHoveredNode(nodePositions, 25, 28, iso(), 0, drawn)).toBeNull()
  })

  test('a thin node keeps the tolerance that makes it catchable', () => {
    const drawn = { halfWidthPx: () => 1, maxHalfWidthPx: 1 }
    expect(findHoveredNode(nodePositions, 5, 4, iso(), 0, drawn)).toBe('A+')
  })

  test('of two thick nodes under the pointer, the nearer centreline wins', () => {
    const stacked = {
      'A+': [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'B+': [
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ],
    }
    const thick = { halfWidthPx: () => 9, maxHalfWidthPx: 9 }
    expect(findHoveredNode(stacked, 5, 6, iso(), 0, thick)).toBe('B+')
    expect(findHoveredNode(stacked, 5, 4, iso(), 0, thick)).toBe('A+')
  })
})

describe('findHoveredEdge', () => {
  // Horizontal A→B edge so the path-offset perpendicular is purely vertical;
  // each of 3 paths occupies a lane at y ≈ -3, 0, +3 (offsetDist = 3).
  const nodePositions = {
    'A+': [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
    ],
    'B+': [
      { x: 150, y: 0 },
      { x: 200, y: 0 },
    ],
  }
  const graph: Graph = {
    name: 't',
    nodes: [
      { id: 'A+', name: 'A', length: 50, depth: 1 },
      { id: 'B+', name: 'B', length: 50, depth: 1 },
    ],
    edges: [{ from: 'A+', to: 'B+', pathIds: ['p1', 'p2', 'p3'] }],
  }

  test('hits edge on center lane', () => {
    expect(findHoveredEdge(nodePositions, graph, 100, 0, iso(), true)).toBe(0)
  })

  test('hits edge on offset path lane', () => {
    // Outer lane sits ~3 units off center; 10/scale threshold easily covers it.
    expect(findHoveredEdge(nodePositions, graph, 100, 3, iso(), true)).toBe(0)
  })

  test('misses when far from all lanes', () => {
    expect(
      findHoveredEdge(nodePositions, graph, 100, 200, iso(), true),
    ).toBeNull()
  })

  test('drawPaths=false still hits on centerline', () => {
    expect(findHoveredEdge(nodePositions, graph, 100, 0, iso(), false)).toBe(0)
  })

  // A deletion is drawn bowed off its chord, and the tutorial tells the reader to
  // hover it for the interval and the bp it removes. Hit detection built its
  // curves without the bow, so the shape on screen was not hoverable and the
  // empty space along the chord was.
  describe('a bowed deletion arc', () => {
    // bulge = DELETION_BULGE_FRACTION * the bypassed node's drawn length
    const bypassing = new Map([[0, ['mid']]])
    const withBypassed = {
      ...nodePositions,
      mid: [
        { x: 50, y: 0 },
        { x: 150, y: 0 },
      ],
    }
    const at = (x: number, y: number, deletions?: Map<number, string[]>) =>
      findHoveredEdge(withBypassed, graph, x, y, iso(), false, 0, deletions)

    test('is hoverable where it is drawn', () => {
      // 0.35 * 100 = 35 of bulge, so the curve's own midpoint is near y = 26
      expect(at(100, 26, bypassing)).toBe(0)
    })

    test('and the chord it is not drawn on is not', () => {
      expect(at(100, 26)).toBeNull()
    })

    test('and a hidden one is not hoverable at all', () => {
      expect(
        findHoveredEdge(
          withBypassed,
          graph,
          100,
          26,
          iso(),
          false,
          0,
          bypassing,
          new Set([0]),
        ),
      ).toBeNull()
    })
  })
})

// The hover threshold is 5 screen px converted to world units, so zoomed out it
// spans several nodes at once. Returning the first candidate inside it meant the
// grid's visit order decided the answer: the cursor sat on one node and a
// neighbour lit up.
test('picks the nearest node when several are inside the threshold', () => {
  const positions = {
    'near+': [
      { x: 1000, y: 0 },
      { x: 1100, y: 0 },
    ],
    'far+': [
      { x: 500, y: 0 },
      { x: 600, y: 0 },
    ],
  }
  // scale 0.008 -> a 625 unit threshold, wide enough to reach both
  expect(findHoveredNode(positions, 1050, 0, iso(0.008))).toBe('near+')
  expect(findHoveredNode(positions, 550, 0, iso(0.008))).toBe('far+')
})

// On a row layout x is reference bp and y is screen px, and the hover slack is
// screen px over the x scale — 500 bp at a 100 kb window. Fed straight into a
// hypot over both axes that slack is also 500 ROWS, so every row within the
// cursor's x band answered the hover and the nearest of them won: the cursor sat
// on one haplotype and the drawing lit up another. `yToX` is what makes the two
// comparable, and 5 px is 5 px on either axis once it is applied.
describe('hover on a row layout', () => {
  const ROWS = {
    top: [
      { x: 0, y: 0 },
      { x: 100_000, y: 0 },
    ],
    next: [
      { x: 0, y: 20 },
      { x: 100_000, y: 20 },
    ],
  }
  // 100 kb over ~1000 px, and rows already in px
  const scaleX = 0.01
  const yToX = 1 / scaleX

  test('a cursor on a row hits that row', () => {
    expect(
      findHoveredNode(
        ROWS,
        50_000,
        2,
        { scaleX: scaleX, scaleY: scaleX * yToX },
        0,
      ),
    ).toBe('top')
    expect(
      findHoveredNode(
        ROWS,
        50_000,
        18,
        { scaleX: scaleX, scaleY: scaleX * yToX },
        0,
      ),
    ).toBe('next')
  })

  test('a cursor between the rows hits neither', () => {
    expect(
      findHoveredNode(
        ROWS,
        50_000,
        10,
        { scaleX: scaleX, scaleY: scaleX * yToX },
        0,
      ),
    ).toBeNull()
  })

  test('the slack is still screen px along x', () => {
    // 300 bp past the end is 3 px at this scale, and inside the 5 px slack
    expect(
      findHoveredNode(
        ROWS,
        100_300,
        0,
        { scaleX: scaleX, scaleY: scaleX * yToX },
        0,
      ),
    ).toBe('top')
    expect(
      findHoveredNode(
        ROWS,
        101_000,
        0,
        { scaleX: scaleX, scaleY: scaleX * yToX },
        0,
      ),
    ).toBeNull()
  })
})
