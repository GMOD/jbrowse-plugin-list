import { readFileSync } from 'fs'

import {
  anchorFromPaths,
  anchorGraph,
  chooseReferencePath,
  pathOrigin,
} from './pathAnchoring'
import { parseGFA } from '../gfa-core/index'
import { convertGFAToGraph } from './gfa/gfaConverter'

import type { Graph } from './types'

function fixture(file: string) {
  return convertGFAToGraph(
    parseGFA(readFileSync(require.resolve(`../../test_data/${file}`), 'utf8')),
    file,
  )
}

function nodeNamed(graph: Graph, name: string) {
  return graph.nodes.find(n => n.name === name)!
}

test('splits an odgi extract range suffix off the path name', () => {
  expect(pathOrigin('K12#1#chr:1004500-1004961')).toEqual({
    name: 'K12#1#chr',
    start: 1004500,
  })
})

// A stable name may contain colons of its own, so only a trailing digit range
// is a range; `chr:1-1000` as a whole sequence name would otherwise be halved.
test('a name with no range starts at zero', () => {
  expect(pathOrigin('GRCh38#0#chr6')).toEqual({
    name: 'GRCh38#0#chr6',
    start: 0,
  })
  expect(pathOrigin('sample#1#scaffold:alt')).toEqual({
    name: 'sample#1#scaffold:alt',
    start: 0,
  })
})

describe('pggb subgraph', () => {
  // The demo window, cut with `odgi extract -r K12#1#chr:1004500-1004900`. Its
  // reference path name carries the only coordinates in the file.
  const graph = () => anchorGraph(fixture('ecoli_pggb_subgraph.gfa'), 'K12')

  test('walking the reference path anchors the graph rGFA tags cannot', () => {
    const unanchored = fixture('ecoli_pggb_subgraph.gfa')
    expect(unanchored.anchoredBy).toBeUndefined()
    expect(unanchored.nodes.some(n => n.stable)).toBe(false)

    const anchored = graph()
    expect(anchored.anchoredBy).toBe('paths')
    expect(anchored.referencePath).toBe('K12#1#chr')
    expect(anchored.nodes.every(n => n.stable)).toBe(true)
  })

  // The same walk scripts/gfa_nodes_to_bed.py does for the BED lane above the
  // graph in the pangenome/local_subgraph figure, so the node strip and the
  // graph state the same coordinate for the same segment.
  test('reference nodes land end to end from the path origin', () => {
    const backbone = graph()
      .nodes.filter(n => n.stable?.rank === 0)
      .sort((a, b) => a.stable!.start - b.stable!.start)

    expect(backbone[0]!.stable!.start).toBe(1004500)
    const last = backbone.at(-1)!
    expect(last.stable!.start + last.length).toBe(1004961)
    for (let i = 1; i < backbone.length; i++) {
      const prev = backbone[i - 1]!
      expect(backbone[i]!.stable!.start).toBe(prev.stable!.start + prev.length)
    }
  })

  // Carriage, which is the thing rGFA cannot state at any rank. Node 28 is the
  // 12 bp segment at chr:1,004,667 where CFT073 rejoins, so all five strains
  // walk it; its 1 bp neighbours are the per-strain SNP alleles.
  test('a node names every assembly that traverses it', () => {
    expect(nodeNamed(graph(), '28').samples).toEqual([
      'CFT073',
      'IAI39',
      'K12',
      'NCTC86',
      'Sakai',
    ])
  })

  test('carriage and depth agree', () => {
    for (const node of graph().nodes) {
      expect(node.samples!.length).toBeLessThanOrEqual(node.depth)
    }
  })

  // An allele the reference never visits still has exact coordinates — on the
  // assembly that carries it. That is what makes contributingAssemblies, and so
  // the launch menu, work on a graph with no SN tags.
  test('an off-reference node is placed on its own carrier', () => {
    const offReference = graph().nodes.filter(n => n.stable!.rank > 0)
    expect(offReference.length).toBeGreaterThan(0)
    for (const node of offReference) {
      expect(node.samples).toContain(node.stable!.refName.split('#')[0])
      expect(node.stable!.refName).not.toBe('K12#1#chr')
    }
  })

  test('choosing another path moves the backbone onto it', () => {
    const onSakai = anchorFromPaths(fixture('ecoli_pggb_subgraph.gfa'), 'Sakai')
    expect(onSakai.referencePath).toBe('Sakai#1#chr')
    const backbone = onSakai.nodes.filter(n => n.stable?.rank === 0)
    expect(Math.min(...backbone.map(n => n.stable!.start))).toBe(1133973)
  })

  // Re-anchoring reads the recorded walk, so it must not depend on having been
  // run against a different path first.
  test('re-anchoring is not order dependent', () => {
    const direct = anchorFromPaths(fixture('ecoli_pggb_subgraph.gfa'), 'CFT073')
    const viaK12 = anchorFromPaths(graph(), 'CFT073')
    expect(viaK12.nodes.map(n => n.stable)).toEqual(
      direct.nodes.map(n => n.stable),
    )
  })
})

test('rGFA keeps its own tags', () => {
  const rgfa = fixture('ecoli_rgfa_slice.gfa')
  expect(rgfa.anchoredBy).toBe('tags')
  expect(anchorGraph(rgfa, 'Sakai')).toBe(rgfa)
})

