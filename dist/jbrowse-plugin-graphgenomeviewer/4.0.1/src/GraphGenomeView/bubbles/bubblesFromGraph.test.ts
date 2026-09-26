import { describe, expect, it } from 'vitest'

import { bubblesFromGraph } from './bubblesFromGraph'
import { classifyBubble } from './classifyBubble'

import type { Graph, GraphNode } from '../types'

// r1 r2 r3 r4 r5 along chr, a SNP allele `a` beside r2, an allele `k` between
// r4 and r5 that a walk can take twice, and `t` hanging off r4 with nothing
// after it, the way a cut leaves an allele that runs out of the window. `t`
// lands in r5's layer, so r5 is a boundary only because it is the window's
// last backbone node.
function node(
  name: string,
  length: number,
  start: number,
  rank = 0,
): GraphNode {
  return {
    id: `${name}+`,
    name,
    length,
    depth: 1,
    stable: { refName: rank === 0 ? 'chr' : 'alt', start, rank },
  }
}

const nodes = [
  node('r1', 10, 0),
  node('r2', 1, 10),
  node('r3', 10, 11),
  node('r4', 10, 21),
  node('r5', 10, 31),
  node('a', 1, 0, 1),
  node('k', 10, 0, 1),
  node('t', 5, 0, 1),
]
const edges = [
  ['r1', 'r2'],
  ['r2', 'r3'],
  ['r1', 'a'],
  ['a', 'r3'],
  ['r3', 'r4'],
  ['r4', 'r5'],
  ['r4', 'k'],
  ['k', 'r5'],
  ['k', 'r4'],
  ['r4', 't'],
].map(([from, to]) => ({ from: `${from}+`, to: `${to}+` }))

const walks = [
  ['r1', 'r2', 'r3', 'r4', 'r5'],
  ['r1', 'a', 'r3', 'r4', 'k', 'r5'],
  ['r1', 'r2', 'r3', 'r4', 'k', 'r4', 'k', 'r5'],
].map((ids, i) => ({ name: `hap${i}`, nodeIds: ids.map(id => `${id}+`) }))

const graph: Graph = { name: 'g', nodes, edges, anchoredBy: 'tags' }
const walked: Graph = { ...graph, paths: walks }

