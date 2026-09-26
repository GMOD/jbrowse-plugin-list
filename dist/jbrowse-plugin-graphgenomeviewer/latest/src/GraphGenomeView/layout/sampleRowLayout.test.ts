import { readFileSync } from 'fs'

import { ROW_HEIGHT_PX } from './rowSpacing'
import { sampleRowLayout } from './sampleRowLayout'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { anchorGraph } from '../pathAnchoring'

function ecoliGraph() {
  const gfa = readFileSync(
    require.resolve('../../../test_data/ecoli_rgfa_slice.gfa'),
    'utf8',
  )
  return convertGFAToGraph(parseGFA(gfa), 'ecoli')
}

function pggbGraph() {
  const gfa = readFileSync(
    require.resolve('../../../test_data/ecoli_pggb_subgraph.gfa'),
    'utf8',
  )
  return convertGFAToGraph(parseGFA(gfa), 'pggb')
}

test('rows are the backbone plus one per contributing assembly', () => {
  const { rowLabels } = sampleRowLayout(ecoliGraph())!
  // the reference keeps row 0; the rest are ordered by content, not by name
  expect(rowLabels![0]!.label).toBe('K12')
  expect(rowLabels!.map(r => r.label).sort()).toEqual([
    'CFT073',
    'K12',
    'NCTC86',
    'Sakai',
  ])
})

// Alphabetical put HG00099 above HG00280 for no reason a reader could see, so a
// row's neighbours said nothing. Ordering by contributed sequence reads the way
// a sorted pileup does — most divergent at the top, and how far down the stack
// the marks stop is how many samples carry anything.
test('rows are ordered by the sequence each sample contributes', () => {
  const graph = ecoliGraph()
  const { rowLabels } = sampleRowLayout(graph)!
  const carried = new Map<string, number>()
  for (const node of graph.nodes) {
    if (node.stable && node.stable.rank > 0) {
      const sample = node.stable.refName.split('#')[0]!
      carried.set(sample, (carried.get(sample) ?? 0) + node.length)
    }
  }
  // row 0 is the backbone, which contributes none of this and is not in the sort
  const bp = rowLabels!.slice(1).map(r => carried.get(r.label)!)
  expect(bp.length).toBeGreaterThan(1)
  expect(bp).toEqual([...bp].sort((a, b) => b - a))
  // and it is a real ordering rather than a tie everywhere
  expect(new Set(bp).size).toBeGreaterThan(1)
})

// A label that names a row the layout put elsewhere is worse than no label, so
// this checks the two against each other rather than against a fixed number.
test('each row label sits at the y its own samples were drawn at', () => {
  const graph = ecoliGraph()
  const { nodePositions, rowLabels } = sampleRowLayout(graph)!
  const labelY = new Map(rowLabels!.map(r => [r.label, r.y]))
  for (const node of graph.nodes) {
    const position = nodePositions[node.id]
    if (position && node.stable) {
      const sample = node.stable.refName.split('#')[0]!
      expect(labelY.get(sample)).toBe(position[0]!.y)
    }
  }
})

// x on this layout is reference bp, so an allele may only occupy the reference
// it replaces. An insertion replaces none, and drawing it at its own sequence
// length put a 113 kb E. coli allele across coordinates it does not own and
// collapsed zoom-to-fit to 1%.
test('a pure insertion does not advance along the reference axis', () => {
  const gfa =
    'H\tVN:Z:1.0\n' +
    'S\ts1\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\n' +
    'S\ts2\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:500\tSR:i:0\n' +
    'S\ta1\t*\tLN:i:100000\tSN:Z:Sakai#1#chr\tSO:i:0\tSR:i:1\n' +
    'L\ts1\t+\ta1\t+\t0M\n' +
    'L\ta1\t+\ts2\t+\t0M\n'
  const graph = convertGFAToGraph(parseGFA(gfa), 'insertion')

  const { nodePositions } = sampleRowLayout(graph)!

  // the 100 kb allele draws as a marker at its anchor, at the 1.5% visibility
  // floor of the 1000 bp window, not at 100000
  // node ids carry a strand suffix; the segment is a1
  const [left, right] = nodePositions['a1+']!
  expect(right!.x - left!.x).toBe(15)

  // so nothing is drawn outside the window the backbone defines, give or take
  // that marker
  const xs = Object.values(nodePositions).flatMap(segs => segs.map(s => s.x))
  expect(Math.max(...xs)).toBeLessThanOrEqual(1015)
})

