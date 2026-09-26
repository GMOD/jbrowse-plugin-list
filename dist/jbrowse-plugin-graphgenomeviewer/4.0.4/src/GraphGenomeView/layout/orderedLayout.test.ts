import { orderedLayout, referenceOrder } from './orderedLayout'
import { ROW_HEIGHT_PX } from './rowSpacing'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'

// chr1 runs v1->v2->v3->v4; two single-segment alleles, a1 (foo) and a2 (bar),
// each replace v3 between the same anchors, so they share a layer and have to
// take different lanes. The file lists the L-lines in reference direction.
const BUBBLE = `S\tv1\tAAAAA\tLN:i:5\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCCC\tLN:i:3\tSN:Z:chr1\tSO:i:5\tSR:i:0
S\tv3\tGG\tLN:i:2\tSN:Z:chr1\tSO:i:8\tSR:i:0
S\tv4\tTTTTTTT\tLN:i:7\tSN:Z:chr1\tSO:i:10\tSR:i:0
S\ta1\tAC\tLN:i:2\tSN:Z:foo\tSO:i:8\tSR:i:1
S\ta2\tT\tLN:i:1\tSN:Z:bar\tSO:i:8\tSR:i:2
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv3\t+\tv4\t+\t0M
L\tv2\t+\ta1\t+\t0M
L\ta1\t+\tv4\t+\t0M
L\tv2\t+\ta2\t+\t0M
L\ta2\t+\tv4\t+\t0M`

const BACKBONE = ['v1+', 'v2+', 'v3+', 'v4+']

function graphOf(gfa: string) {
  return convertGFAToGraph(parseGFA(gfa))
}

function layout(gfa: string) {
  return orderedLayout(graphOf(gfa))!.nodePositions
}

const centre = (seg: { x: number }[]) => (seg[0]!.x + seg.at(-1)!.x) / 2

test('backbone x strictly increases in reference order', () => {
  const pos = layout(BUBBLE)
  const xs = BACKBONE.map(id => centre(pos[id]!))
  for (let i = 1; i < xs.length; i++) {
    expect(xs[i]!).toBeGreaterThan(xs[i - 1]!)
  }
})

test('no two nodes share a layer and a lane', () => {
  const pos = layout(BUBBLE)
  const cells = Object.values(pos).map(seg => `${centre(seg)},${seg[0]!.y}`)
  expect(new Set(cells).size).toBe(cells.length)
})

test('the backbone holds lane 0 and nothing else does', () => {
  const pos = layout(BUBBLE)
  for (const id of BACKBONE) {
    expect(pos[id]!.every(p => p.y === 0)).toBe(true)
  }
  expect(pos['a1+']![0]!.y).not.toBe(0)
  expect(pos['a2+']![0]!.y).not.toBe(0)
})

test('every edge runs left to right', () => {
  const graph = graphOf(BUBBLE)
  const pos = orderedLayout(graph)!.nodePositions
  for (const { from, to } of graph.edges) {
    expect(centre(pos[from]!)).toBeLessThan(centre(pos[to]!))
  }
})

test("a bubble's two alleles share a layer on different lanes", () => {
  const pos = layout(BUBBLE)
  const a1 = pos['a1+']!
  const a2 = pos['a2+']!
  expect(centre(a1)).toBe(centre(a2))
  expect(a1[0]!.y).not.toBe(a2[0]!.y)
  // both one or more lane pitches off the reference line
  expect(Math.abs(a1[0]!.y) % ROW_HEIGHT_PX).toBe(0)
  expect(Math.abs(a2[0]!.y)).toBeGreaterThanOrEqual(ROW_HEIGHT_PX)
})

test('an allele sits between its anchors, not under one of them', () => {
  const pos = layout(BUBBLE)
  expect(centre(pos['a1+']!)).toBeGreaterThan(centre(pos['v2+']!))
  expect(centre(pos['a1+']!)).toBeLessThan(centre(pos['v4+']!))
})

test('a node is a two-point polyline as wide as the log of its bp', () => {
  const pos = layout(BUBBLE)
  const seg = pos['v4+']!
  expect(seg).toHaveLength(2)
  expect(seg[1]!.x - seg[0]!.x).toBeCloseTo(10 + 8 * Math.log2(8), 5)
})

test('x is order, and y a lane pitch in screen px', () => {
  const result = orderedLayout(graphOf(BUBBLE))!
  expect(result.referenceAxis).toBe(false)
  expect(result.pixelRows).toBe(true)
  expect(result.rowLabels).toBeUndefined()
  expect(result.alleleDeletions).toBeUndefined()
})

