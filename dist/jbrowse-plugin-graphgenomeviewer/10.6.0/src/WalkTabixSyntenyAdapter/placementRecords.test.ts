import {
  arrayStretches,
  laneRecords,
  placementRecords,
} from './placementRecords.ts'
import { arrayFeature } from './walkLanes.ts'

import type { PairChain } from '@gmod/gbz-base/pairAlignment'

// Reference >1>2>3>4, four 100 bp nodes from 0 to 400; node 9 is 40 bp of a
// haplotype's own and node 8 25 bp
const node = (start: number, end: number, rank: number) => ({
  refName: rank === 0 ? 'ref' : 'ctg',
  start,
  end,
  rank,
  passes: rank === 0 ? 1 : 0,
  onWindow: rank === 0,
})
const nodes = new Map([
  [1, node(0, 100, 0)],
  [2, node(100, 200, 0)],
  [3, node(200, 300, 0)],
  [4, node(300, 400, 0)],
  [8, node(0, 25, 1)],
  [9, node(0, 40, 1)],
])

// Each step as its node, whether it runs against the reference, and its place
// on the reference, undefined for an own step
const fragment = (steps: [number, number, number?][]) => ({
  name: 'HG002#1#ctg',
  fragStart: 0,
  hapStart: 0,
  hapEnd: 0,
  ids: Int32Array.from(steps, ([id]) => id),
  rev: Uint8Array.from(steps, ([, against]) => against),
  refStarts: Float64Array.from(steps, ([, , at]) => at ?? Number.NaN),
  against: Uint8Array.from(steps, ([, against]) => against),
  trimmedBefore: 0,
  trimmedAfter: 0,
})

const drawn = (chains: PairChain[]) =>
  chains.map(
    ({ queryStart, queryEnd, targetStart, targetEnd, strand, edits }) => ({
      query: `${queryStart}-${queryEnd}`,
      target: `${targetStart}-${targetEnd}`,
      strand,
      cigar: edits.map(([op, len]) => `${len}${op}`).join(''),
    }),
  )

// Every fixture read on its own is also read as a lane, which with no node
// the reference passes twice must give the same records and no array
const records = (steps: [number, number, number?][]) => {
  const placed = drawn(placementRecords(nodes)(fragment(steps)))
  const [lane] = laneRecords(nodes)([fragment(steps)])
  expect(drawn(lane!.chains)).toEqual(placed)
  expect(lane!.arrays).toEqual([])
  return placed
}

test('a haplotype following the reference is one forward record', () => {
  expect(
    records([
      [1, 0, 0],
      [2, 0, 100],
      [3, 0, 200],
      [4, 0, 300],
    ]),
  ).toEqual([{ query: '0-400', target: '0-400', strand: '+', cigar: '400=' }])
})

test('a haplotype running the reference backwards is one reverse record, read along the reference', () => {
  expect(
    records([
      [4, 1, 300],
      [3, 1, 200],
      [2, 1, 100],
      [1, 1, 0],
    ]),
  ).toEqual([{ query: '0-400', target: '0-400', strand: '-', cigar: '400=' }])
})

test('own steps between two steps on the reference are an insertion', () => {
  expect(
    records([
      [1, 0, 0],
      [9, 0],
      [8, 0],
      [2, 0, 100],
    ]),
  ).toEqual([
    { query: '0-265', target: '0-200', strand: '+', cigar: '100=65I100=' },
  ])
})

test('reference a run steps over is a deletion, in either direction', () => {
  expect(
    records([
      [1, 0, 0],
      [4, 0, 300],
    ]),
  ).toEqual([
    { query: '0-200', target: '0-400', strand: '+', cigar: '100=200D100=' },
  ])
  expect(
    records([
      [4, 1, 300],
      [9, 0],
      [2, 1, 100],
    ]),
  ).toEqual([
    {
      query: '0-240',
      target: '100-400',
      strand: '-',
      cigar: '100=40I100D100=',
    },
  ])
})

test('a second pass over reference the run has passed starts a record of its own', () => {
  expect(
    records([
      [1, 0, 0],
      [2, 0, 100],
      [3, 0, 200],
      [2, 0, 100],
      [3, 0, 200],
      [4, 0, 300],
    ]),
  ).toEqual([
    { query: '0-300', target: '0-300', strand: '+', cigar: '300=' },
    { query: '300-600', target: '100-400', strand: '+', cigar: '300=' },
  ])
})

test('a haplotype leaving the reference and rejoining it the same way is one record', () => {
  expect(
    records([
      [1, 0, 0],
      [9, 0],
      [3, 0, 200],
      [4, 0, 300],
    ]),
  ).toEqual([
    { query: '0-340', target: '0-400', strand: '+', cigar: '100=40I100D200=' },
  ])
})

test('a haplotype rejoining the reference turned is a record either side, its own steps between under neither', () => {
  expect(
    records([
      [1, 0, 0],
      [9, 0],
      [3, 1, 200],
      [2, 1, 100],
      [8, 0],
      [4, 0, 300],
    ]),
  ).toEqual([
    { query: '0-100', target: '0-100', strand: '+', cigar: '100=' },
    { query: '140-340', target: '100-300', strand: '-', cigar: '200=' },
    { query: '365-465', target: '300-400', strand: '+', cigar: '100=' },
  ])
})

test('own steps before the first step on the reference and after the last are under no record', () => {
  expect(
    records([
      [9, 0],
      [2, 0, 100],
      [3, 0, 200],
      [8, 0],
    ]),
  ).toEqual([
    { query: '40-240', target: '100-300', strand: '+', cigar: '200=' },
  ])
})

