import { graphTablesGFA } from '@jbrowse/bandage-core/gfa/graphTables'
import { walkRowsOf } from '@jbrowse/bandage-core/layout/walkRowRuns'
import { walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'
import PluginManager from '@jbrowse/core/PluginManager'
import { readConfObject } from '@jbrowse/core/configuration'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './WalkTabixSyntenyAdapter.ts'
import configSchema from './configSchema.ts'
import WalkTabixSyntenyAdapterF from './index.ts'
import {
  anchorAligner,
  bubblesAsMismatches,
  referenceAligner,
  walkAligner,
} from './walkLanes.ts'
import { PairTargetError } from '../synteny/lanePairs.ts'

import type { PairChain } from '@gmod/gbz-base/pairAlignment'
import type { SyntenyMate } from '@jbrowse/synteny-core'

// Four walks over a 3.6 kb reference of six 600 bp nodes, in 1 kb chunks
// (RgfaTabixAdapter/walkFiles.test.ts builds on the same files):
//   W GRCh38  0 chr1 >1>2>3>4>5>6
//   W HG002   1 chr1 >1>2>7>4>5>6   7 (550 bp) replaces 3
//   W HG002   2 chr1 >1>2>3>4>8>6   8 (20 bp) replaces 5
//   W HG00097 1 chr1 >1>2>3>4>5>6
const fixture = (name: string) =>
  require
    .resolve(`../RgfaTabixAdapter/test_data/${name}.GRCh38.walks.bed.gz`)
    .replace(/\.walks\.bed\.gz$/, '')

function makeAdapter(
  slots: Record<string, unknown> = {},
  name = 'walks3_header',
) {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  const file = (kind: string) => `${fixture(name)}.${kind}.bed.gz`
  return new Adapter(
    configSchema.create({
      walksLocation: local(file('walks')),
      walksIndex: { location: local(`${file('walks')}.tbi`) },
      assemblyNames: ['hg38'],
      assemblyNameToPanSN: { hg38: 'GRCh38' },
      ...slots,
    }),
  )
}

const window = { refName: 'chr1', assemblyName: 'hg38', start: 0, end: 3600 }

const feats = (adapter: Adapter, opts: Record<string, unknown> = {}) =>
  firstValueFrom(adapter.getFeatures(window, opts as never).pipe(toArray()))

const mateOf = (f: { get: (k: string) => unknown }) =>
  f.get('mate') as SyntenyMate

const summary = (f: { get: (k: string) => unknown }) => ({
  lane: mateOf(f).assemblyName,
  refName: f.get('refName'),
  start: f.get('start'),
  end: f.get('end'),
  mate: `${mateOf(f).refName}:${mateOf(f).start}-${mateOf(f).end}`,
  cigar: f.get('CIGAR'),
})

test('the anchor window answers one record per haplotype, on the reference with the haplotype as its mate', async () => {
  const found = (await feats(makeAdapter())).map(summary)
  expect(found.sort((a, b) => a.lane.localeCompare(b.lane))).toEqual([
    {
      lane: 'HG00097#1',
      refName: 'chr1',
      start: 0,
      end: 3600,
      mate: 'chr1:0-3600',
      cigar: '3600=',
    },
    {
      lane: 'HG002#1',
      refName: 'chr1',
      start: 0,
      end: 3600,
      mate: 'chr1:0-3550',
      cigar: '1200=550I600D1800=',
    },
    {
      lane: 'HG002#2',
      refName: 'chr1',
      start: 0,
      end: 3600,
      mate: 'chr1:0-3020',
      cigar: '2400=20I600D600=',
    },
  ])
})

test('a fetch for some haplotypes answers those lanes in the order asked, named by the assembly mapped to them', async () => {
  const adapter = makeAdapter({
    assemblyNameToPanSN: { hg38: 'GRCh38', 'HG002.2': 'HG002#2' },
  })
  const found = await feats(adapter, { haplotypes: ['HG002.2', 'HG00097'] })
  expect(found.map(f => mateOf(f).assemblyName)).toEqual([
    'HG002.2',
    'HG00097#1',
  ])
})

test('a fetch for some haplotypes reads them against a reference walk named without a haplotype', async () => {
  const found = await feats(makeAdapter({}, 'walks3_twopart'), {
    haplotypes: ['HG002#1'],
  })
  expect(found.map(summary)).toEqual([
    {
      lane: 'HG002#1',
      refName: 'chr1',
      start: 0,
      end: 3600,
      mate: 'chr1:0-3550',
      cigar: '1200=550I600D1800=',
    },
  ])
})

test('a target assembly keeps only that lane', async () => {
  const found = await feats(makeAdapter(), { targetAssemblyName: 'HG002#1' })
  expect(found.map(f => mateOf(f).assemblyName)).toEqual(['HG002#1'])
})

test('a target assembly outside the lanes asked for answers nothing', async () => {
  const found = await feats(makeAdapter(), {
    haplotypes: ['HG00097'],
    targetAssemblyName: 'HG002#1',
  })
  expect(found).toEqual([])
})

test('a lane pair is read inside the anchor window, on the query lane with the target lane as its mate', async () => {
  const found = await feats(makeAdapter(), {
    queryAssemblyName: 'HG002#1',
    targetAssemblyName: 'HG002#2',
  })
  expect(found).toHaveLength(1)
  const [pair] = found
  expect(pair!.get('assemblyName')).toBe('HG002#1')
  expect(summary(pair!)).toEqual({
    lane: 'HG002#2',
    refName: 'chr1',
    start: 0,
    end: 3550,
    mate: 'chr1:0-3020',
    cigar: '1200=600I550D600=20I600D600=',
  })
  expect(pair!.get('numMatches')).toBe(2400)
})

test('a batch of lane pairs answers each pair what it answers alone', async () => {
  const adapter = makeAdapter()
  const pairs = [
    { queryAssemblyName: 'HG002#1', targetAssemblyName: 'HG002#2' },
    { queryAssemblyName: 'HG002#2', targetAssemblyName: 'HG00097#1' },
  ]
  const batch = await feats(adapter, { lanePairs: pairs })
  const alone = (
    await Promise.all(pairs.map(pair => feats(adapter, pair)))
  ).flat()
  expect(batch.map(summary)).toEqual(alone.map(summary))
  expect(batch).toHaveLength(2)
})

// walks3_lanepairs, a 5.5 kb reference of 2 kb flanks around three 500 bp
// nodes, in 1 kb chunks:
//   W GRCh38  0 chr1 >1>2>3>4>5
//   W HG002   1 chr1 >1>2>3>4>5
//   W HG002   2 chr1 >1<4<3<2>5           the middle three inverted
//   W HG00097 1 chr1 >1>2>6>2>6>2>3>4>5   2 three times, 6 a 30 bp spacer
test('a lane pair matches through a copy-number array, and draws an inversion between the lanes as a reverse-strand record', async () => {
  const found = await firstValueFrom(
    makeAdapter({}, 'walks3_lanepairs')
      .getFeatures(
        { ...window, end: 5500 },
        {
          lanePairs: [
            { queryAssemblyName: 'HG002#1', targetAssemblyName: 'HG002#2' },
            { queryAssemblyName: 'HG002#1', targetAssemblyName: 'HG00097#1' },
          ],
        },
      )
      .pipe(toArray()),
  )
  expect(
    found.map(f => ({
      ...summary(f),
      strand: f.get('strand'),
      matches: f.get('numMatches'),
    })),
  ).toEqual([
    {
      lane: 'HG002#2',
      refName: 'chr1',
      start: 0,
      end: 5500,
      mate: 'chr1:0-5500',
      cigar: '2000=1500I1500D2000=',
      strand: 1,
      matches: 4000,
    },
    {
      lane: 'HG002#2',
      refName: 'chr1',
      start: 2000,
      end: 3500,
      mate: 'chr1:2000-3500',
      cigar: '1500=',
      strand: -1,
      matches: 1500,
    },
    {
      lane: 'HG00097#1',
      refName: 'chr1',
      start: 0,
      end: 5500,
      mate: 'chr1:0-6560',
      cigar: '2500=1060I3000=',
      strand: 1,
      matches: 5500,
    },
  ])
})

test('a lane pair without its target lane is refused', async () => {
  await expect(
    feats(makeAdapter(), { queryAssemblyName: 'HG002#1' }),
  ).rejects.toThrow(PairTargetError)
})

test('a window on a haplotype lane answers nothing', async () => {
  const found = await firstValueFrom(
    makeAdapter()
      .getFeatures({ ...window, assemblyName: 'HG002#1' })
      .pipe(toArray()),
  )
  expect(found).toEqual([])
})

test('clipToRegion cuts a record to the window on both axes', async () => {
  const found = await firstValueFrom(
    makeAdapter()
      .getFeaturesInMultipleRegions([{ ...window, start: 700, end: 1100 }], {
        clipToRegion: true,
        haplotypes: ['HG00097#1'],
      })
      .pipe(toArray()),
  )
  expect(found).toHaveLength(1)
  expect(found[0]!.get('start')).toBe(700)
  expect(found[0]!.get('end')).toBe(1100)
  expect(mateOf(found[0]!)).toMatchObject({ start: 700, end: 1100 })
})

test('the header declares every haplotype but the anchor as a lane', async () => {
  const header = await makeAdapter({
    assemblyNameToPanSN: { hg38: 'GRCh38', 'HG002.1': 'HG002#1' },
  }).getHeader()
  expect(header).toMatchObject({
    hasCoarseTier: false,
    anchorAssemblyName: 'hg38',
  })
  expect(header.lanes).toEqual([
    { name: 'HG00097#1', label: 'HG00097#1', group: 'HG00097' },
    { name: 'HG002.1', label: 'HG002#1', group: 'HG002' },
    { name: 'HG002#2', label: 'HG002#2', group: 'HG002' },
  ])
})

test("the anchor's contigs are its refNames, and a lane lists none", async () => {
  const adapter = makeAdapter()
  expect(await adapter.getRefNames({ assemblyName: 'hg38' })).toEqual(['chr1'])
  expect(await adapter.getRefNames({ assemblyName: 'HG002#1' })).toEqual([])
})

test('getSubgraph cuts the window with the reference walk first', async () => {
  const cut = await makeAdapter().getSubgraph(window, {
    haplotypes: ['HG002#1'],
  })
  const walks = graphTablesGFA(cut)
    .split('\n')
    .filter(line => line.startsWith('W\t'))
    .map(line => line.split('\t').slice(1, 4).join('#'))
  expect(walks).toEqual(['GRCh38#0#chr1', 'HG002#1#chr1'])
})

test('a window past the step budget fails as a zoom-in notice for lanes naming how far to zoom', async () => {
  await expect(
    feats(makeAdapter({ walkStepBudget: 20 })),
  ).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/^Zoom in about [\d.]+×.* to see lanes$/),
  })
})

