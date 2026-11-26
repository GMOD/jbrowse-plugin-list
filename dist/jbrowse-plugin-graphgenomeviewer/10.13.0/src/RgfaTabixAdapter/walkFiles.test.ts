import { existsSync } from 'node:fs'

import { CUT_PRESETS, WalkFile } from '@gmod/gfa-tabix'
import {
  graphFromTables,
  graphTablesGFA,
} from '@jbrowse/bandage-core/gfa/graphTables'
import { absentHaplotypesText } from '@jbrowse/bandage-core/graphKey'
import { walkRowsOf } from '@jbrowse/bandage-core/layout/walkRowRuns'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'
import { readConfObject } from '@jbrowse/core/configuration'
import { CachedFilehandle, openLocation } from '@jbrowse/core/util/io'
import { getSnapshot } from '@jbrowse/mobx-state-tree'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { foldedCut, foldedRuns } from '../GraphGenomeView/threadFoldCut.ts'
import { isUnzoomableNodeLimitError } from '../nodeLimitError.ts'

import type { WalkCut } from './walkCut.ts'
import type { FoldedCut } from '../GraphGenomeView/threadFoldCut.ts'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// chr22 of HPRC v2.1 at base level, one walk file per reference in walk
// format 8, built under ~/work/scratch/walks8. Skipped where the files are
// absent.
const chr22 = '/home/cdiesh/work/scratch/walks8/chr22'
const present = ['GRCh38', 'CHM13'].every(sample =>
  existsSync(`${chr22}.${sample}.walks.gz`),
)

// The walk files under test_data/walks8, which its build.sh writes from the
// GFAs beside them
const fixture = (name: string) =>
  require
    .resolve(`./test_data/walks8/${name}.GRCh38.walks.gz`)
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

// Reference nodes 1-20, 1 kb each, in 1 kb tiles:
//   W HG002 1 ctg >1>2>6>7...>20      skips 3, 4 and 5
//   W HG003 1 ctg >1>2>3>4>5>6...>20  the reference's own route
const skipFollowPrefix = fixture('skipfollow')

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

test('a walk-indexed track keeps the samples TSV its walk rows group by', () => {
  const samplesTsvLocation = {
    uri: 'https://example.com/samples.tsv',
    locationType: 'UriLocation',
  }
  const config = configSchema.create({
    walksUri: 'hprc.GRCh38',
    samplesTsvLocation,
  })
  expect(getSnapshot(config).samplesTsvLocation).toEqual(samplesTsvLocation)
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
  const cut = vi.spyOn(WalkFile.prototype, 'getCutForRange')
  await makeAdapter(headerPrefix).getSubgraph(chr1(1000, 2600), {
    expand: ['HG002#1#chr1'],
  })
  const expand = cut.mock.calls[0]?.[3]?.expand
  const asks = (name: string) =>
    typeof expand === 'function' ? expand(name) : expand?.includes(name)
  expect(asks('HG002#1#chr1')).toBe(true)
  expect(asks('HG002#2#chr1')).toBe(false)
  cut.mockRestore()
})

test("a cut takes graph-walks' browser preset, the cut rules every reader shares", async () => {
  const cut = vi.spyOn(WalkFile.prototype, 'getCutForRange')
  const tables = await makeAdapter(headerPrefix).getSubgraph(chr1(1000, 2600))
  expect(cut.mock.calls[0]?.[3]).toMatchObject(CUT_PRESETS.browser)
  expect(tables).toMatchObject({ abridged: [] })
  cut.mockRestore()
})

const linkLines = (gfa: string) =>
  gfa
    .split('\n')
    .filter(l => l.startsWith('L\t'))
    .map(l => l.split('\t').slice(1, 5).join(''))

test("a cut told nothing asks graph-walks for the links its walks take, 'walked'", async () => {
  const cut = vi.spyOn(WalkFile.prototype, 'getCutForRange')
  const gfa = await gfaOf(
    makeAdapter(skipFollowPrefix).getSubgraph(chr1(0, 8000), {
      haplotypes: ['HG003#1'],
    }),
  )
  expect(cut.mock.calls[0]?.[3]?.links).toBe('walked')
  expect(linkLines(gfa)).toContain('2+3+')
  expect(linkLines(gfa)).not.toContain('2+6+')
  cut.mockRestore()
})

