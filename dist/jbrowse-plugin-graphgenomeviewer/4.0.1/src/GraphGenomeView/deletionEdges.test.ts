import { readFileSync } from 'fs'
import { join } from 'path'

import { deletionEdges } from './deletionEdges'
import { convertGFAToGraph } from './gfa/gfaConverter'
import { parseGFA } from '../gfa-core/index'
import { computeEdgeCurves, curvePointAt } from './util/geometry'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

function graphOf(gfa: string) {
  return convertGFAToGraph(parseGFA(gfa))
}

// Two backbone segments that abut, plus one that resumes 6,000 bp later: only
// the second link is a deletion, and it is worth exactly the gap.
const RGFA =
  'H\tVN:Z:1.0\n' +
  'S\t1\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:1000\tSR:i:0\n' +
  'S\t2\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:1010\tSR:i:0\n' +
  'S\t3\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:7020\tSR:i:0\n' +
  'S\t4\tTTTT\tSN:Z:HG02717#1#chr6\tSO:i:9000\tSR:i:1\n' +
  'L\t1\t+\t2\t+\t0M\n' +
  'L\t2\t+\t3\t+\t0M\n' +
  'L\t2\t+\t4\t+\t0M\n' +
  'L\t4\t+\t3\t+\t0M\n'

test('a backbone link that skips reference is a deletion of the gap', () => {
  const found = deletionEdges(graphOf(RGFA))
  expect(found).toHaveLength(1)
  expect(found[0]).toMatchObject({
    refName: 'GRCh38#0#chr6',
    start: 1020,
    end: 7020,
    bp: 6000,
  })
})

test('adjacent backbone segments are not a deletion', () => {
  // 1 -> 2 abut exactly; a zero gap must not light up, or every link on the
  // backbone would draw as an event
  expect(deletionEdges(graphOf(RGFA)).map(d => d.bp)).not.toContain(0)
})

test('an allele detour is not a deletion, at either end', () => {
  // 2 -> 4 and 4 -> 3 both touch a rank-1 node, which has coordinates on
  // another assembly entirely: a gap computed across them would be meaningless
  const byId = new Map(graphOf(RGFA).nodes.map(n => [n.id, n]))
  const edges = graphOf(RGFA).edges
  for (const { edgeIndex } of deletionEdges(graphOf(RGFA))) {
    const e = edges[edgeIndex]!
    expect(byId.get(e.from)!.stable!.rank).toBe(0)
    expect(byId.get(e.to)!.stable!.rank).toBe(0)
  }
})

// A link joins the END of its first segment, read the way it states, to the
// START of its second. So `L 2 + 3 +` written from the other strand is
// `L 3 - 2 -`, both segments reversed, and minigraph writes links that way.
test('a link stated from the other strand still measures the gap forwards', () => {
  const mirrored = RGFA.replace('L\t2\t+\t3\t+\t0M', 'L\t3\t-\t2\t-\t0M')
  expect(deletionEdges(graphOf(mirrored))[0]).toMatchObject({
    start: 1020,
    end: 7020,
    bp: 6000,
  })
})

// `L 3 + 2 +` is not that link. It leaves the end of 3 and arrives at the start
// of 2: sequence read again, a tandem duplication, which skips nothing. Told
// apart by coordinates alone it was a 6 kb deletion, and with deletion edges
// hidden, the default, the link was not drawn at all.
test('a link back along the reference is a duplication, not a deletion', () => {
  const back = RGFA.replace('L\t2\t+\t3\t+\t0M', 'L\t3\t+\t2\t+\t0M')
  expect(deletionEdges(graphOf(back))).toEqual([])
})

// `L 2 + 3 -` arrives at the END of 3: an inversion junction.
test('a link into the far side of a segment is an inversion, not a deletion', () => {
  const inverted = RGFA.replace('L\t2\t+\t3\t+\t0M', 'L\t2\t+\t3\t-\t0M')
  expect(deletionEdges(graphOf(inverted))).toEqual([])
})

