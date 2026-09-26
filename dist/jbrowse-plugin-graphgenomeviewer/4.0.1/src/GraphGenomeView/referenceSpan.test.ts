import { convertGFAToGraph } from './gfa/gfaConverter'
import { buildNeighbors, nodeReferenceSpan } from './referenceSpan'
import { parseGFA } from '../gfa-core/index'

// The worked example from gfatools/doc/rGFA.md, the same fixture the anchored
// layout tests use: chr1 runs v1->v2->v3->v4, and foo carries an alternate
// allele (v5,v6) leaving after v2 and rejoining at v4.
const RGFA = `S\tv1\tAAAAA\tLN:i:5\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCCC\tLN:i:3\tSN:Z:chr1\tSO:i:5\tSR:i:0
S\tv3\tGG\tLN:i:2\tSN:Z:chr1\tSO:i:8\tSR:i:0
S\tv4\tTTTTTTT\tLN:i:7\tSN:Z:chr1\tSO:i:10\tSR:i:0
S\tv5\tAC\tLN:i:2\tSN:Z:foo\tSO:i:8\tSR:i:1
S\tv6\tGTA\tLN:i:3\tSN:Z:foo\tSO:i:10\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv3\t+\tv4\t+\t0M
L\tv2\t+\tv5\t+\t0M
L\tv5\t+\tv6\t+\t0M
L\tv6\t+\tv4\t+\t0M`

function setup(gfa: string) {
  const graph = convertGFAToGraph(parseGFA(gfa))
  const nodeById = new Map(graph.nodes.map(n => [n.id, n]))
  const neighbors = buildNeighbors(graph)
  return (nodeId: string) => nodeReferenceSpan({ nodeId, nodeById, neighbors })
}

test('a backbone node states its own reference span', () => {
  const span = setup(RGFA)
  expect(span('v1+')).toEqual({ start: 0, end: 5 })
  expect(span('v2+')).toEqual({ start: 5, end: 8 })
  expect(span('v4+')).toEqual({ start: 10, end: 17 })
})

// v5/v6's SO is an offset on `foo`, not on chr1, so it has no reference span of
// its own. The allele leaves after v2 (ends at 8) and rejoins at v4 (starts at
// 10), so what it replaces on chr1 is 8-10 — which is v3's span, the reference
// allele of the same bubble.
test('an off-reference allele resolves to the interval it branches into', () => {
  const span = setup(RGFA)
  expect(span('v5+')).toEqual({ start: 8, end: 10 })
  expect(span('v6+')).toEqual({ start: 8, end: 10 })
})

// A pure insertion's flanks abut, so there is exactly one reference point to
// mark. The span collapses to it rather than covering either flank; the linear
// view floors the drawn width so it stays visible.
test('an insertion collapses to the reference point it is inserted at', () => {
  const insertion = `S\tv1\tAAAAA\tLN:i:5\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCCCCC\tLN:i:5\tSN:Z:chr1\tSO:i:5\tSR:i:0
S\tins\tGGG\tLN:i:3\tSN:Z:alt\tSO:i:0\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv1\t+\tins\t+\t0M
L\tins\t+\tv2\t+\t0M`
  expect(setup(insertion)('ins+')).toEqual({ start: 5, end: 5 })
})

// At the edge of a fetched window a bubble can have only one flank present.
// Falling back to that flank's own span keeps the highlight in the right place
// instead of dropping it.
test('an allele with one flank in the window takes that flank span', () => {
  const clipped = `S\tv1\tAAAAA\tLN:i:5\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\talt\tGGG\tLN:i:3\tSN:Z:alt\tSO:i:0\tSR:i:1
L\tv1\t+\talt\t+\t0M`
  expect(setup(clipped)('alt+')).toEqual({ start: 0, end: 5 })
})

test('a node with no backbone anywhere in reach has no reference span', () => {
  const plain = `S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t+\t0M`
  expect(setup(plain)('1+')).toBeUndefined()
})

test('an unknown node id has no reference span', () => {
  expect(setup(RGFA)('nope+')).toBeUndefined()
})

test('neighbors are undirected, so a bubble is reachable from either flank', () => {
  const neighbors = buildNeighbors(convertGFAToGraph(parseGFA(RGFA)))
  expect(neighbors.get('v2+')).toContain('v1+')
  expect(neighbors.get('v2+')).toContain('v5+')
  expect(neighbors.get('v4+')).toContain('v6+')
})