test("links 'between' reaches graph-walks, and the cut lists the link another haplotype takes between its nodes", async () => {
  const cut = vi.spyOn(WalkFile.prototype, 'getCutForRange')
  const gfa = await gfaOf(
    makeAdapter(skipFollowPrefix).getSubgraph(chr1(0, 8000), {
      haplotypes: ['HG003#1'],
      links: 'between',
    }),
  )
  expect(cut.mock.calls[0]?.[3]?.links).toBe('between')
  expect(linkLines(gfa)).toContain('2+3+')
  expect(linkLines(gfa)).toContain('2+6+')
  expect(walkNames(gfa)).toEqual(['GRCh38#0#chr1', 'HG003#1#ctg'])
  cut.mockRestore()
})

test("a walk-rows cut asks for 'walked' whatever links it is handed", async () => {
  const cut = vi.spyOn(WalkFile.prototype, 'getCutForRange')
  const adapter = makeAdapter(skipFollowPrefix)
  await adapter.getSubgraph(chr1(0, 8000), { walkRows: true })
  await adapter.getSubgraph(chr1(0, 8000), {
    walkRows: true,
    links: 'between',
  })
  expect(cut.mock.calls.map(c => c[3]?.links)).toEqual(['walked', 'walked'])
  cut.mockRestore()
})

