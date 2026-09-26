import { convertGFAToGraph } from './gfaConverter'
import { parseGFA } from '../../gfa-core/index'
import { pathLegend } from '../pathColors'

test('converts simple GFA to graph with strand-specific nodes', () => {
  const gfa = parseGFA(`S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t+\t0M`)
  const graph = convertGFAToGraph(gfa, 'test')

  expect(graph.name).toBe('test')
  expect(graph.nodes).toHaveLength(2)
  expect(graph.nodes.map(n => n.id).sort()).toEqual(['1+', '2+'])
  expect(graph.edges).toHaveLength(1)
  expect(graph.edges[0]!.from).toBe('1+')
  expect(graph.edges[0]!.to).toBe('2+')
})

test('creates minus-strand nodes when linked', () => {
  const gfa = parseGFA(`S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t-\t0M`)
  const graph = convertGFAToGraph(gfa)

  const ids = graph.nodes.map(n => n.id).sort()
  expect(ids).toEqual(['1+', '2-'])
})

test('extracts depth from dp tag', () => {
  const gfa = parseGFA(`S\t1\tACGT\tdp:i:42
S\t2\tGGCC
L\t1\t+\t2\t+\t0M`)
  const graph = convertGFAToGraph(gfa)
  const node1 = graph.nodes.find(n => n.id === '1+')
  expect(node1!.depth).toBe(42)
})

test('maps paths to edges', () => {
  const gfa = parseGFA(`S\t1\tACGT
S\t2\tGGCC
S\t3\tTTAA
L\t1\t+\t2\t+\t0M
L\t2\t+\t3\t+\t0M
P\tp1\t1+,2+,3+\t*`)
  const graph = convertGFAToGraph(gfa)

  expect(graph.paths).toHaveLength(1)
  expect(graph.paths![0]!.name).toBe('p1')
  expect(graph.paths![0]!.nodeIds).toEqual(['1+', '2+', '3+'])

  expect(graph.edges[0]!.pathIds).toEqual(['p1'])
  expect(graph.edges[1]!.pathIds).toEqual(['p1'])
})

test('handles graph with no paths', () => {
  const gfa = parseGFA(`S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t+\t0M`)
  const graph = convertGFAToGraph(gfa)
  expect(graph.paths).toBeUndefined()
})

test('preserves node length from sequence', () => {
  const gfa = parseGFA('S\tnode1\tACGTACGT')
  const graph = convertGFAToGraph(gfa)
  expect(graph.nodes[0]!.length).toBe(8)
})

test('creates nodes from segment-only GFA (no links)', () => {
  const gfa = parseGFA(`S\tseq1\tACGT
S\tseq2\tGGCC`)
  const graph = convertGFAToGraph(gfa)
  expect(graph.nodes).toHaveLength(2)
  expect(graph.nodes.map(n => n.id).sort()).toEqual(['seq1+', 'seq2+'])
  expect(graph.edges).toHaveLength(0)
})

test('includes path-only nodes not referenced by links', () => {
  const gfa = parseGFA(`S\t1\tACGT
S\t2\tGGCC
S\t3\tTTAA
L\t1\t+\t2\t+\t0M
P\tp1\t1+,2+,3+\t*`)
  const graph = convertGFAToGraph(gfa)

  const ids = graph.nodes.map(n => n.id).sort()
  expect(ids).toContain('3+')
  expect(ids).toEqual(['1+', '2+', '3+'])
})

test('a path reading a segment in reverse lands on the same node', () => {
  const gfa = parseGFA(`S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t+\t0M
P\tp1\t1+,2+,1-\t*`)
  const graph = convertGFAToGraph(gfa)

  // `1-` is the same segment as `1+` read the other way, so it is one drawn
  // node the path revisits, not a second (edgeless) copy of it
  expect(graph.nodes.map(n => n.id).sort()).toEqual(['1+', '2+'])
  expect(graph.paths![0]!.nodeIds).toEqual(['1+', '2+', '1+'])
})