test('walksUri names the walk file and its index', () => {
  const config = configSchema.create({
    walksUri: 'hprc.GRCh38',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'walksLocation')).toMatchObject({
    uri: 'hprc.GRCh38.walks.bed.gz',
  })
  expect(readConfObject(config, ['walksIndex', 'location'])).toMatchObject({
    uri: 'hprc.GRCh38.walks.bed.gz.tbi',
  })
})

test("the adapter type expands walksUri with the schema's preprocessor", () => {
  const pluginManager = new PluginManager()
  WalkTabixSyntenyAdapterF(pluginManager)
  pluginManager.createPluggableElements()
  const { normalizeSnapshot } = pluginManager.getAdapterType(
    'WalkTabixSyntenyAdapter',
  )
  expect(normalizeSnapshot?.({ walksUri: 'hprc.GRCh38' })).toMatchObject({
    walksLocation: { uri: 'hprc.GRCh38.walks.bed.gz' },
  })
})

test('the adapter type declares lanes, lane pairs and the graph cut', () => {
  const pluginManager = new PluginManager()
  WalkTabixSyntenyAdapterF(pluginManager)
  pluginManager.createPluggableElements()
  expect(
    pluginManager.getAdapterType('WalkTabixSyntenyAdapter').adapterCapabilities,
  ).toEqual([
    'getSubgraph',
    'headerLanes',
    'lanePairsOnAnchor',
    'lanePairBatches',
  ])
})

