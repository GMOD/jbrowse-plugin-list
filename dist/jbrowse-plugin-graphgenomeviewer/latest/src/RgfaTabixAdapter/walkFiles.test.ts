import { existsSync } from 'node:fs'

import { TabixIndexedFile } from '@gmod/tabix'
import { graphTablesGFA } from '@jbrowse/bandage-core/gfa/graphTables'
import { readConfObject } from '@jbrowse/core/configuration'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { walkRowsOf } from './walkRowRuns.ts'

import type { WalkCut } from './walkRowRuns.ts'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// chr22 of HPRC v2.1 at base level, one walk file per reference in walk
// format 2, built under ~/work/scratch/walks-20261008/f2. Skipped where the
// files are absent.
const chr22 = '/home/cdiesh/work/scratch/walks-20261008/f2/chr22'
const present = ['GRCh38', 'CHM13'].every(sample =>
  existsSync(`${chr22}.${sample}.walks.bed.gz`),
)

const fixture = (name: string) =>
  require
    .resolve(`./test_data/${name}.GRCh38.walks.bed.gz`)
    .replace(/\.walks\.bed\.gz$/, '')

// Four walks over a 3.6 kb reference in 1 kb chunks:
//   W GRCh38  0 chr1 >1>2>3>4>5>6
//   W HG002   1 chr1 >1>2>7>4>5>6   7 replaces 3
//   W HG002   2 chr1 >1>2>3>4>8>6   8 replaces 5
//   W HG00097 1 chr1 >1>2>3>4>5>6
const headerPrefix = fixture('walks2_header')

// walks2_header's walks with the reference named as pggb names a P-line,
// GRCh38#chr1
const twoPartPrefix = fixture('walks2_twopart')

// An unchopped graph, node 1 spanning 0-2600 and filed under chunk 0 alone:
//   W GRCh38 0 chr1 >1>2>4
//   W HG002  1 chr1 >1>3>4   3 replaces 2
const maxNodePrefix = fixture('walks2_maxnode')

// Twelve 500 bp reference nodes over chr1:0-6000 in one 10 kb chunk:
//   W GRCh38  0 chr1 >1>2>3>4>5>6>7>8>9>10>11>12
//   W HG002   1 chr1 >1>2>3>20>21>9>10>11>12   20 and 21, 2 kb each, replace 4-8
//   W HG002   2 chr1 >1>2>3>4>5>6>7>8>9>10>11>12
//   W HG003   1 chr1 >1>2>3>22                 the contig ends on 22, 300 bp
const rejoinPrefix = fixture('walks2_rejoin')

// The same graph in 1 kb chunks, whose rows name the chunks their path goes on
// in: HG002#1 leaves chunk 1000 for 20 and 21 and rejoins at 9, in chunk 4000
const followPrefix = fixture('walks2_follow')

function makeAdapter(prefix: string, slots = {}) {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      walksLocation: local(`${prefix}.walks.bed.gz`),
      walksIndex: { location: local(`${prefix}.walks.bed.gz.tbi`) },
      assemblyNameToPanSN: { hg38: 'GRCh38', hs1: 'CHM13' },
      ...slots,
    }),
  )
}

// a walk-indexed cut's tables as the GFA they stand for
const gfaOf = async (cut: Promise<string | GraphTables>) => {
  const tables = await cut
  return typeof tables === 'string' ? tables : graphTablesGFA(tables)
}

const walkNames = (gfa: string) =>
  gfa
    .split('\n')
    .filter(l => l.startsWith('W\t'))
    .map(l => l.split('\t').slice(1, 4).join('#'))

const window = {
  refName: 'chr22',
  assemblyName: 'hg38',
  start: 20_000_000,
  end: 20_100_000,
}

const chr1 = (start: number, end: number) => ({
  refName: 'chr1',
  assemblyName: 'hg38',
  start,
  end,
})

test.skipIf(!present)(
  'a walk-indexed cut carries a W line per haplotype',
  async () => {
    const gfa = await gfaOf(
      makeAdapter(`${chr22}.GRCh38`).getSubgraph(window, {
        haplotypes: ['HG002', 'HG00097#2', 'HG00733'],
      }),
    )
    expect(walkNames(gfa)).toContain('GRCh38#0#chr22')
    expect(
      gfa.split('\n').filter(l => l.startsWith('S\t')).length,
    ).toBeGreaterThan(1000)
  },
)

