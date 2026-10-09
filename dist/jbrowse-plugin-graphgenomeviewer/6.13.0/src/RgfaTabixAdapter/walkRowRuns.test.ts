import { walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'

import { walkRowRuns, walkRowsOf } from './walkRowRuns.ts'

import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// GRCh38 runs 0..4 over chr1:0-5000, a kb a node, with node 5 (300 bp) an
// expansion off it. The repeat is node 2, chr1:2000-3000. A has the
// reference's left flank from 0 and ends inside the repeat, B the same from
// 1000, and C runs against the reference from its right flank and ends
// inside too.
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
    names: ['GRCh38#0#chr1', 'A#1#a', 'B#1#b', 'C#1#c'],
    starts: Float64Array.of(0, 0, 0, 0),
    ends: Float64Array.of(5000, 3300, 2300, 2300),
    offsets: Int32Array.of(0, 5, 9, 12, 15),
    steps: Int32Array.of(0, 1, 2, 3, 4, 0, 1, 2, 5, 1, 2, 5, 4, 3, 5),
    reversed: Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1),
  },
}
const repeat = { start: 2000, end: 3000 }

test('a walk that ends inside the repeat measures from the flank it enters by', () => {
  const rows = walkRowsOf(walkRowRuns(tables, repeat)!).rows
  const byLabel = Object.fromEntries(rows.map(r => [r.label, r]))
  expect(byLabel['A#1']).toMatchObject({ bp: 1300, complete: false })
  expect(byLabel['B#1']).toMatchObject({ bp: 1300, complete: false })
  expect(byLabel['C#1']).toMatchObject({ bp: 300, complete: false })
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

test('walkRows measures the same walks from the start of the cut', () => {
  const rows = walkRows(loadGraph(tables, 'cut'), repeat)!.rows
  expect(rows.map(r => [r.label, r.bp])).toEqual([
    ['A#1', 3300],
    ['B#1', 2300],
    ['C#1', 2300],
  ])
})
