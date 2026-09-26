import { orientToReference } from './orientToReference'

import type { Graph, NodeSegment } from '../types'

const stable = (start: number, rank: number) => ({
  refName: rank === 0 ? 'chr1' : 'alt',
  start,
  rank,
})

const graph: Graph = {
  name: 'g',
  nodes: [
    { id: 'b0+', name: 'b0', length: 10, depth: 1, stable: stable(0, 0) },
    { id: 'b1+', name: 'b1', length: 10, depth: 1, stable: stable(10, 0) },
    { id: 'b2+', name: 'b2', length: 10, depth: 1, stable: stable(20, 0) },
    { id: 'b3+', name: 'b3', length: 10, depth: 1, stable: stable(30, 0) },
    { id: 'a0+', name: 'a0', length: 4, depth: 1, stable: stable(10, 1) },
  ],
  edges: [],
}

const segment = (x: number, y: number): NodeSegment[] => [
  { x, y },
  { x: x + 10, y },
]

// backbone left to right on y = 0, the allele below it
const oriented: Record<string, NodeSegment[]> = {
  'b0+': segment(0, 0),
  'b1+': segment(20, 0),
  'b2+': segment(40, 0),
  'b3+': segment(60, 0),
  'a0+': segment(25, 12),
}

function transform(
  positions: Record<string, NodeSegment[]>,
  angle: number,
  reflect: boolean,
  dx: number,
  dy: number,
) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return Object.fromEntries(
    Object.entries(positions).map(([id, segs]) => [
      id,
      segs.map(p => {
        const y = reflect ? -p.y : p.y
        return { x: c * p.x - s * y + dx, y: s * p.x + c * y + dy }
      }),
    ]),
  )
}

const mid = (segs: NodeSegment[]) => segs[Math.floor(segs.length / 2)]!

function distance(a: NodeSegment, b: NodeSegment) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

test('a rotated and reflected drawing comes back reading left to right', () => {
  const scrambled = transform(oriented, 2.3, true, 100, -50)
  const out = orientToReference(graph, scrambled)
  const xs = ['b0+', 'b1+', 'b2+', 'b3+'].map(id => mid(out[id]!).x)
  for (let i = 1; i < xs.length; i++) {
    expect(xs[i]!).toBeGreaterThan(xs[i - 1]!)
  }
  const backboneY = mid(out['b1+']!).y
  for (const p of out['a0+']!) {
    expect(p.y).toBeGreaterThan(backboneY)
  }
})

test('the transform is rigid: pairwise distances survive', () => {
  const scrambled = transform(oriented, -1.1, false, -30, 7)
  const out = orientToReference(graph, scrambled)
  const ids = Object.keys(oriented)
  for (const a of ids) {
    for (const b of ids) {
      expect(distance(out[a]![0]!, out[b]![1]!)).toBeCloseTo(
        distance(scrambled[a]![0]!, scrambled[b]![1]!),
        9,
      )
    }
  }
})

test('an oriented drawing is returned where it was', () => {
  const out = orientToReference(graph, oriented)
  for (const [id, segs] of Object.entries(oriented)) {
    segs.forEach((p, i) => {
      expect(out[id]![i]!.x).toBeCloseTo(p.x, 9)
      expect(out[id]![i]!.y).toBeCloseTo(p.y, 9)
    })
  }
})

test('alleles above the axis are reflected below it', () => {
  const above = transform(oriented, 0, true, 0, 0)
  const out = orientToReference(graph, above)
  expect(mid(out['a0+']!).y).toBeGreaterThan(mid(out['b1+']!).y)
  expect(mid(out['b3+']!).x).toBeGreaterThan(mid(out['b0+']!).x)
})

test('fewer than two placed backbone nodes leaves the drawing alone', () => {
  const positions = { 'b0+': segment(3, 4), 'a0+': segment(9, -2) }
  expect(orientToReference(graph, positions)).toBe(positions)
})
