import { anchoredLayout } from './anchoredLayout'
import { ROW_HEIGHT_PX } from './rowSpacing'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { anchorGraph } from '../pathAnchoring'

// The worked example from gfatools/doc/rGFA.md: chr1 runs v1->v2->v3->v4, and
// foo carries an alternate allele (v5,v6) that leaves and rejoins it.
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

function layout(gfa: string) {
  const result = anchoredLayout(convertGFAToGraph(parseGFA(gfa)))
  return result!.nodePositions
}

test('reference segments lay out at the offset they declare', () => {
  const pos = layout(RGFA)
  expect(pos['v1+']).toEqual([
    { x: 0, y: 0 },
    { x: 5, y: 0 },
  ])
  expect(pos['v2+']![0]).toEqual({ x: 5, y: 0 })
  expect(pos['v4+']![0]).toEqual({ x: 10, y: 0 })
})

test('off-reference segments sit on their rank row, between their anchors', () => {
  const pos = layout(RGFA)
  const alt = [pos['v5+']![0]!, pos['v6+']![0]!]
  // rank 1, so one row off the backbone, and not on it
  expect(new Set(alt.map(p => p.y)).size).toBe(1)
  expect(alt[0]!.y).toBeGreaterThan(0)
  // bounded by the segments they attach to (v2 starts at 5, v4 ends at 17)
  for (const p of alt) {
    expect(p.x).toBeGreaterThanOrEqual(5)
    expect(p.x).toBeLessThanOrEqual(17)
  }
})

test('a plain GFA with no stable tags gets no anchored layout', () => {
  const plain = parseGFA(`S\t1\tACGT
S\t2\tGGCC
L\t1\t+\t2\t+\t0M`)
  expect(anchoredLayout(convertGFAToGraph(plain))).toBeUndefined()
})

// The same graph with a path is anchorable: the path states in step order what
// rGFA states in SN/SO tags, and once walked the reference axis is the same
// axis. This is the whole of what pathAnchoring buys the layout.
test('a path GFA lays out on the axis its reference path declares', () => {
  const withPath = parseGFA(`S\t1\tAAAAA
S\t2\tCCC
S\t3\tGG
L\t1\t+\t2\t+\t0M
L\t2\t+\t3\t+\t0M
P\tK12#1#chr:100-110\t1+,2+,3+\t*`)
  const pos = anchoredLayout(
    anchorGraph(convertGFAToGraph(withPath), 'K12'),
  )!.nodePositions

  expect(pos['1+']).toEqual([
    { x: 100, y: 0 },
    { x: 105, y: 0 },
  ])
  expect(pos['3+']![0]).toEqual({ x: 108, y: 0 })
})

// Rank is a whole-graph property: HPRC's minigraph graph ranks up to 89 while
// any one window holds a handful. Rows are the ranks present, so a window with
// ranks 0 and 23 draws two rows, not twenty-four — otherwise zoom-to-fit shrinks
// the drawing to fit the empty ones.
const SPARSE_RANKS = `S\tv1\tAAAAA\tLN:i:5\tSN:Z:chr6\tSO:i:0\tSR:i:0
S\tv2\tCCC\tLN:i:3\tSN:Z:chr6\tSO:i:5\tSR:i:0
S\tv3\tAC\tLN:i:2\tSN:Z:hap23\tSO:i:900\tSR:i:23
L\tv1\t+\tv2\t+\t0M
L\tv1\t+\tv3\t+\t0M`

test('rows are the ranks present, not the raw rank', () => {
  const pos = layout(SPARSE_RANKS)
  const backboneY = pos['v1+']![0]!.y
  const altY = pos['v3+']![0]!.y
  expect(backboneY).toBe(0)
  // one row down, where rank 1 would sit — not 23. A row is ROW_HEIGHT_PX and
  // does not depend on the graph, so 23 would be 460.
  expect(altY).toBeCloseTo(ROW_HEIGHT_PX)
})