// The other side of the same rule: a deletion does consume reference, so it
// keeps its true width and the row reads as empty across exactly that span.
test('a deletion draws at its true reference width', () => {
  const gfa =
    'H\tVN:Z:1.0\n' +
    'S\ts1\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\n' +
    'S\ts2\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:500\tSR:i:0\n' +
    'S\ts3\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:1000\tSR:i:0\n' +
    'S\ta1\t*\tLN:i:100\tSN:Z:Sakai#1#chr\tSO:i:0\tSR:i:1\n' +
    'L\ts1\t+\ta1\t+\t0M\n' +
    'L\ta1\t+\ts3\t+\t0M\n'
  const graph = convertGFAToGraph(parseGFA(gfa), 'deletion')

  const { nodePositions } = sampleRowLayout(graph)!

  // 100 bp of sequence replacing s2's 500 bp of reference: it spans the
  // reference it replaces, not the sequence it carries
  const [left, right] = nodePositions['a1+']!
  expect(right!.x - left!.x).toBe(500)
})

// A pggb GFA tags no segment with a coordinate, so until its paths are walked
// there is no backbone to row against and inventing one would be inventing an
// axis.
test('declines a graph with no rank-0 backbone rather than inventing one', () => {
  expect(sampleRowLayout(pggbGraph())).toBeUndefined()
})

// Walked, the same graph rows exactly like the rGFA one — and better: a row
// here is a strain that carries the allele, where rGFA's is the strain that
// first contributed it.
test('a pggb graph rows once its paths are walked', () => {
  const graph = anchorGraph(pggbGraph(), 'K12')
  const { nodePositions, rowLabels } = sampleRowLayout(graph)!

  expect(rowLabels![0]!.label).toBe('K12')
  expect(rowLabels!.map(r => r.label).sort()).toEqual([
    'CFT073',
    'IAI39',
    'K12',
    'NCTC86',
    'Sakai',
  ])
  // every node drawn, and every one of them on the row its own stable name
  // names — no node stranded off the rows the labels claim
  expect(Object.keys(nodePositions)).toHaveLength(graph.nodes.length)
  const labelY = new Map(rowLabels!.map(r => [r.label, r.y]))
  for (const node of graph.nodes) {
    const sample = node.stable!.refName.split('#')[0]!
    expect(nodePositions[node.id]![0]!.y).toBe(labelY.get(sample))
  }
})

// The drawn width of an allele's segments is apportioned by their share of the
// run's total length, so a run that is all zero-length segments divided 0 by 0
// and wrote NaN into every position downstream of it.
test('a zero-length allele gets finite positions', () => {
  const gfa =
    'H\tVN:Z:1.0\n' +
    'S\ts1\t*\tLN:i:100\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\n' +
    'S\ts2\t*\tLN:i:100\tSN:Z:K12#1#chr\tSO:i:100\tSR:i:0\n' +
    'S\ta1\t*\tLN:i:0\tSN:Z:Sakai#1#chr\tSO:i:0\tSR:i:1\n' +
    'L\ts1\t+\ta1\t+\t0M\n' +
    'L\ta1\t+\ts2\t+\t0M\n'
  const graph = convertGFAToGraph(parseGFA(gfa), 'zero')

  const { nodePositions } = sampleRowLayout(graph)!

  for (const segments of Object.values(nodePositions)) {
    for (const { x, y } of segments) {
      expect(Number.isFinite(x)).toBe(true)
      expect(Number.isFinite(y)).toBe(true)
    }
  }
})

