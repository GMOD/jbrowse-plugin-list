import { existsSync } from 'node:fs'

import {
  graphFromTables,
  graphTablesGFA,
} from '@jbrowse/bandage-core/gfa/graphTables'
import { walkRowsOf } from '@jbrowse/bandage-core/layout/walkRowRuns'
import { readConfObject } from '@jbrowse/core/configuration'
import { WalkFile, WalkReader } from '@jbrowse/graph-walks'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { EXPAND_NAMED_MAX } from './walkReader.ts'

import type { WalkCut } from './walkCut.ts'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// chr22 of HPRC v2.1 at base level, one walk file per reference in walk
// format 7, built under ~/work/scratch/walks7. Skipped where the files are
// absent.
const chr22 = '/home/cdiesh/work/scratch/walks7/chr22'
const present = ['GRCh38', 'CHM13'].every(sample =>
  existsSync(`${chr22}.${sample}.walks.gz`),
)

// The walk files under test_data/walks7, which its build.sh writes from the
// GFAs beside them
const fixture = (name: string) =>
  require
    .resolve(`./test_data/walks7/${name}.GRCh38.walks.gz`)
    .replace(/\.walks\.gz$/, '')

// Four walks over a 3.6 kb reference in 1 kb tiles:
//   W GRCh38  0 chr1 >1>2>3>4>5>6
//   W HG002   1 chr1 >1>2>7>4>5>6   7 replaces 3
//   W HG002   2 chr1 >1>2>3>4>8>6   8 replaces 5
//   W HG00097 1 chr1 >1>2>3>4>5>6
const headerPrefix = fixture('header')

// header's walks with the reference named as pggb names a P-line,
// GRCh38#chr1
const twoPartPrefix = fixture('twopart')

// An unchopped graph, node 1 spanning 0-2600, longer than its 1 kb tile:
//   W GRCh38 0 chr1 >1>2>4
//   W HG002  1 chr1 >1>3>4   3 replaces 2
const maxNodePrefix = fixture('maxnode')

// Twelve 500 bp reference nodes over chr1:0-6000 in one 10 kb tile:
//   W GRCh38  0 chr1 >1>2>3>4>5>6>7>8>9>10>11>12
//   W HG002   1 chr1 >1>2>3>20>21>9>10>11>12   20 and 21, 2 kb each, replace 4-8
//   W HG002   2 chr1 >1>2>3>4>5>6>7>8>9>10>11>12
//   W HG003   1 chr1 >1>2>3>22                 the contig ends on 22, 300 bp
const rejoinPrefix = fixture('rejoin')

// The same graph in 1 kb tiles: HG002#1 leaves tile 1000 at 1500 for 20 and
// 21 and rejoins at 4000, in tile 4000
const followPrefix = fixture('follow')

const local = (path: string) => ({
  localPath: path,
  locationType: 'LocalPathLocation',
})

