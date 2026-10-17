import { gfaTables } from '@jbrowse/bandage-core/gfa/gfaTables'
import { walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'

import { walkRowRuns, walkRowsOf } from './walkRowRuns.ts'

import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'
import type { WalkRow } from '@jbrowse/bandage-core/layout/walkRows'

// GRCh38 runs 0..4 over chr1:0-5000, a kb a node, with node 5 (300 bp) an
// expansion off it. The repeat is node 2, chr1:2000-3000. A has the
// reference's left flank from 0 and ends inside the repeat, B the same from
// 1000, and C runs against the reference from its right flank and ends
// inside too, each off the reference. D's contig ends on the repeat's node
// and E's on the left flank.
const tables: GraphTables = {
  nodes: {
    names: ['0', '1', '2', '3', '4', '5'],
    lengths: Int32Array.of(1000, 1000, 1000, 1000, 1000, 300),
    refs: Int32Array.of(0, 0, 0, 0, 0, 1),
    starts: Float64Array.of(0, 1000, 2000, 3000, 4000, 0),
    ranks: Int32Array.of(0, 0, 0, 0, 0, 1),
    refNames: ['chr1', 'alt'],
  },
  links: {
    from: new Int32Array(0),
    to: new Int32Array(0),
    strands: new Uint8Array(0),
  },
  walks: {
    names: ['GRCh38#0#chr1', 'A#1#a', 'B#1#b', 'C#1#c', 'D#1#d', 'E#1#e'],
    starts: Float64Array.of(0, 0, 0, 0, 0, 0),
    ends: Float64Array.of(5000, 3300, 2300, 2300, 3000, 2000),
    offsets: Int32Array.of(0, 5, 9, 12, 15, 18, 20),
    steps: Int32Array.of(
      ...[0, 1, 2, 3, 4],
      ...[0, 1, 2, 5],
      ...[1, 2, 5],
      ...[4, 3, 5],
      ...[0, 1, 2],
      ...[0, 1],
    ),
    reversed: Uint8Array.of(
      ...[0, 0, 0, 0, 0],
      ...[0, 0, 0, 0],
      ...[0, 0, 0],
      ...[1, 1, 1],
      ...[0, 0, 0],
      ...[0, 0],
    ),
  },
}
const repeat = { start: 2000, end: 3000 }

test('a walk that ends inside the repeat measures from the flank it enters by', () => {
  const rows = walkRowsOf(walkRowRuns(tables, repeat)!).rows
  const byLabel = Object.fromEntries(rows.map(r => [r.label, r]))
  expect(byLabel['A#1']).toMatchObject({ bp: 1300, complete: false })
  expect(byLabel['B#1']).toMatchObject({ bp: 1300, complete: false })
  expect(byLabel['C#1']).toMatchObject({ bp: 300, complete: false })
  for (const label of ['A#1', 'B#1', 'C#1']) {
    expect(byLabel[label]!.stop).toEqual({ contigEnds: false, shortBp: 0 })
  }
  expect(byLabel['D#1']).toMatchObject({
    bp: 1000,
    complete: false,
    stop: { contigEnds: true, shortBp: 0 },
  })
  expect(byLabel['E#1']).toMatchObject({
    bp: 0,
    complete: false,
    stop: { contigEnds: true, shortBp: 0 },
  })
  expect(byLabel['A#1']!.axis).toEqual({
    contig: 'a',
    start: 2000,
    reversed: false,
  })
  expect(byLabel['C#1']!.axis).toEqual({
    contig: 'c',
    start: 2300,
    reversed: true,
  })
})

test('walkRows measures and stops the same walks', () => {
  for (const region of [repeat, { start: 2500, end: 3000 }]) {
    const fields = ({ label, bp, complete, stop }: WalkRow) => ({
      label,
      bp,
      complete,
      stop,
    })
    const ours = walkRowsOf(walkRowRuns(tables, region)!).rows.map(fields)
    const theirs = walkRows(loadGraph(tables, 'cut'), region)!.rows.map(fields)
    expect(ours).toEqual(theirs)
  }
  const short = walkRowsOf(
    walkRowRuns(tables, { start: 2500, end: 3000 })!,
  ).rows.find(r => r.label === 'E#1')!
  expect(short.stop).toEqual({ contigEnds: true, shortBp: 500 })
})

test('walks named without a haplotype field are rows of their own, on their contigs', () => {
  const twoPart: GraphTables = {
    ...tables,
    walks: {
      ...tables.walks,
      names: ['GRCh38#0#chr1', 'A#a', 'A#b', 'C#1#c', 'D#1#d', 'E#1#e'],
    },
  }
  const rows = walkRowsOf(walkRowRuns(twoPart, repeat)!).rows
  expect(
    rows
      .filter(r => r.sample === 'A')
      .map(({ name, label, haplotype, axis }) => ({
        name,
        label,
        haplotype,
        contig: axis?.contig,
      }))
      .sort((x, y) => x.name.localeCompare(y.name)),
  ).toEqual([
    { name: 'A#a', label: 'A', haplotype: undefined, contig: 'a' },
    { name: 'A#b', label: 'A', haplotype: undefined, contig: 'b' },
  ])
})

test('a reference cut into pieces is one reference row, as walkRows reads it', () => {
  const split: GraphTables = {
    ...tables,
    walks: {
      names: ['GRCh38#0#chr1', 'GRCh38#0#chr1', 'A#1#a'],
      starts: Float64Array.of(0, 3000, 0),
      ends: Float64Array.of(2000, 5000, 5000),
      offsets: Int32Array.of(0, 2, 4, 9),
      steps: Int32Array.of(...[0, 1], ...[3, 4], ...[0, 1, 2, 3, 4]),
      reversed: new Uint8Array(9),
    },
  }
  const region = { start: 2200, end: 2800 }
  const fields = ({ label, bp, offReferenceBp, complete }: WalkRow) => ({
    label,
    bp,
    offReferenceBp,
    complete,
  })
  const ours = walkRowsOf(walkRowRuns(split, region)!)
  const graph = loadGraph(split, 'cut')
  const theirs = walkRows({ ...graph, referencePath: 'GRCh38#0#chr1' }, region)!
  expect(ours.rows.map(fields)).toEqual(theirs.rows.map(fields))
  expect(fields(ours.reference)).toEqual(fields(theirs.reference))
  expect(ours.rows.map(r => r.label)).toEqual(['A#1'])
  expect(ours.rows[0]).toMatchObject({ bp: 1000, complete: true })
})

test("a gap's parts cross from the worker with their causes, as walkRows splits them", () => {
  const S = [1, 2, 3, 4, 5, 6, 7].map(id => `S\t${id}\t*\tLN:i:1000`)
  const L = [1, 2, 3, 4, 5, 6].map(id => `L\t${id}\t+\t${id + 1}\t+\t0M`)
  const text = [
    'H\tVN:Z:1.1',
    ...S,
    ...L,
    'W\tGRCh38\t0\tchr1\t0\t7000\t>1>2>3>4>5>6>7\tws:Z:end\twe:Z:end',
    'W\tA\t1\ta\t0\t3000\t>1>2>3\tws:Z:end\twe:Z:break,bp=600,trimmed=400',
    'W\tA\t1\ta\t4000\t7000\t>5>6>7\tws:Z:break,bp=600\twe:Z:end',
    'W\tB\t1\tb\t0\t3000\t<7<6<5\tws:Z:end\twe:Z:elsewhere,chunk=GRCh38#0#chr1:20316160',
    'W\tB\t1\tb\t4000\t7000\t<3<2<1\tws:Z:break,bp=300\twe:Z:end',
  ].join('\n')
  const region = { start: 1000, end: 6000 }
  const gaps = (rows: WalkRow[]) =>
    rows.map(r => [
      r.label,
      r.runs
        .filter(run => run.gap)
        .map(({ bp, cause, chunk }) => ({ bp, cause, chunk })),
    ])
  const ours = walkRowsOf(walkRowRuns(gfaTables(text)!, region)!).rows
  const graph = loadGraph(text, 'cut', { referencePath: 'GRCh38#0#chr1' })
  expect(gaps(ours)).toEqual(gaps(walkRows(graph, region)!.rows))
  const chunk = { refName: 'GRCh38#0#chr1', start: 20316160 }
  expect(Object.fromEntries(gaps(ours))).toEqual({
    'A#1': [
      { bp: 400, cause: undefined, chunk: undefined },
      { bp: 600, cause: 'missing', chunk: undefined },
    ],
    'B#1': [
      { bp: 300, cause: 'missing', chunk: undefined },
      { bp: 700, cause: 'elsewhere', chunk },
    ],
  })
})
