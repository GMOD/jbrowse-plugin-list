import { mergeRuns, splitRuns } from './mergeRuns'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'

// chr1 runs v1->v2->v3->v4->v5; a1 replaces v3 and v4 between v2 and v5, so
// v1+v2 is a run, v3+v4 is a run, and v5 and a1 stand alone. v5 loops back to
// v3, which is the shape of a repeat array whose copies re-enter it.
const GFA = `S\tv1\tAAAAA\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCCC\tSN:Z:chr1\tSO:i:5\tSR:i:0
S\tv3\tGG\tSN:Z:chr1\tSO:i:8\tSR:i:0
S\tv4\tTTTTTTT\tSN:Z:chr1\tSO:i:10\tSR:i:0
S\tv5\tGA\tSN:Z:chr1\tSO:i:17\tSR:i:0
S\ta1\tAC\tSN:Z:foo\tSO:i:8\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv3\t+\tv4\t+\t0M
L\tv4\t+\tv5\t+\t0M
L\tv2\t+\ta1\t+\t0M
L\ta1\t+\tv5\t+\t0M
L\tv5\t+\tv3\t+\t0M`

const graph = convertGFAToGraph(parseGFA(GFA))

test('unbranching runs become one node each, members in chain order', () => {
  const { graph: merged, runs } = mergeRuns(graph)
  expect([...runs]).toEqual([
    ['v1+', ['v1+', 'v2+']],
    ['v3+', ['v3+', 'v4+']],
  ])
  expect(merged.nodes.map(n => [n.id, n.length])).toEqual([
    ['v1+', 8],
    ['v3+', 9],
    ['v5+', 2],
    ['a1+', 2],
  ])
  expect(merged.nodes[0]!.stable).toEqual(graph.nodes[0]!.stable)
  expect(merged.edges).toEqual([
    { from: 'v1+', to: 'v3+' },
    { from: 'v3+', to: 'v5+' },
    { from: 'v1+', to: 'a1+' },
    { from: 'a1+', to: 'v5+' },
    { from: 'v5+', to: 'v3+' },
  ])
})

test('a run whose end loops back to its start keeps the loop as a self edge', () => {
  const { graph: merged, runs } = mergeRuns(
    convertGFAToGraph(
      parseGFA(
        `S\tx\tAAAA\nS\ta\tCC\nS\tb\tGG\nS\ty\tTT\nL\tx\t+\ta\t+\t0M\nL\ta\t+\tb\t+\t0M\nL\tb\t+\ta\t+\t0M\nL\tb\t+\ty\t+\t0M`,
      ),
    ),
  )
  expect([...runs]).toEqual([['a+', ['a+', 'b+']]])
  expect(merged.edges).toEqual([
    { from: 'x+', to: 'a+' },
    { from: 'a+', to: 'a+' },
    { from: 'a+', to: 'y+' },
  ])
})

test('a run splits its polyline among its members by weight, abutting', () => {
  const { runs } = mergeRuns(graph)
  const positions = {
    'v1+': [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 8, y: 0 },
    ],
    'v3+': [
      { x: 0, y: 10 },
      { x: 3, y: 14 },
    ],
    'v5+': [{ x: 20, y: 0 }],
    'a1+': [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
  }
  const split = splitRuns(positions, runs, id => (id === 'v1+' ? 6 : 2))
  expect(split['v1+']).toEqual([
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 6, y: 0 },
  ])
  expect(split['v2+']).toEqual([
    { x: 6, y: 0 },
    { x: 8, y: 0 },
  ])
  expect(split['v3+']).toEqual([
    { x: 0, y: 10 },
    { x: 1.5, y: 12 },
  ])
  expect(split['v4+']).toEqual([
    { x: 1.5, y: 12 },
    { x: 3, y: 14 },
  ])
  expect(split['v5+']).toEqual([{ x: 20, y: 0 }])
  expect(split['a1+']).toBe(positions['a1+'])
})