test('a step on a node the reference passes twice takes the pass the walk file gives it', () => {
  expect(
    records([
      [1, 0, 0],
      [2, 0, 300],
      [4, 0, 400],
    ]),
  ).toEqual([
    { query: '0-300', target: '0-500', strand: '+', cigar: '100=200D200=' },
  ])
})

test('a fragment with no step on the reference has no record', () => {
  expect(records([[9, 0]])).toEqual([])
})

// The same reference with nodes 2 and 3 each passed twice by it
const twice = new Map(
  Array.from(nodes, ([id, value]) => [
    id,
    id === 2 || id === 3 ? { ...value, passes: 2 } : value,
  ]),
)

const lane = (...fragments: [number, number, number?][][]) =>
  laneRecords(twice)(fragments.map(fragment)).map(({ chains, arrays }) => ({
    chains: drawn(chains),
    arrays: arrays.map(
      ({ queryStart, queryEnd, targetStart, targetEnd, strand, ...rest }) => ({
        query: `${queryStart}-${queryEnd}`,
        target: `${targetStart}-${targetEnd}`,
        strand,
        ...rest,
      }),
    ),
  }))

test('a step back beside a node the reference passes twice is one array record with exact ends, and the flanks stay matches', () => {
  expect(
    lane([
      [1, 0, 0],
      [2, 0, 100],
      [3, 0, 200],
      [2, 0, 100],
      [3, 0, 200],
      [4, 0, 300],
    ]),
  ).toEqual([
    {
      chains: [
        { query: '0-100', target: '0-100', strand: '+', cigar: '100=' },
        { query: '500-600', target: '300-400', strand: '+', cigar: '100=' },
      ],
      arrays: [
        {
          query: '100-500',
          target: '100-300',
          strand: '+',
          placedBp: 400,
          againstBp: 0,
          hapWalks: 2,
          refWalks: 2,
        },
      ],
    },
  ])
})

test('a turn beside a node the reference passes twice is an array on the strand most of its bases take, a tie forward', () => {
  const strandOf = (steps: [number, number, number?][]) =>
    lane(steps)[0]!.arrays.map(({ target, strand, againstBp, placedBp }) => ({
      target,
      strand,
      againstBp,
      placedBp,
    }))
  expect(
    strandOf([
      [1, 1, 0],
      [2, 1, 100],
      [3, 0, 200],
    ]),
  ).toEqual([{ target: '0-300', strand: '-', againstBp: 200, placedBp: 300 }])
  expect(
    strandOf([
      [2, 0, 100],
      [3, 1, 200],
    ]),
  ).toEqual([{ target: '100-300', strand: '+', againstBp: 100, placedBp: 200 }])
})

test("one fragment's stretch makes an array of another fragment's clean run in the same lane, and leaves other lanes alone", () => {
  const clean: [number, number, number?][] = [
    [1, 0, 0],
    [2, 0, 100],
    [3, 0, 200],
    [4, 0, 300],
  ]
  const [, other] = lane(
    [
      [1, 0, 0],
      [2, 0, 100],
      [3, 0, 200],
      [2, 0, 100],
    ],
    clean,
  )
  expect(other).toMatchObject({
    chains: [
      { query: '0-100', target: '0-100', cigar: '100=' },
      { query: '300-400', target: '300-400', cigar: '100=' },
    ],
    arrays: [{ query: '100-300', target: '100-300' }],
  })
  expect(lane(clean)).toEqual([
    {
      chains: [{ query: '0-400', target: '0-400', strand: '+', cigar: '400=' }],
      arrays: [],
    },
  ])
})

test('spans that touch stay two stretches, and overlapping ones merge', () => {
  expect(
    arrayStretches([
      { start: 200, end: 300 },
      { start: 100, end: 200 },
      { start: 350, end: 450 },
      { start: 400, end: 500 },
    ]),
  ).toEqual([
    { start: 100, end: 200 },
    { start: 200, end: 300 },
    { start: 350, end: 500 },
  ])
})

test('a run leaving a stretch and coming back to it is two arrays with matches between', () => {
  const [, back] = lane(
    [
      [2, 0, 100],
      [2, 0, 100],
    ],
    [
      [2, 0, 100],
      [4, 0, 300],
      [1, 0, 0],
      [2, 0, 100],
    ],
  )
  expect(back).toMatchObject({
    chains: [
      { query: '100-200', target: '300-400', cigar: '100=' },
      { query: '200-300', target: '0-100', cigar: '100=' },
    ],
    arrays: [
      { query: '0-100', target: '100-200' },
      { query: '300-400', target: '100-200' },
    ],
  })
})

test('an array record is a band with no CIGAR and no identity, on the reference with the haplotype as its mate', () => {
  const [read] = laneRecords(twice)([
    fragment([
      [2, 0, 100],
      [3, 1, 200],
      [2, 1, 100],
    ]),
  ])
  const feature = arrayFeature({
    record: read!.arrays[0]!,
    query: { ...fragment([]), hapStart: 1000 },
    assemblyName: 'hg38',
    refName: 'chr1',
    targetName: 'GRCh38#0#chr1',
    mateAssemblyName: 'HG002#1',
  })
  expect({
    type: feature.get('type'),
    cigar: feature.get('CIGAR'),
    identity: feature.get('identity'),
    start: feature.get('start'),
    end: feature.get('end'),
    strand: feature.get('strand'),
    mate: feature.get('mate'),
  }).toEqual({
    type: 'array',
    cigar: undefined,
    identity: undefined,
    start: 100,
    end: 300,
    strand: -1,
    mate: {
      refName: 'ctg',
      start: 1000,
      end: 1300,
      assemblyName: 'HG002#1',
    },
  })
})
