import { drawnNodeLength, layoutScaling } from './drawnScale'
import { referenceSeeds, seededNodes } from './referenceSeeds'
import { parseGFA } from '../../gfa-core/index'
import { spreadFor } from '../bubbleSpreads'
import { convertGFAToGraph } from '../gfa/gfaConverter'

// chr1 runs v1->v2->v3->v4; a1 replaces v3 and hangs a2 off itself, which no
// backbone node touches; lone is linked to nothing. Lengths span 1 bp to 7 kb so
// a compressing spread moves the spacing by more than rounding.
const GFA = `S\tv1\t${'A'.repeat(5000)}\tSN:Z:chr1\tSO:i:0\tSR:i:0
S\tv2\tCCC\tSN:Z:chr1\tSO:i:5000\tSR:i:0
S\tv3\tGG\tSN:Z:chr1\tSO:i:5003\tSR:i:0
S\tv4\t${'T'.repeat(7000)}\tSN:Z:chr1\tSO:i:5005\tSR:i:0
S\ta1\tAC\tSN:Z:foo\tSO:i:8\tSR:i:1
S\ta2\tT\tSN:Z:bar\tSO:i:8\tSR:i:2
S\tlone\tGATTACA\tSN:Z:baz\tSO:i:0\tSR:i:1
L\tv1\t+\tv2\t+\t0M
L\tv2\t+\tv3\t+\t0M
L\tv3\t+\tv4\t+\t0M
L\tv2\t+\ta1\t+\t0M
L\ta1\t+\tv4\t+\t0M
L\ta1\t+\ta2\t+\t0M`

const graph = convertGFAToGraph(parseGFA(GFA))
const BACKBONE = ['v1+', 'v2+', 'v3+', 'v4+']

test('the backbone runs along x, each node one drawn length and one edge on', () => {
  const scaling = layoutScaling(graph)
  const seeds = referenceSeeds(graph, scaling)
  let x = 0
  for (const id of BACKBONE) {
    expect(seeds.get(id)).toEqual({ x, y: 0 })
    const node = graph.nodes.find(n => n.id === id)!
    x += drawnNodeLength(scaling.opts, node.length) + scaling.opts.edgeLength
  }
})

test('an allele sits at its anchor midpoint one lane down, a lane more per step', () => {
  const scaling = layoutScaling(graph)
  const seeds = referenceSeeds(graph, scaling)
  const v2 = graph.nodes.find(n => n.id === 'v2+')!
  const a1 = graph.nodes.find(n => n.id === 'a1+')!
  const anchor = seeds.get('v2+')!
  expect(seeds.get('a1+')).toEqual({
    x: anchor.x + drawnNodeLength(scaling.opts, v2.length) / 2,
    y: 30,
  })
  expect(seeds.get('a2+')).toEqual({
    x: seeds.get('a1+')!.x + drawnNodeLength(scaling.opts, a1.length) / 2,
    y: 60,
  })
})

test('a node no backbone reaches goes below everything', () => {
  const seeds = referenceSeeds(graph, layoutScaling(graph))
  expect(seeds.get('lone+')).toEqual({ x: 0, y: 90 })
  expect(seeds.size).toBe(graph.nodes.length)
})

test('spacing follows the scaled lengths the engine is handed, not bp', () => {
  const compressed = layoutScaling(graph, spreadFor('compress'))
  const seeds = referenceSeeds(graph, compressed)
  const v1 = compressed.nodes.find(n => n.id === 'v1+')!
  expect(v1.length).not.toBe(5000)
  expect(seeds.get('v2+')!.x).toBe(
    drawnNodeLength(compressed.opts, v1.length) + compressed.opts.edgeLength,
  )
  const proportional = referenceSeeds(graph, layoutScaling(graph))
  expect(seeds.get('v2+')!.x).not.toBe(proportional.get('v2+')!.x)
})

test('seededNodes carries every scaled node with its seed', () => {
  const scaling = layoutScaling(graph, spreadFor('compress'))
  const nodes = seededNodes(graph, scaling)
  expect(nodes.map(n => n.length)).toEqual(scaling.nodes.map(n => n.length))
  expect(nodes.every(n => Number.isFinite(n.x) && Number.isFinite(n.y))).toBe(
    true,
  )
})