function makeAdapter(prefix: string, slots = {}) {
  return new Adapter(
    configSchema.create({
      walksLocation: local(`${prefix}.walks.gz`),
      walksIndex: local(`${prefix}.walks.gz.idx`),
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
  'the densest tile is past the step budget for every haplotype',
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
  60_000,
)

test('walksUri names the walk file and its directory', () => {
  const config = configSchema.create({
    walksUri: 'hprc.GRCh38',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'walksLocation')).toMatchObject({
    uri: 'hprc.GRCh38.walks.gz',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'walksIndex')).toMatchObject({
    uri: 'hprc.GRCh38.walks.gz.idx',
    baseUri: 'https://example.com/',
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

test('an unset walksIndex reads the directory beside the walk file', async () => {
  const adapter = new Adapter(
    configSchema.create({
      walksLocation: local(`${headerPrefix}.walks.gz`),
      assemblyNameToPanSN: { hg38: 'GRCh38' },
    }),
  )
  expect(await adapter.getHaplotypeNames()).toEqual([
    'HG00097#1',
    'HG002#1',
    'HG002#2',
  ])
})

test('a cut asked to expand walks hands the reader their names', async () => {
  const cut = vi.spyOn(WalkReader.prototype, 'cut')
  await makeAdapter(headerPrefix).getSubgraph(chr1(1000, 2600), {
    expand: ['HG002#1#chr1'],
  })
  const expand = cut.mock.calls[0]?.[2]?.expand
  expect(expand?.('HG002#1#chr1')).toBe(true)
  expect(expand?.('HG002#2#chr1')).toBe(false)
  cut.mockRestore()
})

test('walk rows read the haplotypes they name in full', async () => {
  const cut = vi.spyOn(WalkReader.prototype, 'cut')
  await makeAdapter(headerPrefix).getSubgraph(chr1(1000, 2600), {
    haplotypes: ['HG002#1'],
    walkRows: true,
  })
  const expand = cut.mock.calls[0]?.[2]?.expand
  expect(expand?.('HG002#1#chr1')).toBe(true)
  expect(expand?.('HG002#2#chr1')).toBe(false)
  cut.mockRestore()
})

test('walk rows read the samples they show in full under every haplotype', async () => {
  const cut = vi.spyOn(WalkReader.prototype, 'cut')
  await makeAdapter(headerPrefix).getSubgraph(chr1(1000, 2600), {
    haplotypes: [],
    walkRows: true,
    expandSamples: ['HG002'],
  })
  const expand = cut.mock.calls[0]?.[2]?.expand
  expect(expand?.('HG002#1#chr1')).toBe(true)
  expect(expand?.('HG002#2#chr1')).toBe(true)
  expect(expand?.('HG00097#1#chr1')).toBe(false)
  cut.mockRestore()
})

test('a graph layout, every haplotype, or a long list keeps abridged walks', async () => {
  const cut = vi.spyOn(WalkReader.prototype, 'cut')
  const adapter = makeAdapter(headerPrefix)
  const many = Array.from({ length: EXPAND_NAMED_MAX + 1 }, (_, i) => `S${i}#1`)
  await adapter.getSubgraph(chr1(1000, 2600), { haplotypes: ['HG002#1'] })
  await adapter.getSubgraph(chr1(1000, 2600), {
    haplotypes: [],
    walkRows: true,
  })
  await adapter.getSubgraph(chr1(1000, 2600), { walkRows: true })
  await adapter.getSubgraph(chr1(1000, 2600), {
    haplotypes: [...many, 'HG002#1'],
    walkRows: true,
  })
  expect(cut.mock.calls.map(c => c[2]?.expand)).toEqual([
    undefined,
    undefined,
    undefined,
    undefined,
  ])
  cut.mockRestore()
})

test('a cut for some haplotypes keeps a reference walk named without a haplotype', async () => {
  const cut = (await makeAdapter(twoPartPrefix).getSubgraph(chr1(1000, 2600), {
    haplotypes: ['HG002#1'],
  })) as GraphTables
  expect(cut.walks.names).toEqual(['GRCh38#chr1', 'HG002#1#chr1'])
  // the full parse names the walks as the walk rows do
  expect(graphFromTables(cut).paths?.map(p => p.name)).toEqual([
    'GRCh38#chr1',
    'HG002#1#chr1',
  ])
})

test('a cut over walkByteBudget reads no unit', async () => {
  const read = vi.spyOn(WalkFile.prototype, 'read')
  const cut = makeAdapter(headerPrefix, { walkByteBudget: 100 }).getSubgraph(
    chr1(1000, 2600),
  )
  await expect(cut).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/walkByteBudget/),
  })
  expect(read).not.toHaveBeenCalled()
  read.mockRestore()
})

test('a cut or a feature read over a range that is not finite reads nothing', async () => {
  const read = vi.spyOn(WalkFile.prototype, 'read')
  const bytesFor = vi.spyOn(WalkReader.prototype, 'bytesFor')
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
  expect(read).not.toHaveBeenCalled()
  expect(bytesFor).not.toHaveBeenCalled()
  read.mockRestore()
  bytesFor.mockRestore()
})

test('a node longer than a tile is read from the tile its extent names', async () => {
  const adapter = makeAdapter(maxNodePrefix)
  const region = chr1(2100, 2500)
  const features = await firstValueFrom(
    adapter.getFeatures(region).pipe(toArray()),
  )
  expect(features.map(f => f.get('name'))).toEqual(['1'])
  const gfa = await gfaOf(adapter.getSubgraph(region))
  expect(gfa).toMatch(/^S\t1\t/m)
  expect(gfa).toMatch(/^W\tGRCh38\t0\tchr1\t0\t3800\t>1>2>4(\t|$)/m)
  expect(walkNames(gfa)).toEqual(['GRCh38#0#chr1', 'HG002#1#chr1'])
})

test("a walk-indexed graph's features are the reference nodes overlapping the window", async () => {
  const features = await firstValueFrom(
    makeAdapter(headerPrefix).getFeatures(chr1(1000, 2300)).pipe(toArray()),
  )
  expect(features.map(f => f.get('name'))).toEqual(['2', '3', '4'])
})

test('the byte gate measures the bytes a cut of the window reads', async () => {
  const bytesFor = vi.spyOn(WalkReader.prototype, 'bytesFor')
  const size = await makeAdapter(headerPrefix).getRegionByteSize([
    chr1(2100, 2600),
  ])
  expect(size).toBeGreaterThan(0)
  expect(bytesFor.mock.calls.map(call => call.slice(0, 2))).toEqual([
    ['GRCh38#0#chr1', { start: 2100, end: 2600 }],
  ])
  bytesFor.mockRestore()
})

// A fragment runs from its walk's first step on the drawn stretch to its
// last, so HG002#1's ends at 3 and its departure says where it goes on, and
// HG003#1's ends at 3 with 22 trimmed, which no departure follows
test.each([
  ['one 10 kb tile', rejoinPrefix],
  ['1 kb tiles', followPrefix],
])(
  'a walk leaving the window says where it rejoins the reference, in %s',
  async (_, prefix) => {
    const cut = (await makeAdapter(prefix).getSubgraph(chr1(1000, 1500), {
      walkRows: true,
    })) as WalkCut
    const rows = walkRowsOf(cut.walkRowRuns!).rows.map(
      ({ label, bp, complete, stop }) => ({ label, bp, complete, stop }),
    )
    expect(rows).toEqual([
      { label: 'HG002#2', bp: 500, complete: true, stop: undefined },
      {
        label: 'HG002#1',
        bp: 500,
        complete: false,
        stop: {
          contigEnds: false,
          shortBp: 0,
          goesOn: {
            near: 4000,
            departure: expect.objectContaining({
              leavePos: 1500,
              rejoinPos: 4000,
              ownBp: 4000,
            }),
          },
        },
      },
      {
        label: 'HG003#1',
        bp: 500,
        complete: false,
        stop: { contigEnds: false, shortBp: 0 },
      },
    ])
  },
)

// gfa-to-tabix --walks --tile 10 of ten 10 bp reference nodes:
//   W GRCh38 0 chr1 >1>2>3>4>5>6>7>8>9>10
//   W HG002  1 ctg  >1>2>9>10   a departure from 20 to 80 with nothing between
const skipPrefix = fixture('skip')

// HG002 steps on 2 and 9, the reference nodes either side of the window, so
// its row across the reference's 30 bp is its departure from 20 to 80
test('a haplotype that jumps over the window draws as a row of its departure', async () => {
  const cut = (await makeAdapter(skipPrefix).getSubgraph(chr1(31, 60), {
    walkRows: true,
  })) as WalkCut
  const { reference, rows } = walkRowsOf(cut.walkRowRuns!)
  expect(reference.bp).toBe(30)
  expect(
    rows.map(({ label, bp, gapBp, complete, stepless, runs }) => ({
      label,
      bp,
      gapBp,
      complete,
      stepless,
      runs: runs.map(({ start, bp, cause }) => ({ start, bp, cause })),
    })),
  ).toEqual([
    {
      label: 'HG002#1',
      bp: 0,
      gapBp: 30,
      complete: true,
      stepless: true,
      runs: [{ start: 0, bp: 30, cause: 'departure' }],
    },
  ])
})

test('a cut on a signal already aborted reads no unit', async () => {
  const adapter = makeAdapter(headerPrefix)
  await adapter.getHaplotypeNames()
  const read = vi.spyOn(WalkFile.prototype, 'read')
  const aborted = new AbortController()
  aborted.abort(new Error('panned away'))
  await expect(
    adapter.getSubgraph(chr1(1000, 2600), { signal: aborted.signal }),
  ).rejects.toThrow()
  expect(read).not.toHaveBeenCalled()
  read.mockRestore()
})