// The E. coli demo graph holds every rank from 0, where compaction is the
// identity — the property that keeps the committed figures byte-stable.
test('a contiguous run of ranks is left where it was', () => {
  const pos = layout(RGFA)
  expect(pos['v5+']![0]!.y).toBe(pos['v6+']![0]!.y)
  expect(pos['v5+']![0]!.y).toBeGreaterThan(0)
})

describe('off-reference minimum length', () => {
  // rank-0 backbone spanning 0-10000, plus a 5 bp allele branching off it
  const graph = {
    nodes: [
      {
        id: 'a+',
        name: 'a',
        length: 5000,
        stable: { refName: 'chr', start: 0, rank: 0 },
      },
      {
        id: 'b+',
        name: 'b',
        length: 5000,
        stable: { refName: 'chr', start: 5000, rank: 0 },
      },
      {
        id: 'alt+',
        name: 'alt',
        length: 5,
        stable: { refName: 'other', start: 0, rank: 1 },
      },
    ],
    edges: [{ from: 'a+', to: 'alt+' }],
  } as unknown as Parameters<typeof anchoredLayout>[0]

  const width = (
    r: NonNullable<ReturnType<typeof anchoredLayout>>,
    id: string,
  ) => {
    const seg = r.nodePositions[id]!
    return seg.at(-1)!.x - seg[0]!.x
  }

  test('a 5 bp allele is widened to the span floor so it can be seen', () => {
    const result = anchoredLayout(graph)!
    // 1.5% of the 10000 bp span
    expect(width(result, 'alt+')).toBeCloseTo(150, 5)
  })

  test('rank-0 nodes keep their true length and declared offsets', () => {
    const result = anchoredLayout(graph)!
    expect(width(result, 'a+')).toBe(5000)
    expect(width(result, 'b+')).toBe(5000)
    expect(result.nodePositions['b+']![0]!.x).toBe(5000)
  })

  // This allele branches off the backbone and never rejoins, so no reference
  // span can be stated for it and the floor is the only honest width. It used
  // to be drawn at its sequence length, which is a claim about reference
  // coordinates the graph does not support.
  test('a single-anchored run takes the floor whatever its sequence length', () => {
    const big = {
      ...graph,
      nodes: [
        graph.nodes[0]!,
        graph.nodes[1]!,
        { ...graph.nodes[2]!, length: 4000 },
      ],
    }
    expect(width(anchoredLayout(big)!, 'alt+')).toBeCloseTo(150, 5)
  })

  // ...whereas an allele that does rejoin has a span, and takes exactly it. The
  // two backbone segments leave 2000 bp between them; the allele carries 40000
  // bp of sequence and still occupies only those 2000.
  test('an allele that rejoins the backbone occupies the reference it replaces', () => {
    const spanning = {
      nodes: [
        {
          id: 'a+',
          name: 'a',
          length: 4000,
          stable: { refName: 'chr', start: 0, rank: 0 },
        },
        {
          id: 'b+',
          name: 'b',
          length: 4000,
          stable: { refName: 'chr', start: 6000, rank: 0 },
        },
        {
          id: 'alt+',
          name: 'alt',
          length: 40000,
          stable: { refName: 'other', start: 0, rank: 1 },
        },
      ],
      edges: [
        { from: 'a+', to: 'alt+' },
        { from: 'alt+', to: 'b+' },
      ],
    } as unknown as Parameters<typeof anchoredLayout>[0]

    const result = anchoredLayout(spanning)!
    expect(width(result, 'alt+')).toBe(2000)
    expect(result.nodePositions['alt+']![0]!.x).toBe(4000)
  })
})

test('a node with no coordinate takes the spare row below the ranks', () => {
  const graph = convertGFAToGraph(parseGFA(RGFA))
  graph.nodes.push({ id: 'x+', name: 'x', length: 2, depth: 1 })
  graph.edges.push({ from: 'v5+', to: 'x+' })
  const pos = anchoredLayout(graph)!.nodePositions
  expect(pos['v5+']![0]!.y).toBe(ROW_HEIGHT_PX)
  expect(pos['x+']![0]!.y).toBe(2 * ROW_HEIGHT_PX)
})
