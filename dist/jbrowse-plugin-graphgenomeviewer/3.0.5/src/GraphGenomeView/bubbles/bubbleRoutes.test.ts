import { bubbleHalos } from './bubbleHalos'
import { bubblesFromGraph } from './bubblesFromGraph'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { anchorGraph } from '../pathAnchoring'

// ref walks v1 v2 v3; two haplotypes take a1 instead of v2 and one takes a2.
const GFA = `S\tv1\tAAAA
S\tv2\tCC
S\tv3\tGGG
S\ta1\t${'T'.repeat(6000)}
S\ta2\tG
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv1\t+\ta1\t+\t0M
L\ta1\t+\tv3\t+\t0M
L\tv1\t+\ta2\t+\t0M
L\ta2\t+\tv3\t+\t0M
W\tref\t0\tchr\t0\t9\t>v1>v2>v3
W\tHG1\t1\tchr\t0\t6007\t>v1>a1>v3
W\tHG2\t1\tchr\t0\t6007\t>v1>a1>v3
W\tHG3\t2\tchr\t0\t8\t>v1>a2>v3`

const graph = anchorGraph(convertGFAToGraph(parseGFA(GFA)), 'ref')

test('a derived bubble carries each route with the walks that take it', () => {
  const [bubble] = bubblesFromGraph(graph)
  expect(bubble!.routes).toEqual([
    { steps: ['v2+'], bp: 2, walks: ['ref#0#chr'] },
    { steps: ['a1+'], bp: 6000, walks: ['HG1#1#chr', 'HG2#1#chr'] },
    { steps: ['a2+'], bp: 1, walks: ['HG3#2#chr'] },
  ])
})

test('every route with steps is labelled for its carriers at its far point', () => {
  const positions = {
    'v1+': [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ],
    'v2+': [
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ],
    'v3+': [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ],
    'a1+': [
      { x: 10, y: 5 },
      { x: 15, y: 20 },
      { x: 20, y: 5 },
    ],
    'a2+': [{ x: 15, y: -8 }],
  }
  const [halo] = bubbleHalos(
    graph,
    bubblesFromGraph(graph),
    positions,
    name => name.split('#')[0]!,
  )
  expect(halo!.routes.map(r => [r.text, r.at])).toEqual([
    ['ref · 2 bp', { x: 10, y: 0 }],
    ['HG1, HG2 · 6.0 kb', { x: 15, y: 20 }],
    ['HG3 · 1 bp', { x: 15, y: -8 }],
  ])
})

// Two routes share a3, and each has a node of its own; the chip goes on the
// node of its own even though the shared one is farther out.
const SHARED = `S\tv1\tAAAA
S\tv3\tGGG
S\ta1\tTT
S\ta2\tCC
S\ta3\t${'G'.repeat(4000)}
L\tv1\t+\ta1\t+\t0M
L\tv1\t+\ta2\t+\t0M
L\ta1\t+\ta3\t+\t0M
L\ta2\t+\ta3\t+\t0M
L\ta3\t+\tv3\t+\t0M
L\tv1\t+\tv3\t+\t0M
W\tref\t0\tchr\t0\t7\t>v1>v3
W\tHG1\t1\tchr\t0\t4009\t>v1>a1>a3>v3
W\tHG2\t1\tchr\t0\t4009\t>v1>a2>a3>v3`

test('a chip sits on the stretch a route does not share', () => {
  const shared = anchorGraph(convertGFAToGraph(parseGFA(SHARED)), 'ref')
  const positions = {
    'v1+': [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ],
    'v3+': [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ],
    'a1+': [{ x: 12, y: 10 }],
    'a2+': [{ x: 12, y: -10 }],
    'a3+': [{ x: 15, y: 60 }],
  }
  const [halo] = bubbleHalos(
    shared,
    bubblesFromGraph(shared),
    positions,
    name => name.split('#')[0]!,
  )
  expect(halo!.routes.map(r => [r.text, r.at])).toEqual([
    ['HG1 · 4.0 kb', { x: 12, y: 10 }],
    ['HG2 · 4.0 kb', { x: 12, y: -10 }],
  ])
})

// A contig assembled on the reverse strand walks the same bubble end-first.
const REVERSED = `S\tv1\tAAAA
S\tv2\tCC
S\tv2b\tTT
S\tv3\tGGG
S\ta1\tT
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv2b\t+\t0M
L\tv2b\t+\tv3\t+\t0M
L\tv1\t+\ta1\t+\t0M
L\ta1\t+\tv3\t+\t0M
W\tref\t0\tchr\t0\t11\t>v1>v2>v2b>v3
W\tFWD\t1\tchr\t0\t11\t>v1>v2>v2b>v3
W\tREV\t1\tchr\t0\t11\t<v3<v2b<v2<v1
W\tALT\t1\tchr\t0\t8\t>v1>a1>v3`

test('a walk crossing a bubble end-first takes the route it takes forwards', () => {
  const reversed = anchorGraph(convertGFAToGraph(parseGFA(REVERSED)), 'ref')
  const [bubble] = bubblesFromGraph(reversed)
  expect(bubble!.pathCount).toBe(2)
  expect(bubble!.routes).toEqual([
    {
      steps: ['v2+', 'v2b+'],
      bp: 4,
      walks: ['ref#0#chr', 'FWD#1#chr', 'REV#1#chr'],
    },
    { steps: ['a1+'], bp: 1, walks: ['ALT#1#chr'] },
  ])
})