// A graph built without the strands, by hand or by an older snapshot, reads the
// way it always has.
test('a link that states no strands is judged by its coordinates', () => {
  const graph = graphOf(RGFA)
  const bare = {
    ...graph,
    edges: graph.edges.map(({ from, to }) => ({ from, to })),
  }
  expect(deletionEdges(bare)).toHaveLength(1)
})

test('an unanchored graph has no deletions rather than throwing', () => {
  const plain = 'H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGGCC\nL\t1\t+\t2\t+\t0M\n'
  expect(deletionEdges(graphOf(plain))).toEqual([])
})

// The real four-strain minigraph slice, so the classification is exercised
// against a graph nobody wrote for this test.
test('finds deletions on the E. coli rGFA slice', () => {
  const gfa = readFileSync(
    join(__dirname, '../../test_data/ecoli_rgfa_slice.gfa'),
    'utf8',
  )
  const found = deletionEdges(graphOf(gfa))
  expect(found.length).toBeGreaterThan(0)
  for (const d of found) {
    expect(d.bp).toBeGreaterThan(0)
    expect(d.end).toBeGreaterThan(d.start)
  }
})

test('names the backbone the deletion skips', () => {
  // segment 2 ends at 1020 and 3 starts at 7020, so nothing lies between them
  // here; add one that does and it must be reported
  const withMiddle = RGFA.replace(
    'S\t3\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:7020\tSR:i:0\n',
    'S\t5\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:3000\tSR:i:0\n' +
      'S\t3\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:7020\tSR:i:0\n',
  )
  const [deletion] = deletionEdges(graphOf(withMiddle))
  // both orientations of the bypassed segment, which is what the layout keys by
  expect(deletion!.bypassed.map(id => id.replace(/[+-]$/, ''))).toContain('5')
})

// The arc has to bow without detaching: a deletion is drawn as an alternative
// route to the backbone it skips, so its endpoints stay on the two nodes it
// joins while its middle leaves the straight line between them.
test('a bulge moves the curve off the chord but not its endpoints', () => {
  const from = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ]
  const to = [
    { x: 110, y: 0 },
    { x: 210, y: 0 },
  ]
  // where the layout put the reference this deletion skips: off the chord, which
  // is the force-directed case
  const bypassed = [
    { x: 105, y: -60 },
    { x: 105, y: -160 },
  ]
  const flat = computeEdgeCurves(from, to, false, 0, 0, iso())[0]!
  const bowed = computeEdgeCurves(from, to, false, 0, 0, iso(), bypassed)[0]!
  expect([bowed.x0, bowed.y0, bowed.x1, bowed.y1]).toEqual([
    flat.x0,
    flat.y0,
    flat.x1,
    flat.y1,
  ])
  expect(Math.abs(bowed.cy0)).toBeGreaterThan(Math.abs(flat.cy0) + 10)
})

// The amylase 94.2 kb arc: the bow used to take a hardcoded side, so whether it
// landed on the reference it names or ballooned into the empty half of the
// drawing was down to which way the simulation happened to throw that run. On
// that figure the run reached 739 units one way off a 16-unit chord and the arc
// bowed 719 the other -- a loop enclosing nothing, beside the thing it meant.
test('the arc bows to the side the bypassed reference is on', () => {
  const from = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ]
  const to = [
    { x: 110, y: 0 },
    { x: 210, y: 0 },
  ]
  const at = (y: number) =>
    computeEdgeCurves(from, to, false, 0, 0, iso(), [
      { x: 105, y },
      { x: 145, y },
    ])[0]!
  // the chord runs along y = 0, so the control points' sign is the side taken
  expect(Math.sign(at(-200).cy0)).toBe(-1)
  expect(Math.sign(at(200).cy0)).toBe(1)
})

// ...and it clears that run rather than cutting through it, which is the other
// half of reading as a route around something.
test('the arc reaches past the reference it bows around', () => {
  const from = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ]
  const to = [
    { x: 110, y: 0 },
    { x: 210, y: 0 },
  ]
  const curves = computeEdgeCurves(from, to, false, 0, 0, iso(), [
    { x: 105, y: 300 },
    { x: 145, y: 300 },
  ])
  expect(curvePointAt(curves[0]!, 0.5).y).toBeGreaterThan(300)
})