test('a graph without a backbone gets no ordered layout', () => {
  const plain = `S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t+\t0M`
  expect(orderedLayout(graphOf(plain))).toBeUndefined()
})

test('the same graph always gets the same drawing', () => {
  const graph = graphOf(BUBBLE)
  expect(orderedLayout(graph)).toEqual(orderedLayout(graph))
  expect(referenceOrder(graph)).toEqual(referenceOrder(graphOf(BUBBLE)))
})

test('reference order is backbone by offset, alleles just past their anchor', () => {
  expect(referenceOrder(graphOf(BUBBLE))).toEqual([
    'v1+',
    'v2+',
    'a1+',
    'a2+',
    'v3+',
    'v4+',
  ])
})

// r1 r2 r3 r4 along chr1 at 0, 1, 2, 3, a base apart as a base-level graph's
// backbone is, with whatever `extra` hangs off it.
function baseLevel(extra: string[]) {
  return graphOf(
    [
      ...[0, 1, 2, 3].map(
        i => `S\tr${i + 1}\tA\tLN:i:1\tSN:Z:chr1\tSO:i:${i}\tSR:i:0`,
      ),
      ...[1, 2, 3].map(i => `L\tr${i}\t+\tr${i + 1}\t+\t0M`),
      ...extra,
    ].join('\n'),
  )
}

const off = (name: string) => `S\t${name}\tA\tLN:i:1\tSN:Z:alt\tSO:i:0\tSR:i:1`
const link = (a: string, b: string) => `L\t${a}\t+\t${b}\t+\t0M`

// The search from the backbone meets itself in the middle of x1..x4, so x3 and
// x4 are claimed from r4. Sorted after it, their links into r4 turned round.
test('both halves of a multi-node allele sort between its anchors', () => {
  const chain = ['r1', 'x1', 'x2', 'x3', 'x4', 'r4']
  const graph = baseLevel([
    ...['x1', 'x2', 'x3', 'x4'].map(off),
    ...chain.slice(1).map((n, i) => link(chain[i]!, n)),
  ])
  const order = referenceOrder(graph)
  const places = chain.map(n => order.indexOf(`${n}+`))
  expect(places).toEqual([...places].sort((a, b) => a - b))
})

// Six nodes off r1, whose next backbone node is a base away. Nudged half a bp
// per step, the chain's keys walked past r2, r3 and r4.
test('a long allele stays beside its anchor however close the next node is', () => {
  const names = ['y1', 'y2', 'y3', 'y4', 'y5', 'y6']
  const graph = baseLevel([
    ...names.map(off),
    link('r1', 'y1'),
    ...names.slice(1).map((n, i) => link(names[i]!, n)),
  ])
  expect(referenceOrder(graph)).toEqual([
    'r1+',
    ...names.map(n => `${n}+`),
    'r2+',
    'r3+',
    'r4+',
  ])
})

// t1 and t2 are claimed from r4, and the left reaches them only at t1. t2 is a
// dead end of the search that the left never reached, so steps from r4 say
// nothing about where it lies: sorted first, as the far half of a chain is, it
// would have nothing before it. The run stays after its anchor.
test('a run with a dead end the left never reached stays after its anchor', () => {
  const graph = baseLevel([
    ...['s1', 't1', 't2'].map(off),
    link('r1', 's1'),
    link('s1', 't1'),
    link('t1', 'r4'),
    link('t1', 't2'),
  ])
  const order = referenceOrder(graph)
  const at = (name: string) => order.indexOf(`${name}+`)
  expect(at('t1')).toBeGreaterThan(at('r4'))
  expect(at('t2')).toBeGreaterThan(at('t1'))
})

// A walk says where its nodes lie. w2 links only to r4, so the links alone put
// it after r4; the walk enters it from w1, off r1.
const WALKED = [
  ...['w1', 'w2'].map(off),
  link('r1', 'w1'),
  link('w2', 'r4'),
  'W\tref\t0\tchr1\t0\t4\t>r1>r2>r3>r4',
]

test('a walk places the nodes it visits after the node it came from', () => {
  const graph = baseLevel([...WALKED, 'W\thap\t1\tctg\t0\t4\t>r1>w1>w2>r4'])
  expect(referenceOrder(graph)).toEqual([
    'r1+',
    'w1+',
    'w2+',
    'r2+',
    'r3+',
    'r4+',
  ])
})

test('a walk on the reverse strand is read end-first', () => {
  const graph = baseLevel([...WALKED, 'W\thap\t1\tctg\t0\t4\t<r4<w2<w1<r1'])
  expect(referenceOrder(graph).slice(0, 3)).toEqual(['r1+', 'w1+', 'w2+'])
})