// A row is a fixed number of SCREEN PIXELS and depends on nothing else — not on
// how many rows there are, and not on how much reference the window covers.
// Both used to move it, because y was in bp and one scale drew both axes: the
// pitch was a fraction of the span, and a ceiling on the total then squeezed it
// as rows were added. This is the assertion those two rules collapse into.
function rowsGraph(sampleCount: number, backboneBp: number) {
  const samples = Array.from({ length: sampleCount }, (_, i) => `HG${1000 + i}`)
  return convertGFAToGraph(
    parseGFA(
      [
        'H\tVN:Z:1.0',
        `S\ts1\t*\tLN:i:${backboneBp / 2}\tSN:Z:GRCh38#0#chr6\tSO:i:0\tSR:i:0`,
        `S\ts2\t*\tLN:i:${backboneBp / 2}\tSN:Z:GRCh38#0#chr6\tSO:i:${backboneBp / 2}\tSR:i:0`,
        ...samples.flatMap((sample, i) => [
          `S\ta${i}\t*\tLN:i:50\tSN:Z:${sample}#1#chr6\tSO:i:0\tSR:i:1`,
          `L\ts1\t+\ta${i}\t+\t0M`,
          `L\ta${i}\t+\ts2\t+\t0M`,
        ]),
      ].join('\n'),
    ),
    'rows',
  )
}

test('a row is a constant pitch, whatever the row count or the span', () => {
  const pitchOf = (sampleCount: number, backboneBp: number) => {
    const { rowLabels } = sampleRowLayout(rowsGraph(sampleCount, backboneBp))!
    expect(rowLabels).toHaveLength(sampleCount + 1)
    return rowLabels!.at(-1)!.y / sampleCount
  }
  expect(pitchOf(16, 2000)).toBeCloseTo(ROW_HEIGHT_PX)
  expect(pitchOf(2, 2000)).toBeCloseTo(ROW_HEIGHT_PX)
  expect(pitchOf(16, 5_000_000)).toBeCloseTo(ROW_HEIGHT_PX)
})

// ...and the rows are evenly spaced, so a reader can tell one row from the next
// by looking rather than by counting.
test('rows are evenly spaced', () => {
  const { rowLabels } = sampleRowLayout(ecoliGraph())!
  const rows = rowLabels!.map(r => r.y)
  const spacing = rows[1]! - rows[0]!
  expect(rows[3]! - rows[2]!).toBeCloseTo(spacing)
  expect(rows.at(-1)!).toBeCloseTo(spacing * 3)
})

// The other half of the same rule. An allele occupies the reference it replaces,
// so when it carries far less sequence than that, its BAR is a deletion and its
// own length is not what the width means. The layout is the only thing that
// knows this — under FMMM the same node is drawn at its own scale — so it says
// so, and graphLabels turns it into the same words a bare-edge deletion gets.
test('an allele carrying less than the reference it replaces is reported as a deletion', () => {
  const gfa =
    'H\tVN:Z:1.0\n' +
    'S\ts1\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\n' +
    'S\ts2\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:7500\tSR:i:0\n' +
    'S\ta1\t*\tLN:i:93\tSN:Z:CFT073#1#chr\tSO:i:1048515\tSR:i:1\n' +
    'L\ts1\t+\ta1\t+\t0M\n' +
    'L\ta1\t+\ts2\t+\t0M\n'
  const graph = convertGFAToGraph(parseGFA(gfa), 'deletion')

  const { alleleDeletions } = sampleRowLayout(graph)!

  // 7,000 bp of K12 between the two anchors, 93 bp of CFT073 across it
  expect(alleleDeletions).toEqual([{ nodeIds: ['a1+'], bp: 6907 }])
})