test('a short balanced bubble is mismatches, in either order, and any other stays a gap', () => {
  expect(
    bubblesAsMismatches([
      ['=', 10],
      ['I', 1],
      ['D', 1],
      ['=', 5],
      ['D', 3],
      ['I', 3],
      ['=', 5],
      ['I', 2],
      ['D', 7],
      ['=', 5],
      ['I', 51],
      ['D', 51],
    ]),
  ).toEqual([
    ['=', 10],
    ['X', 1],
    ['=', 5],
    ['X', 3],
    ['=', 5],
    ['I', 2],
    ['D', 7],
    ['=', 5],
    ['I', 51],
    ['D', 51],
  ])
})

// Reference >1>2>3, a haplotype that passes node 2 three times, and one that
// runs the other way
const repeatNodes = new Map(
  [1, 2, 3, 4].map(id => [
    id,
    {
      refName: 'ref',
      start: id * 1000,
      end: id * 1000 + (id === 4 ? 30 : 500),
      rank: 0,
      onWindow: true,
    },
  ]),
)
const fragment = (name: string, steps: [number, number][]) => ({
  name,
  fragStart: 0,
  hapStart: 0,
  hapEnd: 0,
  ids: Int32Array.from(steps, ([id]) => id),
  rev: Uint8Array.from(steps, ([, rev]) => rev),
  before: { kind: 'end' as const },
  after: { kind: 'end' as const },
})
const cigar = (edits: [string, number][]) =>
  edits.map(([op, len]) => `${len}${op}`).join('')
