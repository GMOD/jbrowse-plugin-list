import { existsSync } from 'node:fs'

import { TabixIndexedFile } from '@gmod/tabix'
import { graphTablesGFA } from '@jbrowse/bandage-core/gfa/graphTables'
import { readConfObject } from '@jbrowse/core/configuration'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'

import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// chr22 of HPRC v2.1 at base level, walk-indexed under 64 kb chunks of both
// GRCh38 and CHM13, built 2026-10-08 under ~/work/scratch/walks-20261008/spike.
// Skipped where the files are absent.
const spikePrefix = '/home/cdiesh/work/scratch/walks-20261008/spike/chr22'
const present = existsSync(`${spikePrefix}.walks.bed.gz`)
// the same graph from the Rust builder: rows under their chunk's first base, a
// chunk:i: header line, and an LN:i: column after each node row
const rustPrefix = '/home/cdiesh/work/scratch/walks-20261008/rust/final/chr22'
const rustPresent = existsSync(`${rustPrefix}.walks.bed.gz`)

// the same graph from gfa-to-tabix 0.4.0 with --settle 0, whose walk file
// header also names the two references and 462 haplotypes
const headerPrefix = '/home/cdiesh/work/scratch/walks-20261008/settle/s0/chr22'
const headerPresent = existsSync(`${headerPrefix}.walks.bed.gz`)

// Four walks over a 3.6 kb reference in 1 kb chunks, built by gfa-to-tabix
// --walks --refs GRCh38 --chunk 1000 (0.4.0), whose walk file names its
// reference and haplotypes in the header:
//   W GRCh38  0 chr1 >1>2>3>4>5>6
//   W HG002   1 chr1 >1>2>7>4>5>6   7 replaces 3
//   W HG002   2 chr1 >1>2>3>4>8>6   8 replaces 5
//   W HG00097 1 chr1 >1>2>3>4>5>6
const fixturePrefix = require
  .resolve('./test_data/walks_header.walks.bed.gz')
  .replace(/\.walks\.bed\.gz$/, '')

// An unchopped graph, built by gfa-to-tabix --walks --refs GRCh38 --chunk 1000
// (0.4.0), with the first header line 0.5.0 writes put in by hand:
//   W GRCh38 0 chr1 >1>2>4   node 1 spans 0-2600, filed under chunk 0 alone
//   W HG002  1 chr1 >1>3>4   3 replaces 2
const maxNodePrefix = require
  .resolve('./test_data/walks_maxnode.walks.bed.gz')
  .replace(/\.walks\.bed\.gz$/, '')

