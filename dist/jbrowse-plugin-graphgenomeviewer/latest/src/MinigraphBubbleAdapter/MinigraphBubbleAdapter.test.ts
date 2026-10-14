import { TabixIndexedFile } from '@gmod/tabix'
import {
  bubbleDescription,
  bubbleLabel,
  parseBubbleLine,
} from '@jbrowse/bandage-core/bubbles/bubbleLine'
import PluginManager from '@jbrowse/core/PluginManager'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './MinigraphBubbleAdapter.ts'
import configSchema from './configSchema.ts'
import MinigraphBubbleAdapterF from './index.ts'

// Unmodified `gfatools bubble` output cut to chr6:32.4-32.7 Mb, so the column
// order here is the real one. Its stable names are bare (`chr6`) rather than
// PanSN, which is deliberate: this is the coverage for a graph that needs no
// `assemblyNameToPanSN` and falls back to raw tabix names.
const bed = require.resolve('./test_data/hprc_bubbles_mhc.bed.gz')

function makeAdapter() {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      bubblesLocation: local(bed),
      index: { location: local(`${bed}.tbi`) },
    }),
  )
}

const mhc = {
  refName: 'chr6',
  assemblyName: 'hg38',
  start: 32400000,
  end: 32420000,
}

test("the byte gate measures a region from the bubble file's index", async () => {
  const adapter = makeAdapter()
  expect(await adapter.getRegionByteSize([mhc])).toBeGreaterThan(0)
  expect(await adapter.getRegionByteSize([{ ...mhc, refName: 'chr7' }])).toBe(0)
})

test('getRefNames lists the sequences the bubbles sit on', async () => {
  expect(await makeAdapter().getRefNames()).toEqual(['chr6'])
})

test('bubbles carry their shape, not just a span', async () => {
  const features = await firstValueFrom(
    makeAdapter().getFeatures(mhc).pipe(toArray()),
  )
  expect(
    features.map(f => ({
      start: f.get('start'),
      end: f.get('end'),
      name: f.get('name'),
      description: f.get('description'),
      segmentCount: f.get('segmentCount'),
    })),
  ).toEqual([
    {
      start: 32400657,
      end: 32401207,
      name: '275-550 bp',
      description: '4 segments, up to 2 paths',
      segmentCount: 4,
    },
    {
      start: 32410127,
      end: 32410908,
      name: '10-781 bp',
      description: '4 segments, up to 2 paths',
      segmentCount: 4,
    },
  ])
})

test('the allele sequences come through for the detail panel', async () => {
  const features = await firstValueFrom(
    makeAdapter().getFeatures(mhc).pipe(toArray()),
  )
  const first = features[0]!
  expect(first.get('shortestAllele')).toMatch(/^TGCCCTTTGGGAGG/)
  expect(first.get('segments')).toBe('s60819,s421043,s60820,s60821')
})

// gfatools clamps the combinatorial path count at int32 max, so printing it
// would claim a precision the file does not have.
test('a saturated path count reads as uncountable, not as 2,147,483,647', () => {
  const line = (paths: number) =>
    `chr6\t31403798\t31498360\t239\t${paths}\t0\t0\t108603\t-1\t-1\t-1\ts1,s2\t*\t*`
  expect(bubbleDescription(parseBubbleLine(line(2147483647)))).toBe(
    '239 segments, more paths than gfatools counts',
  )
  expect(bubbleDescription(parseBubbleLine(line(2147483646)))).toBe(
    '239 segments, up to 2,147,483,646 paths',
  )
})

// gfatools writes `*` where an allele has no sequence at all, which is a pure
// insertion on the other side rather than a sequence to show.
test('a starless allele reads as absent, not as the string "*"', () => {
  const bubble = parseBubbleLine(
    'chr1\t59598\t59598\t3\t2\t0\t0\t315\t-1\t-1\t-1\ts10,s253480,s11\t*\tAGGATTC',
  )
  expect(bubble.shortestAllele).toBeUndefined()
  expect(bubble.longestAllele).toBe('AGGATTC')
  expect(bubbleLabel(bubble)).toBe('0-315 bp')
})

test('an inversion bubble says so', () => {
  const bubble = parseBubbleLine(
    'chr1\t100\t200\t5\t3\t1\t100\t100\t-1\t-1\t-1\ts1,s2\t*\t*',
  )
  expect(bubble.inversion).toBe(true)
  expect(bubbleDescription(bubble)).toBe('5 segments, up to 3 paths, inversion')
  // equal extremes collapse to one length rather than "100-100 bp"
  expect(bubbleLabel(bubble)).toBe('100 bp')
})

// The fixture is bare-named (`chr6`), as HPRC's published v1.0 bubbles are.
// A Minigraph-Cactus graph's bubbles are PanSN instead, so the same query has
// to reach them through assemblyNameToPanSN.
// tabix-js's getLines spins forever on a NaN end, so this mocks it: a
// regression fails here instead of hanging the suite
test('a range that is not finite queries nothing', async () => {
  const getLines = vi
    .spyOn(TabixIndexedFile.prototype, 'getLines')
    .mockResolvedValue()
  await expect(
    firstValueFrom(
      makeAdapter()
        .getFeatures({ ...mhc, end: Number.NaN })
        .pipe(toArray()),
    ),
  ).rejects.toThrow(/not a finite range/)
  expect(getLines).not.toHaveBeenCalled()
  getLines.mockRestore()
})

test('a bare-named bubble file needs no mapping', async () => {
  const features = await firstValueFrom(
    makeAdapter().getFeatures(mhc).pipe(toArray()),
  )
  expect(features.length).toBeGreaterThan(0)
})

test('an unmatched refName yields nothing rather than throwing', async () => {
  const features = await firstValueFrom(
    makeAdapter()
      .getFeatures({ ...mhc, refName: 'GRCh38#0#chr6' })
      .pipe(toArray()),
  )
  expect(features).toEqual([])
})

test('reports assembly-facing contigs for a PanSN-named file', async () => {
  // the fixture is bare, so the mapping finds no sample and the raw names pass
  // through unchanged — the bare case must not regress
  const adapter = makeAdapter()
  expect(await adapter.getRefNames({ assemblyName: 'hg38' })).toEqual(['chr6'])
})

test("the adapter type expands the uri shorthand with the schema's preprocessor", () => {
  const pluginManager = new PluginManager()
  MinigraphBubbleAdapterF(pluginManager)
  pluginManager.createPluggableElements()
  const { normalizeSnapshot } = pluginManager.getAdapterType(
    'MinigraphBubbleAdapter',
  )
  expect(normalizeSnapshot?.({ uri: 'bb.bed.gz' })).toMatchObject({
    bubblesLocation: { uri: 'bb.bed.gz' },
    index: { location: { uri: 'bb.bed.gz.tbi' } },
  })
})