test('a graph whose paths all run reverse-strand keeps one node per segment', () => {
  // odgi sort -O emits exactly this: `++` links with paths walking them back to
  // front, which used to double every node and leave the copies edgeless
  const graph = convertGFAToGraph(
    parseGFA(`S\t1\tACGT
S\t2\tGGCC
S\t3\tTTAA
L\t1\t+\t2\t+\t0M
L\t2\t+\t3\t+\t0M
P\tsampleA\t3-,2-,1-\t*`),
  )
  expect(graph.nodes.map(n => n.id).sort()).toEqual(['1+', '2+', '3+'])
  const edgeless = new Set(graph.nodes.map(n => n.id))
  for (const e of graph.edges) {
    edgeless.delete(e.from)
    edgeless.delete(e.to)
  }
  expect([...edgeless]).toEqual([])
  // the path runs against the links' direction, and still marks both edges
  expect(graph.edges.map(e => e.pathIds)).toEqual([['sampleA'], ['sampleA']])
})

test('converts W-line walks to graph paths', () => {
  const gfa = parseGFA(`S\tA\tACGT
S\tB\tGGCC
S\tC\tTTAA
L\tA\t+\tB\t+\t0M
L\tB\t+\tC\t+\t0M
W\tsample1\t0\tchr1\t0\t1000\t>A>B>C`)
  const graph = convertGFAToGraph(gfa)

  expect(graph.paths).toHaveLength(1)
  expect(graph.paths![0]!.name).toBe('sample1#0#chr1')
  expect(graph.paths![0]!.nodeIds).toEqual(['A+', 'B+', 'C+'])
  expect(graph.paths![0]!.sample).toBe('sample1')
  expect(graph.paths![0]!.haplotype).toBe(0)
  expect(graph.paths![0]!.contig).toBe('chr1')
})

test('walks create strand-specific nodes', () => {
  const gfa = parseGFA(`S\tA\tACGT
S\tB\tGGCC
W\tsample1\t0\tchr1\t*\t*\t>A<B`)
  const graph = convertGFAToGraph(gfa)

  const ids = graph.nodes.map(n => n.id).sort()
  expect(ids).toEqual(['A+', 'B-'])
})

test('walks annotate edge pathIds', () => {
  const gfa = parseGFA(`S\tA\tACGT
S\tB\tGGCC
L\tA\t+\tB\t+\t0M
W\tw1\t0\tchr1\t*\t*\t>A>B
W\tw2\t1\tchr1\t*\t*\t>A>B`)
  const graph = convertGFAToGraph(gfa)

  const edge = graph.edges[0]!
  expect(edge.pathIds).toContain('w1#0#chr1')
  expect(edge.pathIds).toContain('w2#1#chr1')
})

test('handles getSubgraph output format (star sequences with LN tags)', () => {
  // This is the format produced by GfaAdapter/GfaTabixAdapter getSubgraph:
  // segments have * sequences with LN:i: tags, links and P-line paths
  const gfaText = [
    'H\tVN:Z:1.1',
    'S\ts1\t*\tLN:i:100',
    'S\ts2\t*\tLN:i:100',
    'S\ts3\t*\tLN:i:100',
    'S\ts4\t*\tLN:i:101',
    'L\ts1\t+\ts2\t+\t*',
    'L\ts1\t+\ts3\t+\t*',
    'L\ts2\t+\ts4\t+\t*',
    'L\ts3\t+\ts4\t+\t*',
    'P\tref#1#chr1\ts1+,s2+,s4+\t*',
    'P\tsample1#1#chr1\ts1+,s3+,s4+\t*',
  ].join('\n')

  const parsed = parseGFA(gfaText)
  expect(parsed.nodes).toHaveLength(4)
  expect(parsed.links).toHaveLength(4)
  expect(parsed.paths).toHaveLength(2)

  // LN:i: tag should set node length even with * sequence
  for (const node of parsed.nodes) {
    expect(node.length).toBeGreaterThan(0)
  }

  const graph = convertGFAToGraph(parsed, 'subgraph-test')
  expect(graph.nodes.length).toBe(4)
  expect(graph.edges.length).toBe(4)
  expect(graph.paths).toHaveLength(2)
  expect(graph.name).toBe('subgraph-test')

  // Verify node lengths are preserved from LN tags
  const s1 = graph.nodes.find(n => n.name === 's1')
  expect(s1!.length).toBe(100)
  const s4 = graph.nodes.find(n => n.name === 's4')
  expect(s4!.length).toBe(101)

  // Verify edges have path annotations
  const s1ToS2 = graph.edges.find(e => e.from === 's1+' && e.to === 's2+')
  expect(s1ToS2!.pathIds).toContain('ref#1#chr1')
})