const reference = fragment('ref', [
  [1, 0],
  [2, 0],
  [3, 0],
])

test('a haplotype with further copies of a collapsed node aligns one pass, the others an insertion', () => {
  const align = referenceAligner(repeatNodes)
  const [chain, ...rest] = align(
    fragment('hap', [
      [1, 0],
      [2, 0],
      [4, 0],
      [2, 0],
      [4, 0],
      [2, 0],
      [3, 0],
    ]),
    reference,
  )
  expect(rest).toEqual([])
  expect(chain).toMatchObject({
    queryStart: 0,
    queryEnd: 2560,
    targetStart: 0,
    targetEnd: 1500,
    strand: '+',
    sharedBases: 1500,
  })
  expect(
    chain!.edits.reduce((sum, [op, n]) => sum + (op === 'I' ? n : 0), 0),
  ).toBe(1060)
})

test('a haplotype running against the reference is a reverse-strand record', () => {
  const align = referenceAligner(repeatNodes)
  const [chain] = align(
    fragment('hap', [
      [3, 1],
      [4, 0],
      [2, 1],
      [1, 1],
    ]),
    reference,
  )
  expect(chain).toMatchObject({
    queryStart: 0,
    queryEnd: 1530,
    targetStart: 0,
    targetEnd: 1500,
    strand: '-',
  })
  expect(cigar(chain!.edits)).toBe('1000=30I500=')
})

// Two lanes over 2 kb flanks and three 500 bp nodes, the second lane running
// the middle three backwards: >1>2>3>4>5 against >1<4<3<2>5
const inversionNodes = new Map(
  [1, 2, 3, 4, 5].map(id => [
    id,
    {
      refName: 'ref',
      start: id * 10_000,
      end: id * 10_000 + (id === 1 || id === 5 ? 2000 : 500),
      rank: 0,
      onWindow: true,
    },
  ]),
)
const upperLane = fragment('HG002#1#chr1', [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
])
const invertedLane = fragment('HG002#2#chr1', [
  [1, 0],
  [4, 1],
  [3, 1],
  [2, 1],
  [5, 0],
])
const drawn = (chains: PairChain[]) =>
  chains.map(
    ({ queryStart, queryEnd, targetStart, targetEnd, strand, edits }) => ({
      query: `${queryStart}-${queryEnd}`,
      target: `${targetStart}-${targetEnd}`,
      strand,
      cigar: cigar(edits),
    }),
  )

