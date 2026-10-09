import { graphTablesGFA } from '@jbrowse/bandage-core/gfa/graphTables'
import PluginManager from '@jbrowse/core/PluginManager'
import { readConfObject } from '@jbrowse/core/configuration'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './WalkTabixSyntenyAdapter.ts'
import configSchema from './configSchema.ts'
import WalkTabixSyntenyAdapterF from './index.ts'
import { bubblesAsMismatches } from './walkLanes.ts'
import { PairTargetError } from '../synteny/lanePairs.ts'

import type { SyntenyMate } from '@jbrowse/synteny-core'

// Four walks over a 3.6 kb reference of six 600 bp nodes, in 1 kb chunks
// (RgfaTabixAdapter/walkFiles.test.ts builds on the same files):
//   W GRCh38  0 chr1 >1>2>3>4>5>6
//   W HG002   1 chr1 >1>2>7>4>5>6   7 (550 bp) replaces 3
//   W HG002   2 chr1 >1>2>3>4>8>6   8 (20 bp) replaces 5
//   W HG00097 1 chr1 >1>2>3>4>5>6
const prefix = require
  .resolve('../RgfaTabixAdapter/test_data/walks_header.walks.bed.gz')
  .replace(/\.walks\.bed\.gz$/, '')

function makeAdapter(slots: Record<string, unknown> = {}) {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  const file = (kind: string) => `${prefix}.${kind}.bed.gz`
  return new Adapter(
    configSchema.create({
      walksLocation: local(file('walks')),
      walksIndex: { location: local(`${file('walks')}.tbi`) },
      nodesLocation: local(file('nodes')),
      nodesIndex: { location: local(`${file('nodes')}.tbi`) },
      linksLocation: local(file('links')),
      linksIndex: { location: local(`${file('links')}.tbi`) },
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
    referenceSamples: ['GRCh38'],
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

test('a window past the step budget fails as a zoom-in notice for lanes', async () => {
  await expect(
    feats(makeAdapter({ walkStepBudget: 20 })),
  ).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/to see lanes$/),
  })
})

test('walksUri names the three files', () => {
  const config = configSchema.create({
    walksUri: 'hprc.GRCh38',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'nodesLocation')).toMatchObject({
    uri: 'hprc.GRCh38.nodes.bed.gz',
  })
  expect(readConfObject(config, ['walksIndex', 'location'])).toMatchObject({
    uri: 'hprc.GRCh38.walks.bed.gz.tbi',
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