test.skipIf(!present)(
  'a cut for some haplotypes decodes those and the reference',
  async () => {
    const gfa = await gfaOf(
      makeAdapter(`${chr22}.GRCh38`).getSubgraph(window, {
        haplotypes: ['HG002', 'HG00097#2'],
      }),
    )
    const samples = new Set(
      walkNames(gfa).map(n => n.split('#').slice(0, 2).join('#')),
    )
    expect([...samples].sort()).toEqual([
      'GRCh38#0',
      'HG00097#2',
      'HG002#1',
      'HG002#2',
    ])
  },
)

test.skipIf(!present)('a CHM13 window cuts from its own file', async () => {
  const gfa = await gfaOf(
    makeAdapter(`${chr22}.CHM13`).getSubgraph(
      { ...window, assemblyName: 'hs1' },
      { haplotypes: ['HG002'] },
    ),
  )
  expect(walkNames(gfa)).toContain('CHM13#0#chr22')
  expect(walkNames(gfa)).toContain('HG002#1#chr22')
})

test.skipIf(!present)(
  "chr22's haplotypes come from its walk file's header",
  async () => {
    const names = (await makeAdapter(`${chr22}.GRCh38`).getHaplotypeNames())!
    expect(names).toHaveLength(463)
    expect(names[0]).toBe('CHM13#0')
    expect(names).toContain('HG002#2')
  },
)

test.skipIf(!present)(
  'the densest chunk is past the step budget for every haplotype',
  async () => {
    const cut = makeAdapter(`${chr22}.GRCh38`, {
      walkByteBudget: 100_000_000,
    }).getSubgraph({
      ...window,
      start: 11_800_000,
      end: 11_864_000,
    })
    await expect(cut).rejects.toMatchObject({
      name: 'NodeLimitError',
      regionTooLarge: true,
      message: expect.stringMatching(/choose fewer haplotypes/),
    })
  },
)

test('walksUri names the walk file and its index', () => {
  const config = configSchema.create({
    walksUri: 'hprc.GRCh38',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'walksLocation')).toMatchObject({
    uri: 'hprc.GRCh38.walks.bed.gz',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, ['walksIndex', 'location'])).toMatchObject({
    uri: 'hprc.GRCh38.walks.bed.gz.tbi',
  })
})

test("the haplotypes a walk file's header names", async () => {
  const adapter = makeAdapter(headerPrefix)
  expect(await adapter.getHaplotypeNames()).toEqual([
    'HG00097#1',
    'HG002#1',
    'HG002#2',
  ])
  const gfa = await gfaOf(
    adapter.getSubgraph(chr1(1000, 2600), { haplotypes: ['HG002#1'] }),
  )
  expect(walkNames(gfa)).toEqual(['GRCh38#0#chr1', 'HG002#1#chr1'])
  expect(gfa).toMatch(/^S\t7\t/m)
  expect(gfa).not.toMatch(/^S\t8\t/m)
})

test('a cut for some haplotypes keeps a reference walk named without a haplotype', async () => {
  const cut = (await makeAdapter(twoPartPrefix).getSubgraph(chr1(1000, 2600), {
    haplotypes: ['HG002#1'],
  })) as GraphTables
  expect(cut.walks.names).toEqual(['GRCh38#chr1', 'HG002#1#chr1'])
})

test('a format 1 walk file is refused, with what to rebuild it with', async () => {
  const cut = makeAdapter(fixture('walks1_header')).getSubgraph(chr1(0, 600))
  await expect(cut).rejects.toThrow(/rebuild it with gfa-to-tabix 1.0/)
})

test('a cut over walkByteBudget reads no row', async () => {
  const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
  const cut = makeAdapter(headerPrefix, { walkByteBudget: 100 }).getSubgraph(
    chr1(1000, 2600),
  )
  await expect(cut).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/walkByteBudget/),
  })
  expect(getLines).not.toHaveBeenCalled()
  getLines.mockRestore()
})

// tabix-js's getLines spins forever on a NaN end, so these mock it: a
// regression fails here instead of hanging the suite
test('a cut or a feature read over a range that is not finite queries nothing', async () => {
  const getLines = vi
    .spyOn(TabixIndexedFile.prototype, 'getLines')
    .mockResolvedValue()
  const bytes = vi
    .spyOn(TabixIndexedFile.prototype, 'bytesForRegions')
    .mockResolvedValue(0)
  const adapter = makeAdapter(headerPrefix)
  const region = chr1(Number.NaN, 2600)
  await expect(adapter.getSubgraph(region)).rejects.toThrow(
    "GRCh38#0#chr1:NaN-2600 is not a finite range to query the graph's index for",
  )
  await expect(
    firstValueFrom(adapter.getFeatures(region).pipe(toArray())),
  ).rejects.toThrow(/not a finite range/)
  await expect(adapter.getRegionByteSize([region])).rejects.toThrow(
    /not a finite range/,
  )
  expect(getLines).not.toHaveBeenCalled()
  expect(bytes).not.toHaveBeenCalled()
  getLines.mockRestore()
  bytes.mockRestore()
})