test('handles self-loop links', () => {
  const gfa = parseGFA(`S\t1\tACGT
L\t1\t+\t1\t+\t0M`)
  const graph = convertGFAToGraph(gfa)
  expect(graph.nodes.map(n => n.id)).toEqual(['1+'])
  expect(graph.edges).toHaveLength(1)
  expect(graph.edges[0]!.from).toBe('1+')
  expect(graph.edges[0]!.to).toBe('1+')
})

// RC, FC and KC are counts, so a depth is the count over the segment's length
test('reads RC/FC/KC as a count over the length when dp is absent', () => {
  const rc = convertGFAToGraph(parseGFA('S\t1\tACGT\tRC:i:8'))
  expect(rc.nodes[0]!.depth).toBe(2)
  const fc = convertGFAToGraph(parseGFA('S\t1\tACGT\tFC:i:12'))
  expect(fc.nodes[0]!.depth).toBe(3)
  const kc = convertGFAToGraph(parseGFA('S\t1\tACGT\tKC:i:20'))
  expect(kc.nodes[0]!.depth).toBe(5)
})

test('a long node at low coverage is not deeper than a short one at high coverage', () => {
  const graph = convertGFAToGraph(
    parseGFA(
      'S\tlong\t*\tLN:i:100000\tRC:i:500000\nS\tshort\t*\tLN:i:1000\tRC:i:50000',
    ),
  )
  const depthOf = (name: string) =>
    graph.nodes.find(n => n.name === name)!.depth
  expect(depthOf('long')).toBe(5)
  expect(depthOf('short')).toBe(50)
})

test('DP is read in either case, and wins over a count', () => {
  const upper = convertGFAToGraph(parseGFA('S\t1\tACGT\tDP:f:12.5'))
  expect(upper.nodes[0]!.depth).toBe(12.5)
  const both = convertGFAToGraph(parseGFA('S\t1\tACGT\tdp:i:42\tRC:i:8'))
  expect(both.nodes[0]!.depth).toBe(42)
})

test('a count on a segment with no length falls back rather than dividing by zero', () => {
  const graph = convertGFAToGraph(parseGFA('S\t1\t*\tRC:i:8'))
  expect(graph.nodes[0]!.depth).toBe(1)
})

test('falls back to depth 1 for zero or missing depth tags', () => {
  const zero = convertGFAToGraph(parseGFA('S\t1\tACGT\tdp:i:0'))
  expect(zero.nodes[0]!.depth).toBe(1)
  const missing = convertGFAToGraph(parseGFA('S\t1\tACGT'))
  expect(missing.nodes[0]!.depth).toBe(1)
})

test('derives depth from path traversals when no depth tag is present', () => {
  // Pangenome-style bubble: two of the three samples take node 2, one takes
  // the alt node 3, and all three rejoin on node 4.
  const graph = convertGFAToGraph(
    parseGFA(`S\t1\tACGT
S\t2\tGG
S\t3\tTT
S\t4\tCCCC
L\t1\t+\t2\t+\t0M
L\t1\t+\t3\t+\t0M
L\t2\t+\t4\t+\t0M
L\t3\t+\t4\t+\t0M
P\tsampleA\t1+,2+,4+\t*
P\tsampleB\t1+,2+,4+\t*
P\tsampleC\t1+,3+,4+\t*`),
  )
  const depthOf = (id: string) => graph.nodes.find(n => n.id === id)!.depth
  expect(depthOf('1+')).toBe(3)
  expect(depthOf('2+')).toBe(2)
  expect(depthOf('3+')).toBe(1)
  expect(depthOf('4+')).toBe(3)
})

test('a dp tag still wins over path traversals', () => {
  const graph = convertGFAToGraph(
    parseGFA(`S\t1\tACGT\tdp:i:42
P\tsampleA\t1+\t*
P\tsampleB\t1+\t*`),
  )
  expect(graph.nodes[0]!.depth).toBe(42)
})

test('handles empty GFA text', () => {
  const graph = convertGFAToGraph(parseGFA(''))
  expect(graph.nodes).toHaveLength(0)
  expect(graph.edges).toHaveLength(0)
  expect(graph.paths).toBeUndefined()
})

