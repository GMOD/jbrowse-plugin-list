import { convertGFAToGraph } from '@jbrowse/bandage-core/gfa/gfaConverter'
import { parseGFA } from '@jbrowse/bandage-core/gfa-core/index'

import {
  genesInWindow,
  lengthsInWindow,
  nodesOutsideWindow,
  ownPinsInWindow,
  positionsWithout,
} from './viewWindow'

import type { GenePin } from '@jbrowse/bandage-core/genes/genePins'

// Reference segments of 10 kb from 0 to 50 kb, an allele between the first
// two, an insertion where the third meets the fourth, and an allele between
// the last two
const GFA = [
  'H\tVN:Z:1.0',
  ...[0, 1, 2, 3, 4].map(
    k => `S\tr${k}\t*\tLN:i:10000\tSN:Z:chr1\tSO:i:${k * 10000}\tSR:i:0`,
  ),
  'S\ta0\t*\tLN:i:500\tSN:Z:HG1#1#chr1\tSO:i:0\tSR:i:1',
  'S\tins\t*\tLN:i:300\tSN:Z:HG1#1#chr1\tSO:i:0\tSR:i:1',
  'S\ta3\t*\tLN:i:500\tSN:Z:HG1#1#chr1\tSO:i:0\tSR:i:1',
  ...[0, 1, 2, 3].map(k => `L\tr${k}\t+\tr${k + 1}\t+\t0M`),
  'L\tr0\t+\ta0\t+\t0M',
  'L\ta0\t+\tr1\t+\t0M',
  'L\tr2\t+\tins\t+\t0M',
  'L\tins\t+\tr3\t+\t0M',
  'L\tr3\t+\ta3\t+\t0M',
  'L\ta3\t+\tr4\t+\t0M',
].join('\n')

const graph = convertGFAToGraph(parseGFA(GFA))
const view = { start: 15_000, end: 30_000 }

test('the nodes left out are those off the reference that branch only outside the view', () => {
  expect([...nodesOutsideWindow(graph, view)].sort()).toEqual(['a0+', 'a3+'])
  expect(nodesOutsideWindow(graph, { start: 0, end: 50_000 }).size).toBe(0)
})

test('a length is labelled only where all its sequence is in view', () => {
  const lengths = new Map(graph.nodes.map(n => [n.id, n.length]))
  const outside = nodesOutsideWindow(graph, view)
  expect([...lengthsInWindow(lengths, graph, outside, view).keys()]).toEqual([
    'r2+',
    'ins+',
  ])
  expect(lengthsInWindow(lengths, graph, outside, undefined)).toBe(lengths)
})

test('a gene on the reference is pinned while it meets the view, and one on a haplotype while any of its nodes is drawn', () => {
  const gene = (name: string, start: number, end: number) => ({
    name,
    refName: 'chr1',
    start,
    end,
    strand: 1,
    exons: [],
  })
  const genes = [gene('left', 1000, 9000), gene('over', 12_000, 18_000)]
  expect(genesInWindow(genes, view).map(g => g.name)).toEqual(['over'])
  expect(genesInWindow(genes, undefined)).toBe(genes)

  const own = gene('own', 0, 400)
  const pin = (g: GenePin['gene'], nodeIds: string[]) =>
    ({ gene: g, nodeIds: new Set(nodeIds) }) as unknown as GenePin
  const pins = [pin(own, ['a0+']), pin(genes[1]!, ['r1+'])]
  const outside = nodesOutsideWindow(graph, view)
  expect(
    ownPinsInWindow(pins, new Set([own]), outside).map(p => p.gene.name),
  ).toEqual(['over'])
})

test('the positions drawn leave out the nodes outside, the same object while nothing changes', () => {
  const positions = Object.fromEntries(
    graph.nodes.map(n => [
      n.id,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    ]),
  )
  const outside = nodesOutsideWindow(graph, view)
  const kept = positionsWithout(positions, outside, 0)
  expect(Object.keys(kept).sort()).toEqual([
    'ins+',
    'r0+',
    'r1+',
    'r2+',
    'r3+',
    'r4+',
  ])
  expect(positionsWithout(positions, outside, 0)).toBe(kept)
  expect(positionsWithout(positions, outside, 1)).not.toBe(kept)
  expect(positionsWithout(positions, new Set(), 0)).toBe(positions)
})