test("a node longer than a chunk is read back as far as the header's maxnode reaches", async () => {
  const adapter = makeAdapter(maxNodePrefix)
  const region = chr1(2100, 2500)
  const features = await firstValueFrom(
    adapter.getFeatures(region).pipe(toArray()),
  )
  expect(features.map(f => f.get('name'))).toContain('1')
  const gfa = await gfaOf(adapter.getSubgraph(region))
  expect(gfa).toMatch(/^S\t1\t/m)
  expect(gfa).toMatch(/^W\tGRCh38\t0\tchr1\t0\t3800\t>1>2>4$/m)
  expect(walkNames(gfa)).toEqual(['GRCh38#0#chr1', 'HG002#1#chr1'])
})

test("a walk-indexed graph's features are the reference nodes overlapping the window", async () => {
  const features = await firstValueFrom(
    makeAdapter(headerPrefix).getFeatures(chr1(1000, 2300)).pipe(toArray()),
  )
  expect(features.map(f => f.get('name'))).toEqual(['2', '3', '4'])
})

test('the byte gate measures a walk file from the chunk before the window', async () => {
  const bytes = vi.spyOn(TabixIndexedFile.prototype, 'bytesForRegions')
  const size = await makeAdapter(headerPrefix).getRegionByteSize([
    chr1(2100, 2600),
  ])
  expect(size).toBeGreaterThan(0)
  expect(bytes.mock.calls.map(call => call[0])).toEqual([
    [{ refName: 'GRCh38#0#chr1', start: 1000, end: 2600 }],
  ])
  bytes.mockRestore()
})

test('getFeatures reads from the chunk before the window', async () => {
  const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
  await firstValueFrom(
    makeAdapter(headerPrefix).getFeatures(chr1(2100, 2600)).pipe(toArray()),
  )
  expect(getLines.mock.calls.map(call => call[1])).toEqual([1000])
  getLines.mockRestore()
})

test('a walk leaving the window is measured to where it rejoins the reference', async () => {
  const cut = (await makeAdapter(rejoinPrefix).getSubgraph(chr1(1000, 1500), {
    walkRows: true,
  })) as WalkCut
  const rows = walkRowsOf(cut.walkRowRuns!).rows.map(
    ({ label, bp, complete, stop }) => ({ label, bp, complete, stop }),
  )
  expect(rows).toEqual([
    { label: 'HG002#1', bp: 4500, complete: true, stop: undefined },
    { label: 'HG002#2', bp: 500, complete: true, stop: undefined },
    {
      label: 'HG003#1',
      bp: 800,
      complete: false,
      stop: { contigEnds: false, shortBp: 0 },
    },
  ])
})

test('a walk the read cuts off is read on to the chunk its row names', async () => {
  const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
  const cut = (await makeAdapter(followPrefix).getSubgraph(chr1(1000, 1500), {
    walkRows: true,
  })) as WalkCut
  const reads = getLines.mock.calls.map(call => [call[1], call[2]])
  getLines.mockRestore()
  const rows = walkRowsOf(cut.walkRowRuns!).rows.map(
    ({ label, bp, complete }) => ({ label, bp, complete }),
  )
  expect(rows).toEqual([
    { label: 'HG002#1', bp: 4500, complete: true },
    { label: 'HG002#2', bp: 500, complete: true },
    { label: 'HG003#1', bp: 800, complete: false },
  ])
  // the window's chunks, then on to chunk 4000; HG003#1's contig ends
  expect(new Set(reads.map(String))).toEqual(new Set(['0,1500', '2000,4001']))
})

test('a cut on a signal already aborted reads no row', async () => {
  const adapter = makeAdapter(headerPrefix)
  await adapter.getHaplotypeNames()
  const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
  const aborted = new AbortController()
  aborted.abort(new Error('panned away'))
  await expect(
    adapter.getSubgraph(chr1(1000, 2600), { signal: aborted.signal }),
  ).rejects.toThrow()
  expect(getLines).not.toHaveBeenCalled()
  getLines.mockRestore()
})