function makeAdapter(prefix = spikePrefix, slots = {}) {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${prefix}.nodes.bed.gz`),
      segmentsIndex: { location: local(`${prefix}.nodes.bed.gz.tbi`) },
      linksLocation: local(`${prefix}.links.bed.gz`),
      linksIndex: { location: local(`${prefix}.links.bed.gz.tbi`) },
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

test.skipIf(!present)(
  'a walk-indexed cut carries a W line per haplotype',
  async () => {
    const gfa = await gfaOf(makeAdapter().getSubgraph(window))
    const lines = gfa.split('\n')
    expect(walkNames(gfa).length).toBeGreaterThan(400)
    expect(lines.filter(l => l.startsWith('S\t')).length).toBeGreaterThan(1000)
    expect(walkNames(gfa)).toContain('GRCh38#0#chr22')
  },
)

test.skipIf(!present)(
  'a cut for some haplotypes decodes those and the reference',
  async () => {
    const gfa = await gfaOf(
      makeAdapter().getSubgraph(window, {
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

test.skipIf(!present)('a CHM13 window cuts from the same files', async () => {
  const gfa = await gfaOf(
    makeAdapter().getSubgraph({
      ...window,
      assemblyName: 'hs1',
    }),
  )
  expect(walkNames(gfa)).toContain('CHM13#0#chr22')
  expect(walkNames(gfa).length).toBeGreaterThan(400)
})

test.skipIf(!present)(
  'the densest chunk is past the step budget for every haplotype',
  async () => {
    const cut = makeAdapter(spikePrefix, {
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

test.skipIf(!present || !rustPresent)(
  'first-base rows cut as whole-chunk rows do, sized by their header',
  async () => {
    const haplotypes = ['HG002', 'HG00097#2']
    const walks = (gfa: string) =>
      gfa.split('\n').filter(l => l.startsWith('W\t'))
    const spike = await gfaOf(makeAdapter().getSubgraph(window, { haplotypes }))
    const rust = await gfaOf(
      makeAdapter(rustPrefix, { walkChunk: 1000 }).getSubgraph(window, {
        haplotypes,
      }),
    )
    expect(walks(rust)).toEqual(walks(spike))
    expect(rust).not.toMatch(/LN:i:\d+\tSN:Z:[^\n]*LN:i:/)
  },
)

// Node 2495598 spans chr22:19,988,476-19,988,793 and is filed under the chunk
// before the one starting at 19,988,480
test.skipIf(!rustPresent)(
  'getFeatures reads the chunk before the window for a node crossing into it',
  async () => {
    const features = await firstValueFrom(
      makeAdapter(rustPrefix)
        .getFeatures({ ...window, start: 19_988_480, end: 19_988_600 })
        .pipe(toArray()),
    )
    expect(features.map(f => f.get('name'))).toContain('2495598')
  },
)

test('walksUri names the three files a walk-indexed build writes', () => {
  const config = configSchema.create({
    walksUri: 'hprc.chr22',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'walksLocation')).toMatchObject({
    uri: 'hprc.chr22.walks.bed.gz',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, ['walksIndex', 'location'])).toMatchObject({
    uri: 'hprc.chr22.walks.bed.gz.tbi',
  })
  expect(readConfObject(config, 'segmentsLocation')).toMatchObject({
    uri: 'hprc.chr22.nodes.bed.gz',
  })
  expect(readConfObject(config, ['linksIndex', 'location'])).toMatchObject({
    uri: 'hprc.chr22.links.bed.gz.tbi',
  })
})

test("the haplotypes a walk file's header names", async () => {
  const adapter = makeAdapter(fixturePrefix, {
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  })
  expect(await adapter.getHaplotypeNames()).toEqual([
    'HG00097#1',
    'HG002#1',
    'HG002#2',
  ])
  const gfa = await gfaOf(
    adapter.getSubgraph(
      { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 2600 },
      { haplotypes: ['HG002#1'] },
    ),
  )
  expect(walkNames(gfa)).toEqual(['GRCh38#0#chr1', 'HG002#1#chr1'])
  expect(gfa).toMatch(/^S\t7\t/m)
  expect(gfa).not.toMatch(/^S\t8\t/m)
})

test.skipIf(!headerPresent)(
  "chr22's haplotypes come from its walk file's header",
  async () => {
    const adapter = makeAdapter(headerPrefix)
    const names = (await adapter.getHaplotypeNames())!
    expect(names).toHaveLength(462)
    expect(names[0]).toBe('HG00097#1')
    expect(names).toContain('HG002#2')
    expect(names.some(name => /^(GRCh38|CHM13)#/.test(name))).toBe(false)
    const gfa = await gfaOf(
      adapter.getSubgraph(window, {
        haplotypes: names.slice(0, 8),
      }),
    )
    expect(new Set(walkNames(gfa).map(n => n.split('#')[0]))).toEqual(
      new Set(['GRCh38', 'HG00097', 'HG00099', 'HG00126', 'HG00128']),
    )
  },
)

test.skipIf(!rustPresent)(
  'a walk file without haplotype lines names none',
  async () => {
    expect(await makeAdapter(rustPrefix).getHaplotypeNames()).toBeUndefined()
  },
)

test('a cut over walkByteBudget reads no row', async () => {
  const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
  const cut = makeAdapter(fixturePrefix, {
    assemblyNameToPanSN: { hg38: 'GRCh38' },
    walkByteBudget: 100,
  }).getSubgraph({
    refName: 'chr1',
    assemblyName: 'hg38',
    start: 1000,
    end: 2600,
  })
  await expect(cut).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/walkByteBudget/),
  })
  expect(getLines).not.toHaveBeenCalled()
  getLines.mockRestore()
})

test.skipIf(!rustPresent)(
  'the densest chunk is past the byte budget before any row is read',
  async () => {
    const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
    const cut = makeAdapter(rustPrefix).getSubgraph(
      { ...window, start: 11_800_000, end: 11_864_000 },
      { haplotypes: ['HG002'] },
    )
    await expect(cut).rejects.toMatchObject({
      name: 'NodeLimitError',
      regionTooLarge: true,
      message: expect.stringMatching(
        /^Too much graph here to fetch \(1\d\.\d MB against walkByteBudget 8\.0 MB\)$/,
      ),
    })
    expect(getLines).not.toHaveBeenCalled()
    getLines.mockRestore()
  },
)

test.skipIf(!rustPresent)(
  'chr22:20.0-20.1 Mb fits the byte budget, and a smaller budget names a zoom',
  async () => {
    const haplotypes = ['HG002', 'HG00097#2']
    const gfa = await gfaOf(
      makeAdapter(rustPrefix).getSubgraph(window, {
        haplotypes,
      }),
    )
    expect(walkNames(gfa)).toContain('HG002#1#chr22')
    const cut = makeAdapter(rustPrefix, {
      walkByteBudget: 700_000,
    }).getSubgraph(window, { haplotypes })
    await expect(cut).rejects.toMatchObject({
      name: 'NodeLimitError',
      message: expect.stringMatching(
        /^Zoom in to about \d+Kbp to see the graph$/,
      ),
    })
  },
)

test.skipIf(!rustPresent)(
  'a cut for every haplotype past the step budget offers fewer haplotypes',
  async () => {
    const cut = makeAdapter(rustPrefix).getSubgraph({
      ...window,
      end: 20_260_000,
    })
    await expect(cut).rejects.toMatchObject({
      name: 'NodeLimitError',
      message: expect.stringMatching(
        /^Zoom in to about \d+Kbp, or choose fewer haplotypes, to see the graph$/,
      ),
    })
  },
)

// tabix-js's getLines spins forever on a NaN end, so these mock it: a
// regression fails here instead of hanging the suite
test('a cut or a feature read over a range that is not finite queries nothing', async () => {
  const getLines = vi
    .spyOn(TabixIndexedFile.prototype, 'getLines')
    .mockResolvedValue()
  const bytes = vi
    .spyOn(TabixIndexedFile.prototype, 'bytesForRegions')
    .mockResolvedValue(0)
  const adapter = makeAdapter(fixturePrefix, {
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  })
  const region = {
    refName: 'chr1',
    assemblyName: 'hg38',
    start: Number.NaN,
    end: 2600,
  }
  await expect(adapter.getSubgraph(region)).rejects.toThrow(
    "GRCh38#0#chr1:NaN-2600 is not a finite range to query the graph's index for",
  )
  await expect(
    firstValueFrom(adapter.getFeatures(region).pipe(toArray())),
  ).rejects.toThrow(/not a finite range/)
  expect(getLines).not.toHaveBeenCalled()
  expect(bytes).not.toHaveBeenCalled()
  getLines.mockRestore()
  bytes.mockRestore()
})

test("a node longer than a chunk is read back as far as the header's maxnode reaches", async () => {
  const adapter = makeAdapter(maxNodePrefix, {
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  })
  const region = {
    refName: 'chr1',
    assemblyName: 'hg38',
    start: 2100,
    end: 2500,
  }
  const features = await firstValueFrom(
    adapter.getFeatures(region).pipe(toArray()),
  )
  expect(features.map(f => f.get('name'))).toContain('1')
  const gfa = await gfaOf(adapter.getSubgraph(region))
  expect(gfa).toMatch(/^S\t1\t/m)
  expect(gfa).toMatch(/^W\tGRCh38\t0\tchr1\t0\t3200\t>1>2$/m)
  expect(walkNames(gfa)).toEqual(['GRCh38#0#chr1', 'HG002#1#chr1'])
})

test('a header without maxnode reads from the chunk before the window', async () => {
  const getLines = vi.spyOn(TabixIndexedFile.prototype, 'getLines')
  await makeAdapter(fixturePrefix, {
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  }).getSubgraph({
    refName: 'chr1',
    assemblyName: 'hg38',
    start: 2100,
    end: 2600,
  })
  expect(new Set(getLines.mock.calls.map(call => call[1]))).toEqual(
    new Set([1000]),
  )
  getLines.mockRestore()
})