test('an inversion between two lanes is a reverse-strand record of its own when chained, and an insertion beside a deletion in the subsequence', () => {
  expect(drawn(walkAligner(inversionNodes)(invertedLane, upperLane))).toEqual([
    {
      query: '0-5500',
      target: '0-5500',
      strand: '+',
      cigar: '2000=1500I1500D2000=',
    },
    { query: '2000-3500', target: '2000-3500', strand: '-', cigar: '1500=' },
  ])
  expect(
    drawn(referenceAligner(inversionNodes)(invertedLane, upperLane)),
  ).toEqual([
    {
      query: '0-5500',
      target: '0-5500',
      strand: '+',
      cigar: '2000=1500I1500D2000=',
    },
  ])
})

// The same shape at a size the multi-way display names: 20 kb flanks around
// a 15 kb stretch the haplotype runs backwards
const largeInversionNodes = new Map(
  [1, 2, 3, 4, 5].map(id => [
    id,
    {
      refName: 'ref',
      start: id * 100_000,
      end: id * 100_000 + (id === 1 || id === 5 ? 20_000 : 5000),
      rank: 0,
      onWindow: true,
    },
  ]),
)

test('a walk turned against the reference for 10 kb or more gains a reverse-strand record of the turned stretch beside its own', () => {
  expect(
    drawn(anchorAligner(largeInversionNodes)(invertedLane, upperLane)),
  ).toEqual([
    {
      query: '0-55000',
      target: '0-55000',
      strand: '+',
      cigar: '20000=15000I15000D20000=',
    },
    {
      query: '20000-35000',
      target: '20000-35000',
      strand: '-',
      cigar: '15000=',
    },
  ])
})

// gfa-to-tabix --walks --refs GRCh38 --chunk 10000 over 20 kb flanks and three
// 5 kb nodes:
//   W GRCh38  0 chr1 >1>2>3>4>5
//   W HG002   1 chr1 >1<4<3<2>5
//   W HG00097 1 chr1 >1>2>3>4>5
test('the anchor window answers a haplotype turned against the reference with a reverse-strand record of the turned stretch', async () => {
  const records = await firstValueFrom(
    makeAdapter({}, 'walks3_inversion')
      .getFeatures({ ...window, end: 55_000 }, {})
      .pipe(toArray()),
  )
  expect(
    records
      .filter(f => mateOf(f).assemblyName !== 'HG00097#1')
      .map(f => ({
        strand: f.get('strand'),
        start: f.get('start'),
        end: f.get('end'),
      })),
  ).toEqual([
    { strand: 1, start: 0, end: 55_000 },
    { strand: -1, start: 20_000, end: 35_000 },
  ])
})

test('a walk turned for under 10 kb, or reversed whole, keeps its one record', () => {
  expect(drawn(anchorAligner(inversionNodes)(invertedLane, upperLane))).toEqual(
    drawn(referenceAligner(inversionNodes)(invertedLane, upperLane)),
  )
  const reversed = fragment('HG002#3#chr1', [
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
  ])
  expect(
    drawn(anchorAligner(largeInversionNodes)(reversed, upperLane)),
  ).toEqual(drawn(referenceAligner(largeInversionNodes)(reversed, upperLane)))
})

test.each([
  ['the whole reference', window],
  ['a window inside it', { ...window, start: 1300, end: 2300 }],
])(
  "a walk-rows cut's whole walks are walkRows over the parsed cut, over %s",
  async (_, region) => {
    const cut = await makeAdapter({ walkStepBudget: 1 }).getSubgraph(region, {
      walkRows: true,
    })
    const runs = walkRowsOf(cut.walkRowRuns!)
    const bars = walkRows(loadGraph(cut, 'cut'), region)!
    expect(runs.reference).toEqual(bars.reference)
    expect(runs.rows.filter(r => r.complete)).toEqual(
      bars.rows.filter(r => r.complete),
    )
  },
)