// A GFA with neither tags nor paths has no backbone to find, and saying so is
// what leaves the layout dropdown honest instead of drawing an invented axis.
test('a GFA with neither tags nor paths stays unanchored', () => {
  const graph = convertGFAToGraph(
    parseGFA('S\t1\tACGT\nS\t2\tGGCC\nL\t1\t+\t2\t+\t0M\n'),
  )
  expect(anchorGraph(graph, undefined).nodes.some(n => n.stable)).toBe(false)
})

describe('reference path choice', () => {
  const paths = [
    { name: 'K12#1#chr', sample: 'K12', start: 0, length: 100 },
    { name: 'Sakai#1#chr', sample: 'Sakai', start: 0, length: 100 },
  ]

  test('matches an assembly name against the PanSN sample', () => {
    expect(chooseReferencePath(paths, 'Sakai')!.name).toBe('Sakai#1#chr')
  })

  test('matches a full path name', () => {
    expect(chooseReferencePath(paths, 'Sakai#1#chr')!.name).toBe('Sakai#1#chr')
  })

  // Falling back beats leaving the graph unanchored: a name that matches
  // nothing is a stale session or a mistyped slot, not a reason to drop to
  // force-directed.
  test('an unmatched or absent preference takes the first path', () => {
    expect(chooseReferencePath(paths, 'IAI39')!.name).toBe('K12#1#chr')
    expect(chooseReferencePath(paths, undefined)!.name).toBe('K12#1#chr')
  })
})

// A path may reach the same segment twice, and pggb's collapsed rRNA operons
// make that the normal case rather than a corner one. First visit wins: a node
// draws as one tube at one x, and spanning both copies would claim reference
// the segment does not occupy.
test('a repeated segment takes its first visit', () => {
  const gfa =
    'S\ta\tACGTACGTAC\n' +
    'S\tr\tTTTTT\n' +
    'S\tb\tGGGGGGGGGG\n' +
    'L\ta\t+\tr\t+\t0M\n' +
    'L\tr\t+\tb\t+\t0M\n' +
    'L\tb\t+\tr\t+\t0M\n' +
    'P\tK12#1#chr\ta+,r+,b+,r+\t*\n'
  const graph = anchorGraph(convertGFAToGraph(parseGFA(gfa)), 'K12')

  expect(nodeNamed(graph, 'r').stable!.start).toBe(10)
  // the second copy is still visible as depth, which is a multiple of the path
  // count where a repeat is collapsed
  expect(nodeNamed(graph, 'r').depth).toBe(2)
  expect(nodeNamed(graph, 'b').stable!.start).toBe(15)
})

// A path may read a segment in either orientation, and the interval has to come
// from the path's own offset accumulation rather than from segment order.
// IAI39 is the strain this matters for in the E. coli graph: 350 of its ~1,074
// untangled segments are inverted, where every other strain has 4 or 5.
test('a reverse traversal accumulates forward along the path', () => {
  const gfa =
    'S\t1\tACGTA\n' +
    'S\t2\tGG\n' +
    'S\t3\tTTTT\n' +
    'L\t1\t+\t2\t+\t0M\n' +
    'L\t2\t+\t3\t+\t0M\n' +
    'P\tK12#1#chr:100-111\t3-,2-,1-\t*\n'
  const graph = anchorGraph(convertGFAToGraph(parseGFA(gfa)), 'K12')

  expect(nodeNamed(graph, '3').stable).toMatchObject({
    start: 100,
    strand: '-',
  })
  expect(nodeNamed(graph, '2').stable).toMatchObject({
    start: 104,
    strand: '-',
  })
  expect(nodeNamed(graph, '1').stable).toMatchObject({
    start: 106,
    strand: '-',
  })
})

// W records state their start as a field rather than in the name, and name the
// sample and haplotype in fields of their own.
test('walks anchor the same way paths do', () => {
  const gfa =
    'S\t1\tACGTA\n' +
    'S\t2\tGG\n' +
    'L\t1\t+\t2\t+\t0M\n' +
    'W\tK12\t1\tchr\t100\t107\t>1>2\n'
  const graph = anchorGraph(convertGFAToGraph(parseGFA(gfa)), 'K12')

  expect(nodeNamed(graph, '1').stable).toMatchObject({
    refName: 'K12#1#chr',
    start: 100,
    rank: 0,
  })
  expect(nodeNamed(graph, '2').stable!.start).toBe(105)
})

test('walk-derived carriage replaces an SM tag', () => {
  // Both statements present. The walk is authoritative -- it is the graph
  // itself saying who visits the segment -- so a file-loaded graph must not
  // keep a tag that some producer wrote earlier. The tabix route has no walk,
  // which is the case the tag exists for (gfaConverter.test.ts).
  const graph = convertGFAToGraph(
    parseGFA(`S\t1\tACGT\tSM:Z:Stale.9
S\t2\tGGCC
L\t1\t+\t2\t+\t0M
P\tK12#1#chr\t1+,2+\t*
P\tSakai#1#chr\t1+\t*`),
  )
  expect(graph.nodes.find(n => n.name === '1')!.samples).toEqual(['Stale.9'])

  const anchored = anchorGraph(graph, 'K12')
  expect(anchored.nodes.find(n => n.name === '1')!.samples).toEqual([
    'K12',
    'Sakai',
  ])
})