test('walk rows fetch every node of no walk unless asked', async () => {
  const cut = vi.spyOn(WalkFile.prototype, 'getCutForRange')
  const adapter = makeAdapter(headerPrefix)
  await adapter.getSubgraph(chr1(1000, 2600), { haplotypes: ['HG002#1'] })
  await adapter.getSubgraph(chr1(1000, 2600), {
    haplotypes: ['HG002#1'],
    walkRows: true,
  })
  await adapter.getSubgraph(chr1(1000, 2600), {
    haplotypes: [],
    walkRows: true,
  })
  await adapter.getSubgraph(chr1(1000, 2600), { walkRows: true })
  expect(cut.mock.calls.map(c => c[3]?.expand)).toEqual([
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

// An adapter that has read its walk file's header and directory, which every
// read of a window starts from, so a spy on reads sees only a window's units
async function warmed(adapter: Adapter) {
  await adapter.getHaplotypeNames()
  await adapter.getRegionByteSize([chr1(0, 100)])
  return adapter
}

test('a cut over walkByteBudget reads no unit', async () => {
  const adapter = await warmed(
    makeAdapter(headerPrefix, { walkByteBudget: 100 }),
  )
  const read = vi.spyOn(CachedFilehandle.prototype, 'read')
  const cut = adapter.getSubgraph(chr1(1000, 2600))
  await expect(cut).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/walkByteBudget/),
  })
  expect(read).not.toHaveBeenCalled()
  read.mockRestore()
})

test('a cut no zoom fits under walkByteBudget cuts under a budget forced to what it fetches', async () => {
  const adapter = makeAdapter(headerPrefix, { walkByteBudget: 100 })
  const refusal = await adapter
    .getSubgraph(chr1(1000, 2600))
    .catch((e: unknown) => e)
  expect(isUnzoomableNodeLimitError(refusal)).toBe(true)
  const forced = isUnzoomableNodeLimitError(refusal) ? refusal.bytes : 0
  const gfa = await gfaOf(
    adapter.getSubgraph(chr1(1000, 2600), { forcedByteBudget: forced }),
  )
  expect(walkNames(gfa)).toContain('GRCh38#0#chr1')
})

test('a cut or a feature read over a range that is not finite reads nothing', async () => {
  const adapter = await warmed(makeAdapter(headerPrefix))
  const read = vi.spyOn(CachedFilehandle.prototype, 'read')
  const bytesFor = vi.spyOn(WalkFile.prototype, 'getBytesForRange')
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
  const bytesFor = vi.spyOn(WalkFile.prototype, 'getBytesForRange')
  const size = await makeAdapter(headerPrefix).getRegionByteSize([
    chr1(2100, 2600),
  ])
  expect(size).toBeGreaterThan(0)
  expect(bytesFor.mock.calls.map(call => call.slice(0, 3))).toEqual([
    ['GRCh38#0#chr1', 2100, 2600],
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
      ({ label, bp, complete, stops }) => ({ label, bp, complete, stops }),
    )
    expect(rows).toEqual([
      { label: 'HG002#2', bp: 500, complete: true, stops: undefined },
      {
        label: 'HG002#1',
        bp: 500,
        complete: false,
        stops: {
          right: {
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
      },
      {
        label: 'HG003#1',
        bp: 500,
        complete: false,
        stops: { right: { contigEnds: false, shortBp: 0 } },
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
  const adapter = await warmed(makeAdapter(headerPrefix))
  const read = vi.spyOn(CachedFilehandle.prototype, 'read')
  const aborted = new AbortController()
  aborted.abort(new Error('panned away'))
  await expect(
    adapter.getSubgraph(chr1(1000, 2600), { signal: aborted.signal }),
  ).rejects.toThrow()
  expect(read).not.toHaveBeenCalled()
  read.mockRestore()
})

// What a fold to threads draws and says, by node name: its nodes, threads and
// events, less what only a fold of a cut can know, the off-reference nodes a
// folded node holds
function foldShown(fold: FoldedCut | { refusal: string }) {
  if ('refusal' in fold) {
    throw new Error(fold.refusal)
  }
  const { graph, threadEvents = [] } = fold
  const named = (ids: readonly string[]) =>
    ids.map(id => graph.nodes.find(node => node.id === id)?.name)
  return {
    nodes: graph.nodes.map(({ name, length, depth, stable }) => ({
      name,
      length,
      depth,
      start: stable?.start,
    })),
    edges: graph.edges.map(({ from, to, passes }) => ({
      ends: named([from, to]),
      passes,
    })),
    paths: graph.paths?.map(({ name, count, variation, nodeIds }) => ({
      name,
      count,
      variation,
      nodes: named(nodeIds),
    })),
    events: threadEvents.map(({ text, haplotypes }) => ({ text, haplotypes })),
  }
}

describe.each([
  ['one 10 kb tile', rejoinPrefix],
  ['1 kb tiles', followPrefix],
])("a window's runs, in %s", (_, prefix) => {
  const region = chr1(0, 6000)
  // the window's cut as the adapter makes it, but contained, as runs are read
  const cutFold = async (_adapter: Adapter, bp: number) => {
    const file = (localPath: string) =>
      openLocation({ localPath, locationType: 'LocalPathLocation' })
    const reader = new WalkFile({
      walksFilehandle: file(`${prefix}.walks.gz`),
      idxFilehandle: file(`${prefix}.walks.gz.idx`),
    })
    const { graph, kept, fragments, departures } = await reader.getCutForRange(
      'GRCh38#0#chr1',
      region.start,
      region.end,
      { ...CUT_PRESETS.browser, contained: true },
    )
    return foldedCut(
      loadGraph(graph.tables(kept, fragments, departures), 'chr1:1-6,000', {
        referencePath: 'GRCh38#0#chr1',
      }),
      bp,
    )
  }

  test.each([50, 500, 2000])(
    'fold at %d bp to the threads the contained cut folds to',
    async bp => {
      const adapter = makeAdapter(prefix)
      const read = await adapter.getSubgraphRuns(region)
      const fromRuns = foldedRuns(read!.runs, bp, 'chr1:1-6,000')
      expect(foldShown(fromRuns)).toEqual(foldShown(await cutFold(adapter, bp)))
    },
  )

  test("name the cut's walks for the pickers, which the fold has no unfolded graph to list", async () => {
    const adapter = makeAdapter(prefix)
    const read = await adapter.getSubgraphRuns(region)
    const fold = foldedRuns(read!.runs, 500, 'chr1:1-6,000')
    const cut = await cutFold(adapter, 500)
    expect('cutWalks' in fold ? fold.cutWalks : undefined).toEqual(
      cut.unfoldedGraph?.anchorPaths,
    )
    expect('unfoldedGraph' in fold ? fold.unfoldedGraph : 'refused').toBe(
      undefined,
    )
  })

  test("hold only reference nodes in a folded node's members", async () => {
    const adapter = makeAdapter(prefix)
    const read = await adapter.getSubgraphRuns(region)
    const fold = foldedRuns(read!.runs, 2000, 'chr1:1-6,000')
    const reference = new Set(
      (await cutFold(adapter, 2000)).unfoldedGraph?.nodes
        .filter(node => node.stable?.rank === 0)
        .map(node => node.name),
    )
    const members =
      'graph' in fold
        ? fold.graph.nodes.flatMap(node => node.members ?? [])
        : []
    expect(members.length).toBeGreaterThan(0)
    expect(members.filter(name => !reference.has(name))).toEqual([])
  })
})

// Every haplotype but HG003 skips 3, 4 and 5, 2-5 kb, so over 3-4 kb with the
// cut's 1 kb of context it has no step and departs across the whole of it
test('a fold of runs tells a haplotype that jumps over the window from one with no walk there', async () => {
  const adapter = makeAdapter(skipFollowPrefix)
  const read = await adapter.getSubgraphRuns(chr1(3000, 4000))
  expect(read!.runs.departing.names).toEqual([
    'HG002#1#ctg',
    'HG004#1#ctg',
    'HG005#1#ctg',
    'HG007#1#ctg',
  ])
  const fold = foldedRuns(read!.runs, 50, 'chr1:3,001-4,000')
  expect(
    'graph' in fold
      ? absentHaplotypesText(
          fold.graph,
          ['HG002#1', 'HG003#1', 'HG009#1'],
          'GRCh38 chr1',
        )
      : fold.refusal,
  ).toBe(
    'of 3 haplotypes, 1 has no step on GRCh38 chr1 here and 1 has no walk here',
  )
})

test('runs of a window over walkByteBudget read no unit and say so as a cut does', async () => {
  const adapter = await warmed(
    makeAdapter(headerPrefix, { walkByteBudget: 100 }),
  )
  const read = vi.spyOn(CachedFilehandle.prototype, 'read')
  const runs = adapter.getSubgraphRuns(chr1(1000, 2600))
  await expect(runs).rejects.toMatchObject({
    name: 'NodeLimitError',
    message: expect.stringMatching(/walkByteBudget/),
  })
  expect(read).not.toHaveBeenCalled()
  read.mockRestore()
})

test("runs of a window take the browser preset's context and budgets, read contained", async () => {
  const runs = vi.spyOn(WalkFile.prototype, 'getRunsForRange')
  await makeAdapter(headerPrefix).getSubgraphRuns(chr1(1000, 2600))
  const { context, departureByteBudget } = CUT_PRESETS.browser
  expect(runs.mock.calls[0]?.[3]).toMatchObject({
    context,
    contained: true,
    departureByteBudget,
  })
  runs.mockRestore()
})

// The hosted HPRC v2.1 walk file for GRCh38, a copy on ada of the bytes
// jbrowse.org serves. Skipped where it is absent.
const hosted =
  '/home/cdiesh/work/blocks/genome-5.0.0-hdr/hprc-v2.1-mc-grch38.GRCh38'
const hostedPresent = existsSync(`${hosted}.walks.gz`)

test.skipIf(!hostedPresent)(
  "HLA class II's every-haplotype view, past the step budget as a cut, folds from runs to a graph the track draws",
  async () => {
    const adapter = makeAdapter(hosted)
    const hla = { ...chr1(32_510_000, 32_600_000), refName: 'chr6' }
    await expect(adapter.getSubgraph(hla)).rejects.toMatchObject({
      name: 'NodeLimitError',
      regionTooLarge: true,
    })
    const read = await adapter.getSubgraphRuns(hla)
    const fold = foldedRuns(read!.runs, 640, 'chr6:32,510,001-32,600,000')
    const graph = 'graph' in fold ? fold.graph : undefined
    expect('refusal' in fold ? fold.refusal : undefined).toBeUndefined()
    expect(graph?.threadFold?.haplotypes).toBeGreaterThan(400)
    expect(graph?.nodes.length).toBeGreaterThan(10)
    expect(graph?.nodes.length).toBeLessThan(20_000)
    expect(
      ('threadEvents' in fold ? (fold.threadEvents ?? []) : []).filter(event =>
        event.text.includes('inside the window'),
      ),
    ).toEqual([])
  },
  120_000,
)

test.skipIf(!hostedPresent)(
  'a pericentromeric tile, its haplotypes in pieces, is not folded from runs, so the view cuts it and the cut is refused as before',
  async () => {
    const adapter = makeAdapter(hosted)
    const tile = { ...chr1(38_993_920, 39_059_456), refName: 'chr9' }
    const read = await adapter.getSubgraphRuns(tile)
    const fold = foldedRuns(read!.runs, 668, 'chr9:38,993,921-39,059,456')
    expect('refusal' in fold ? fold.refusal : undefined).toMatch(
      /^the 464 haplotypes here are in [\d,]+ pieces, more than 1.5 a haplotype/,
    )
    await expect(adapter.getSubgraph(tile)).rejects.toMatchObject({
      name: 'NodeLimitError',
      regionTooLarge: true,
    })
  },
  120_000,
)