describe('bubblesFromGraph', () => {
  it('bounds the SNP and closes the last bubble at the window end', () => {
    const bubbles = bubblesFromGraph(graph)
    expect(bubbles.map(b => [b.start, b.end, b.segments])).toEqual([
      [10, 11, 'r1,a,r2,r3'],
      [31, 31, 'r4,k,t,r5'],
    ])
    expect(classifyBubble(bubbles[0]!).label).toBe('SNP')
    expect(bubbles.every(b => !b.inversion && !b.partial)).toBe(true)
  })

  it('counts routes over the layered DAG without walks', () => {
    const [snp, ins] = bubblesFromGraph(graph)
    expect([
      snp!.pathCount,
      snp!.shortestAlleleLength,
      snp!.longestAlleleLength,
    ]).toEqual([2, 1, 1])
    expect([
      ins!.pathCount,
      ins!.shortestAlleleLength,
      ins!.longestAlleleLength,
    ]).toEqual([2, 0, 10])
  })

  it('takes routes and lengths from the walks when the graph has them', () => {
    const [, ins] = bubblesFromGraph(walked)
    expect([
      ins!.pathCount,
      ins!.shortestAlleleLength,
      ins!.longestAlleleLength,
    ]).toEqual([3, 0, 30])
  })

  it('falls back to the DAG when every walk leaves the bubble', () => {
    const leaving = [
      ['r1', 'r2', 'r3', 'r4', 't'],
      ['k', 'r5'],
    ].map((ids, i) => ({ name: `hap${i}`, nodeIds: ids.map(id => `${id}+`) }))
    const [, ins] = bubblesFromGraph({ ...graph, paths: leaving })
    expect([
      ins!.pathCount,
      ins!.shortestAlleleLength,
      ins!.longestAlleleLength,
      ins!.partial,
    ]).toEqual([2, 0, 10, true])
    expect(classifyBubble(ins!).label).not.toMatch(/Infinity/)
  })

  // Every base a haplotype carries beyond the reference lies in some bubble.
  it('accounts for each walk’s excess over the reference', () => {
    const bubbles = bubblesFromGraph(walked)
    const byId = new Map(nodes.map(n => [n.id, n]))
    const bp = (ids: string[]) =>
      ids.reduce((s, id) => s + byId.get(id)!.length, 0)
    const refLength = bp(walks[0]!.nodeIds)
    for (const walk of walks) {
      let inBubbles = 0
      for (const b of bubbles) {
        const names = b.segments.split(',')
        const i0 = walk.nodeIds.indexOf(`${names[0]}+`)
        const i1 = walk.nodeIds.indexOf(`${names.at(-1)}+`)
        inBubbles += bp(walk.nodeIds.slice(i0 + 1, i1)) - (b.end - b.start)
      }
      expect(inBubbles).toBe(bp(walk.nodeIds) - refLength)
    }
  })

  it('marks a bubble whose reference route the cut lost as partial', () => {
    const cut = {
      ...graph,
      edges: edges.filter(e => e.from !== 'r1+' || e.to !== 'r2+'),
    }
    const [snp] = bubblesFromGraph(cut)
    expect(snp!.partial).toBe(true)
    expect([snp!.shortestAlleleLength, snp!.longestAlleleLength]).toEqual([
      1, 1,
    ])
    expect(classifyBubble(snp!).label).toBe('SNP, partial')
  })

  // A GBZ cut at 1 kb of context hands a haplotype's walk through a repeat
  // array over as pieces, and a piece that enters the bubble and ends is a
  // route the cut did not keep.
  it('marks a bubble a walk leaves as partial, its lengths a floor', () => {
    const piece = { name: 'hap3', nodeIds: ['r3+', 'r4+', 'k+'] }
    const [, ins] = bubblesFromGraph({
      ...walked,
      paths: [...walks, piece],
    })
    expect(ins!.partial).toBe(true)
    expect([ins!.pathCount, ins!.longestAlleleLength]).toEqual([3, 30])
    expect(classifyBubble(ins!).label).toMatch(/, partial$/)
    expect(bubblesFromGraph(walked)[1]!.partial).toBe(false)
  })

  it('finds nothing in a graph with no backbone', () => {
    expect(
      bubblesFromGraph({ name: 'g', nodes: [node('x', 5, 0, 1)], edges: [] }),
    ).toEqual([])
  })

  // A 2 kb insertion through two nodes, A>X1>X2>B, then a separate SNP,
  // B>{C,Calt}>D. A search from every backbone node meets itself in the middle
  // of the insertion, so X2 is claimed from B, its right anchor. Sorted after
  // B, its link into B was turned round: this derived ONE bubble over 100-201
  // with a longest allele of 101 bp, the insertion lost and the SNP fused into
  // it. Multi-node alleles are the ordinary shape of a GBZ cut or a pggb file.
  it('a multi-node allele beside a SNP derives two bubbles', () => {
    const graph: Graph = {
      name: 'g',
      nodes: [
        node('A', 100, 0),
        node('B', 100, 100),
        node('C', 1, 200),
        node('D', 100, 201),
        node('X1', 1000, 0, 1),
        node('X2', 1000, 1000, 1),
        node('Calt', 1, 0, 1),
      ],
      edges: [
        ['A', 'B'],
        ['A', 'X1'],
        ['X1', 'X2'],
        ['X2', 'B'],
        ['B', 'C'],
        ['B', 'Calt'],
        ['C', 'D'],
        ['Calt', 'D'],
      ].map(([from, to]) => ({ from: `${from}+`, to: `${to}+` })),
    }
    const found = bubblesFromGraph(graph)
    expect(found.map(b => [b.start, b.end, b.segments])).toEqual([
      [100, 100, 'A,X1,X2,B'],
      [200, 201, 'B,Calt,C,D'],
    ])
    expect(found[0]).toMatchObject({
      shortestAlleleLength: 0,
      longestAlleleLength: 2000,
    })
  })

  // `w` is where a haplotype's walk enters the cut, so nothing leads into it,
  // and its walk sorts it just before r4. Read off the drawing's layers, where
  // such a node sits in the first one, its link into r4 crossed r3's layer and
  // the SNP fused with the entry into one bubble, r1,a,r2,w,r3,r4.
  it('a node a walk enters the cut at does not fuse the bubbles before it', () => {
    const graph: Graph = {
      name: 'g',
      nodes: [
        node('r1', 10, 0),
        node('r2', 1, 10),
        node('r3', 10, 11),
        node('r4', 10, 21),
        node('a', 1, 0, 1),
        node('w', 5, 0, 1),
      ],
      edges: [
        ['r1', 'r2'],
        ['r2', 'r3'],
        ['r3', 'r4'],
        ['r1', 'a'],
        ['a', 'r3'],
        ['w', 'r4'],
      ].map(([from, to]) => ({ from: `${from}+`, to: `${to}+` })),
      paths: [
        ['r1', 'r2', 'r3', 'r4'],
        ['r1', 'a', 'r3', 'r4'],
        ['w', 'r4'],
      ].map((ids, i) => ({
        name: `hap${i}`,
        nodeIds: ids.map(id => `${id}+`),
      })),
    }
    expect(bubblesFromGraph(graph).map(b => b.segments)).toEqual([
      'r1,a,r2,r3',
      'r3,w,r4',
    ])
  })
})