// Which measure of "carries less" is used matters, and only one of them is
// right. A run is measured by the longest path THROUGH it, not by its segments
// summed: two 600 bp alternatives over 1,000 bp of reference sum to 1,200 and
// read as an insertion, where either haplotype taking one of them is missing
// 400 bp. Arms that do not touch each other are also separate runs — a run is a
// connected component of off-reference segments — so each states its own 400.
test('a bubble arm is measured by the path through it, not by segments summed', () => {
  const gfa =
    'H\tVN:Z:1.0\n' +
    'S\ts1\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\n' +
    'S\ts2\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:1500\tSR:i:0\n' +
    'S\ta1\t*\tLN:i:600\tSN:Z:Sakai#1#chr\tSO:i:0\tSR:i:1\n' +
    'S\ta2\t*\tLN:i:600\tSN:Z:Sakai#1#chr\tSO:i:5000\tSR:i:1\n' +
    'L\ts1\t+\ta1\t+\t0M\n' +
    'L\ta1\t+\ts2\t+\t0M\n' +
    'L\ts1\t+\ta2\t+\t0M\n' +
    'L\ta2\t+\ts2\t+\t0M\n'
  const graph = convertGFAToGraph(parseGFA(gfa), 'bubble')

  expect(sampleRowLayout(graph)!.alleleDeletions).toEqual([
    { nodeIds: ['a1+'], bp: 400 },
    { nodeIds: ['a2+'], bp: 400 },
  ])
})

// And an allele that fills the span it replaces removes nothing.
test('an allele spanning its anchors is not a deletion', () => {
  const gfa =
    'H\tVN:Z:1.0\n' +
    'S\ts1\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:0\tSR:i:0\n' +
    'S\ts2\t*\tLN:i:500\tSN:Z:K12#1#chr\tSO:i:1500\tSR:i:0\n' +
    'S\ta1\t*\tLN:i:1000\tSN:Z:Sakai#1#chr\tSO:i:0\tSR:i:1\n' +
    'L\ts1\t+\ta1\t+\t0M\n' +
    'L\ta1\t+\ts2\t+\t0M\n'
  const graph = convertGFAToGraph(parseGFA(gfa), 'spanning')

  expect(sampleRowLayout(graph)!.alleleDeletions).toEqual([])
})

// A segment on no P or W line is legal GFA, and `anchorFromPaths` leaves it with
// no coordinate because it has nothing to derive one from. `placeOffReference`
// still reaches it, by walking out from a placed neighbour to close a run that
// leaves the window, so the layout has to have an answer for it. Asserting the
// coordinate threw a bare "cannot read properties of undefined" out of the
// layout, which the view then showed in place of a graph.
test('a segment no path visits does not take the layout down', () => {
  const graph = anchorGraph(
    convertGFAToGraph(
      parseGFA(
        [
          'H\tVN:Z:1.0',
          'S\ts1\tACGTACGTAC',
          'S\ts2\tACGTACGTAC',
          'S\ts3\tACGTACGTAC',
          'S\ts9\tTTTT',
          'L\ts1\t+\ts2\t+\t0M',
          'L\ts1\t+\ts3\t+\t0M',
          'L\ts3\t+\ts2\t+\t0M',
          'L\ts3\t+\ts9\t+\t0M',
          'P\tK12#1#chr\ts1+,s2+\t*',
          'P\tSakai#1#chr\ts1+,s3+,s2+\t*',
        ].join('\n'),
      ),
    ),
    'K12',
  )
  expect(graph.nodes.find(n => n.id === 's9+')!.stable).toBeUndefined()

  const layout = sampleRowLayout(graph, { start: 0, end: 30 })!
  expect(layout.nodePositions['s9+']).toBeDefined()
  // on no sample's row, so the spare row below the named ones, which is what
  // the anchored layout does with a rank it does not have a row for
  const rows = layout.rowLabels.length
  expect(layout.nodePositions['s9+']![0]!.y).toBe(rows * ROW_HEIGHT_PX)
})