test('mixed P-lines and W-lines both become paths', () => {
  const gfa = parseGFA(`S\tA\tACGT
S\tB\tGGCC
S\tC\tTTAA
L\tA\t+\tB\t+\t0M
L\tB\t+\tC\t+\t0M
P\tref\tA+,B+,C+\t*
W\tsample1\t0\tchr1\t0\t1000\t>A>B>C`)
  const graph = convertGFAToGraph(gfa)

  expect(graph.paths).toHaveLength(2)
  expect(graph.paths![0]!.name).toBe('ref')
  expect(graph.paths![1]!.name).toBe('sample1#0#chr1')
  expect(graph.paths![1]!.sample).toBe('sample1')
})

test('reads carriage off the SM tag, per haplotype', () => {
  const gfa =
    parseGFA(`S\t1\tACGT\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\tSM:Z:K12.1,Sakai.1
S\t2\tGGCC\tSN:Z:K12#1#chr\tSO:i:4\tSR:i:0
L\t1\t+\t2\t+\t0M`)
  const graph = convertGFAToGraph(gfa)

  // the tabix route synthesizes S-lines with this tag; it is the only statement
  // of carriage a cut with no P/W lines can carry
  expect(graph.nodes.find(n => n.name === '1')!.samples).toEqual([
    'K12.1',
    'Sakai.1',
  ])
  // absent rather than empty, so a segment that says nothing is distinguishable
  // from one carried by nobody
  expect(graph.nodes.find(n => n.name === '2')!.samples).toBeUndefined()
})

test('the converter does not anchor, so the tag survives it unread', () => {
  // convertGFAToGraph is the parse step only; anchoring against a chosen
  // reference path is anchorGraph's job and is covered in pathAnchoring.test.ts,
  // where the walk-derived carriage replaces this. Asserted here so a future
  // reader does not mistake this for the precedence rule.
  const gfa = parseGFA(`S\t1\tACGT\tSM:Z:Tagged.1
S\t2\tGGCC
L\t1\t+\t2\t+\t0M
P\tK12#1#chr\t1+,2+\t*`)
  const graph = convertGFAToGraph(gfa)
  expect(graph.nodes.find(n => n.name === '1')!.samples).toEqual(['Tagged.1'])
})

// One assembly walks one W record per contig, which is the ordinary
// Minigraph-Cactus shape. Naming a path for the assembly rather than for the
// record gave those two walks one identity: the edge map merged them, and the
// legend drew one haplotype twice in two colours.
test('two walks of one haplotype stay two paths', () => {
  const gfa = parseGFA(`S\ts1\tACGTACGTAC
S\ts2\tACGTACGTAC
S\ts3\tACGTACGTAC
S\ts4\tACGTACGTAC
L\ts1\t+\ts2\t+\t0M
L\ts3\t+\ts4\t+\t0M
W\tHG1\t1\tchrA\t0\t20\t>s1>s2
W\tHG1\t1\tchrB\t0\t20\t>s3>s4
W\tHG2\t1\tchrA\t0\t20\t>s1>s2`)
  const graph = convertGFAToGraph(gfa)

  expect(graph.paths!.map(p => p.name)).toEqual([
    'HG1#1#chrA',
    'HG1#1#chrB',
    'HG2#1#chrA',
  ])
  // and the names are the ones the coordinate walk uses, so the two lists
  // describe the same records
  expect(graph.anchorPaths!.map(p => p.name)).toEqual(
    graph.paths!.map(p => p.name),
  )
  // the legend widens only far enough to tell them apart, and no two entries
  // now share a label while carrying different colours
  const legend = pathLegend(graph.paths!)
  expect(legend.map(e => e.label)).toEqual([
    'HG1#1#chrA',
    'HG1#1#chrB',
    'HG2#1#chrA',
  ])
})

// A graph with one contig per haplotype is the case every shipped figure is, so
// widening the name must not widen its labels.
test('one contig per haplotype still labels by haplotype', () => {
  const gfa = parseGFA(`S\ts1\tACGTACGTAC
S\ts2\tACGTACGTAC
L\ts1\t+\ts2\t+\t0M
W\tHG1\t1\tchrM\t0\t20\t>s1>s2
W\tHG1\t2\tchrM\t0\t20\t>s1>s2`)
  const graph = convertGFAToGraph(gfa)

  expect(pathLegend(graph.paths!).map(e => e.label)).toEqual(['HG1#1', 'HG1#2'])
})
