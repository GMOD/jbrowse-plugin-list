import { gzipSync } from 'zlib'

import { firstValueFrom, toArray } from 'rxjs'

import MultiWiggleZarrAdapter from './MultiWiggleZarrAdapter'
import configSchema from './configSchema'
import { parseSignalMatrixMetadata } from './signalMatrixMetadata'

// A three-sample, two-level store built in memory and served through the fetch
// mock, so the test exercises the real zarrita read path (v3 metadata, gzip
// codec, chunk grid) rather than a stub of it. Written the same way
// scripts/build_signal_zarr.ts writes one — if the two disagree, this fails.
const SAMPLES = ['s1', 's2', 's3']
const NUM_BINS = 6
const CHUNK_BINS = 4

// bin i of sample j = j * 10 + i, except s2's bin 3, which is unmeasured
const BASE_VALUES = Float32Array.from(
  { length: SAMPLES.length * NUM_BINS },
  (_, i) => {
    const sample = Math.floor(i / NUM_BINS)
    const bin = i % NUM_BINS
    return sample === 1 && bin === 3 ? Number.NaN : sample * 10 + bin
  },
)

// The coarse pyramid level: each bin is the mean of the two bin100 bins under
// it, skipping unmeasured ones, which is what build_signal_zarr.ts's downsample
// does. s2's third bin averages only bin 2, since bin 3 is NaN.
const COARSE_BINS = 3
const COARSE_VALUES = Float32Array.from([
  0.5, 2.5, 4.5, 10.5, 12, 14.5, 20.5, 22.5, 24.5,
])

function arrayMetadata(numBins: number, numSamples = SAMPLES.length) {
  return {
    zarr_format: 3,
    node_type: 'array',
    shape: [numSamples, numBins],
    data_type: 'float32',
    chunk_grid: {
      name: 'regular',
      configuration: { chunk_shape: [numSamples, CHUNK_BINS] },
    },
    chunk_key_encoding: { name: 'default', configuration: { separator: '/' } },
    fill_value: 'NaN',
    codecs: [
      { name: 'bytes', configuration: { endian: 'little' } },
      { name: 'gzip', configuration: { level: 6 } },
    ],
    attributes: {},
  }
}

function chunkFiles(path: string, values: Float32Array, numBins: number) {
  const files: Record<string, Uint8Array> = {}
  for (let c = 0; c * CHUNK_BINS < numBins; c++) {
    const buf = new Float32Array(SAMPLES.length * CHUNK_BINS).fill(Number.NaN)
    const from = c * CHUNK_BINS
    const width = Math.min(CHUNK_BINS, numBins - from)
    for (let s = 0; s < SAMPLES.length; s++) {
      buf.set(
        values.subarray(s * numBins + from, s * numBins + from + width),
        s * CHUNK_BINS,
      )
    }
    files[`/${path}/c/0/${c}`] = gzipSync(
      new Uint8Array(buf.buffer, 0, buf.byteLength),
    )
  }
  return files
}

const DEMO_SAMPLES: (string | { name: string; group?: string; color?: string })[] =
  SAMPLES.map(name => ({ name, group: 'demo' }))

function groupMetadata(
  levels: unknown[],
  version = 1,
  samples = DEMO_SAMPLES,
) {
  return JSON.stringify({
    zarr_format: 3,
    node_type: 'group',
    attributes: {
      jbrowse_signal_matrix: {
        version,
        samples,
        levels,
      },
    },
  })
}

const LEVELS = [
  {
    path: 'bin100',
    binSize: 100,
    refs: { ctgA: { start: 1000, binOffset: 0, numBins: NUM_BINS } },
  },
  {
    path: 'bin200',
    binSize: 200,
    refs: { ctgA: { start: 1000, binOffset: 0, numBins: COARSE_BINS } },
  },
]

const STORE: Record<string, Uint8Array | string> = {
  '/zarr.json': groupMetadata(LEVELS),
  '/bin100/zarr.json': JSON.stringify(arrayMetadata(NUM_BINS)),
  ...chunkFiles('bin100', BASE_VALUES, NUM_BINS),
  '/bin200/zarr.json': JSON.stringify(arrayMetadata(COARSE_BINS)),
  ...chunkFiles('bin200', COARSE_VALUES, COARSE_BINS),
}

// The min and max of the same two bin100 bins each COARSE_VALUES entry averages.
// s2's third coarse bin has only bin 2 measured, so its min, mean and max all
// collapse to 12 — the case where a summary correctly says "no spread here"
// rather than reporting a range over a bin that was never measured.
const COARSE_MINS = Float32Array.from([0, 2, 4, 10, 12, 14, 20, 22, 24])
const COARSE_MAXS = Float32Array.from([1, 3, 5, 11, 12, 15, 21, 23, 25])

const SUMMARY_LEVELS = [
  LEVELS[0],
  { ...LEVELS[1], minPath: 'bin200_min', maxPath: 'bin200_max' },
]

const SUMMARY_STORE: Record<string, Uint8Array | string> = {
  ...STORE,
  '/zarr.json': groupMetadata(SUMMARY_LEVELS, 2),
  '/bin200_min/zarr.json': JSON.stringify(arrayMetadata(COARSE_BINS)),
  ...chunkFiles('bin200_min', COARSE_MINS, COARSE_BINS),
  '/bin200_max/zarr.json': JSON.stringify(arrayMetadata(COARSE_BINS)),
  ...chunkFiles('bin200_max', COARSE_MAXS, COARSE_BINS),
}

// Same metadata, but the level array holds two rows for the three samples the
// metadata declares — the malformed store the shape check exists to catch.
const WRONG_SHAPE_STORE: Record<string, Uint8Array | string> = {
  '/zarr.json': groupMetadata([LEVELS[0]]),
  '/bin100/zarr.json': JSON.stringify(arrayMetadata(NUM_BINS, 2)),
}

// s2's middle coarse bin unmeasured, so s2 takes the copying path on a
// summary level, where s1 and s3 view the slab
const GAPPED_COARSE_VALUES = COARSE_VALUES.map((v, i) =>
  i === COARSE_BINS + 1 ? Number.NaN : v,
)

const GAPPED_SUMMARY_STORE: Record<string, Uint8Array | string> = {
  ...SUMMARY_STORE,
  ...chunkFiles('bin200', GAPPED_COARSE_VALUES, COARSE_BINS),
}

const MIXED_SAMPLES_STORE: Record<string, Uint8Array | string> = {
  ...STORE,
  '/zarr.json': groupMetadata(LEVELS, 1, [
    { name: 's1', group: 'demo', color: '#f00' },
    's2',
    { name: 's3', group: 'ctl' },
  ]),
}

const STORES: Record<string, Record<string, Uint8Array | string>> = {
  'test.zarr': STORE,
  'mixed.zarr': MIXED_SAMPLES_STORE,
  'wrongshape.zarr': WRONG_SHAPE_STORE,
  'summary.zarr': SUMMARY_STORE,
  'gappedsummary.zarr': GAPPED_SUMMARY_STORE,
}

function makeAdapter(store = 'test.zarr') {
  return new MultiWiggleZarrAdapter(
    configSchema.create({ uri: `http://localhost/${store}` }),
  )
}

// Serve STORES over a stubbed global fetch, so the adapter runs its real
// zarrita read path (v3 metadata, gzip codec, chunk grid) against bytes written
// exactly the way scripts/build_signal_zarr.ts writes them.
let fetchCalls = 0
let failLevelFetches = false
beforeEach(() => {
  fetchCalls = 0
  failLevelFetches = false
  vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
    fetchCalls++
    const url =
      typeof input === 'string' ? input : 'url' in input ? input.url : `${input}`
    const [, storeName, key] =
      /^\/([^/]+\.zarr)(\/.*)$/.exec(new URL(url).pathname) ?? []
    // a level's own zarr.json, not the root group's
    if (failLevelFetches && key !== '/zarr.json' && key?.endsWith('zarr.json')) {
      return Promise.resolve(new Response(null, { status: 500 }))
    }
    const body = storeName && key ? STORES[storeName]?.[key] : undefined
    return Promise.resolve(
      body === undefined
        ? new Response(null, { status: 404 })
        : new Response(typeof body === 'string' ? body : body.slice(), {
            status: 200,
          }),
    )
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('reads sample names and refNames from the store metadata', async () => {
  const adapter = makeAdapter()
  expect(await adapter.getRefNames()).toEqual(['ctgA'])
  expect((await adapter.getSources([])).map(s => s.name)).toEqual(SAMPLES)
  expect((await adapter.getSources([]))[0]!.group).toBe('demo')
})

test('lists the samples as rows with their color and group attributes', async () => {
  const adapter = makeAdapter('mixed.zarr')
  expect(await adapter.listRowSources()).toEqual({
    field: 'source',
    sources: [
      { name: 's1', color: '#f00', attributes: { group: 'demo' } },
      { name: 's2' },
      { name: 's3', attributes: { group: 'ctl' } },
    ],
  })
})

test('the row listing never repeats a name, label or color as an attribute', async () => {
  const { sources } = await makeAdapter().listRowSources()
  expect(sources.map(s => s.name)).toEqual(SAMPLES)
  expect(sources.map(s => s.attributes)).toEqual(
    SAMPLES.map(() => ({ group: 'demo' })),
  )
})

test('returns one array per sample, aligned to the requested region', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1200, end: 1500, assemblyName: 'a' }
  const result = await adapter.getMultiSourceFeatureArraysMulti([region], {
    bpPerPx: 1,
  })
  expect(result.map(r => r.source)).toEqual(SAMPLES)
  const s1 = result[0]!.raws[0]!
  expect([...s1.starts]).toEqual([1200, 1300, 1400])
  expect([...s1.ends]).toEqual([1300, 1400, 1500])
  expect([...s1.scores]).toEqual([2, 3, 4])
})

test('drops unmeasured bins rather than drawing them as zero', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1200, end: 1500, assemblyName: 'a' }
  const [, s2] = await adapter.getMultiSourceFeatureArraysMulti([region], {
    bpPerPx: 1,
  })
  // s2's bin 3 (1300-1400) is NaN in the store, so it is absent here
  expect([...s2!.raws[0]!.starts]).toEqual([1200, 1400])
  expect([...s2!.raws[0]!.scores]).toEqual([12, 14])
})

test('clamps a region that runs past the end of the stored window', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1500, end: 9000, assemblyName: 'a' }
  const [s1] = await adapter.getMultiSourceFeatureArraysMulti([region], {
    bpPerPx: 1,
  })
  expect([...s1!.raws[0]!.starts]).toEqual([1500])
  expect(s1!.raws[0]!.count).toBe(1)
})

test('returns empty arrays for a refName the store does not cover', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgB', start: 0, end: 1000, assemblyName: 'a' }
  const result = await adapter.getMultiSourceFeatureArraysMulti([region], {
    bpPerPx: 1,
  })
  expect(result).toHaveLength(SAMPLES.length)
  expect(result[0]!.raws[0]!.count).toBe(0)
})

test('honors the sources filter without refetching per sample', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }
  const result = await adapter.getMultiSourceFeatureArraysMulti([region], {
    bpPerPx: 1,
    sources: [{ name: 's3' }],
  })
  expect(result.map(r => r.source)).toEqual(['s3'])
  // group metadata + array metadata + the two chunks covering six bins. The
  // point of the format: three samples cost the same requests as three thousand
  expect(fetchCalls).toBeLessThanOrEqual(4)
})

test('getFeatures honors the sources filter too', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }
  const feats = await firstValueFrom(
    adapter
      .getFeatures(region, { bpPerPx: 1, sources: [{ name: 's3' }] })
      .pipe(toArray()),
  )
  expect([...new Set(feats.map(f => f.get('source')))]).toEqual(['s3'])
  // the clustering path (getScoreMatrix) fetches through here, and a subtree
  // filter narrowing 2500 samples to 3 should not build the other 2497 rows
  expect(feats).toHaveLength(NUM_BINS)
})

test('getFeatures carries refName in the uniqueId', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }
  const feats = await firstValueFrom(
    adapter.getFeatures(region, { bpPerPx: 1 }).pipe(toArray()),
  )
  // getFeaturesInMultipleRegions concatenates regions, so the same bin
  // coordinate on two contigs must not collide
  expect(feats[0]!.id()).toBe('s1-ctgA-1000')
  expect(new Set(feats.map(f => f.id())).size).toBe(feats.length)
})

test('rejects a level whose row count disagrees with the sample list', async () => {
  const adapter = new MultiWiggleZarrAdapter(
    configSchema.create({ uri: 'http://localhost/wrongshape.zarr' }),
  )
  const region = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }
  // a two-row array under a three-sample metadata: without the check, sample s3
  // reads off the end of the buffer and `Number.isNaN(undefined)` is false, so
  // it comes back as a full row of NaN-scored features instead of an error
  await expect(
    adapter.getMultiSourceFeatureArraysMulti([region], { bpPerPx: 1 }),
  ).rejects.toThrow(/shaped \[2, 6\], expected \[3, bins\]/)
})

test('a failed level open is not cached forever', async () => {
  const adapter = makeAdapter()
  const region = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }
  failLevelFetches = true
  await expect(
    adapter.getMultiSourceFeatureArraysMulti([region], { bpPerPx: 1 }),
  ).rejects.toThrow()
  // the level is re-picked on every navigation, so a transient failure must not
  // leave that zoom level dead for the life of the adapter
  failLevelFetches = false
  const result = await adapter.getMultiSourceFeatureArraysMulti([region], {
    bpPerPx: 1,
  })
  expect(result[0]!.raws[0]!.count).toBe(NUM_BINS)
})

const REGION = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }

test('zooming out reads the coarse pyramid level', async () => {
  const adapter = makeAdapter()
  const fine = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 1,
  })
  expect([...fine[0]!.raws[0]!.scores]).toEqual([0, 1, 2, 3, 4, 5])

  // one bin no wider than a pixel is the rule, so 200 bp/px reaches bin200
  const coarse = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 200,
  })
  expect([...coarse[0]!.raws[0]!.scores]).toEqual([0.5, 2.5, 4.5])
  expect([...coarse[0]!.raws[0]!.starts]).toEqual([1000, 1200, 1400])
})

test('resolutionMultiplier shifts which level is picked', async () => {
  const adapter = new MultiWiggleZarrAdapter(
    configSchema.create({
      uri: 'http://localhost/test.zarr',
      resolutionMultiplier: 200,
    }),
  )
  // bpPerPx 1 would take bin100 on its own; x200 asks for a level 200x coarser
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 1,
  })
  expect([...result[0]!.raws[0]!.scores]).toEqual([0.5, 2.5, 4.5])
})

test('a summary level returns the min and max beside the mean', async () => {
  const adapter = makeAdapter('summary.zarr')
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 200,
  })
  const s1 = result[0]!.raws[0]!
  expect([...s1.scores]).toEqual([0.5, 2.5, 4.5])
  expect([...s1.summary!.minScores]).toEqual([0, 2, 4])
  expect([...s1.summary!.maxScores]).toEqual([1, 3, 5])
})

// @jbrowse/plugin-wiggle reads a bin's extremes off `summary` alone, so a flat
// minScores/maxScores pair is dropped there without a word: no whiskers, and a
// y field of minScore or maxScore plots the mean.
test('the extremes travel as one summary, the shape the host reads', async () => {
  const adapter = makeAdapter('summary.zarr')
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 200,
  })
  const s1 = result[0]!.raws[0]!
  expect(Object.keys(s1).sort()).toEqual(
    ['count', 'ends', 'scores', 'starts', 'summary'].sort(),
  )
  expect(Object.keys(s1.summary!).sort()).toEqual(['maxScores', 'minScores'])
})

// The bin whose second input was unmeasured: a summary over one value is that
// value three times, not a range reaching down to the fill.
test('a partly unmeasured coarse bin summarizes only what it measured', async () => {
  const adapter = makeAdapter('summary.zarr')
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 200,
  })
  const s2 = result[1]!.raws[0]!
  expect([...s2.scores]).toEqual([10.5, 12, 14.5])
  expect([...s2.summary!.minScores]).toEqual([10, 12, 14])
  expect([...s2.summary!.maxScores]).toEqual([11, 12, 15])
})

test('a gapped sample on a summary level keeps the extremes of the bins it keeps', async () => {
  const adapter = makeAdapter('gappedsummary.zarr')
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 200,
  })
  const s2 = result[1]!.raws[0]!
  expect([...s2.starts]).toEqual([1000, 1400])
  expect([...s2.scores]).toEqual([10.5, 14.5])
  expect([...s2.summary!.minScores]).toEqual([10, 14])
  expect([...s2.summary!.maxScores]).toEqual([11, 15])
})

// Presence of the paths is the feature test, not the version number: the finest
// level of a v2 store has nothing under it to summarize and declares neither.
test('the finest level of a summary store reports no summary', async () => {
  const adapter = makeAdapter('summary.zarr')
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 1,
  })
  expect([...result[0]!.raws[0]!.scores]).toEqual([0, 1, 2, 3, 4, 5])
  expect(result[0]!.raws[0]!.summary).toBeUndefined()
})

test('a level declaring one of minPath/maxPath is rejected', () => {
  expect(() =>
    parseSignalMatrixMetadata({
      jbrowse_signal_matrix: {
        version: 2,
        samples: [{ name: 's1' }],
        levels: [{ ...LEVELS[1], minPath: 'bin200_min' }],
      },
    }),
  ).toThrow(/minPath without the other/)
})

// The allocation shape, pinned. The interface is one RawFeatureArrays per sample
// per region, so this is what decides whether a cohort renders: copying per
// sample put ~300,000 typed arrays behind a 24-contig view of 2504 samples and
// killed the tab. Assert identity, not just equality — equal-but-copied is
// exactly the regression this guards.
test('samples with no gaps share one bin grid and view the slab', async () => {
  const adapter = makeAdapter()
  const result = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 1,
  })
  const [s1, s2, s3] = result.map(r => r.raws[0]!)
  // s2 has an unmeasured bin, so it takes the filtered copy path
  expect(s1!.count).toBe(NUM_BINS)
  expect(s3!.count).toBe(NUM_BINS)
  expect(s2!.count).toBe(NUM_BINS - 1)

  expect(s1!.starts).toBe(s3!.starts)
  expect(s1!.ends).toBe(s3!.ends)
  expect(s2!.starts).not.toBe(s1!.starts)

  // scores are windows onto one fetched buffer, so the collector transfers it
  // once instead of once per sample
  expect(s1!.scores.buffer).toBe(s3!.scores.buffer)
  expect([...s1!.scores]).toEqual([0, 1, 2, 3, 4, 5])
  expect([...s3!.scores]).toEqual([20, 21, 22, 23, 24, 25])
})

test('a gapped sample still reports the right coordinates', async () => {
  const adapter = makeAdapter()
  const [, s2] = await adapter.getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 1,
  })
  expect([...s2!.raws[0]!.starts]).toEqual([1000, 1100, 1200, 1400, 1500])
  expect([...s2!.raws[0]!.scores]).toEqual([10, 11, 12, 14, 15])
})

// Two contigs laid end to end on one bin axis, which is how the converter
// writes every store: ctgA is bins 0-5, ctgB is bins 6-11, chunks are 4 wide,
// so bin 6 (ctgB's first) shares chunk 1 with ctgA's last two.
const MULTI_BINS = 6
const MULTI_TOTAL = MULTI_BINS * 2
const MULTI_VALUES = Float32Array.from(
  { length: SAMPLES.length * MULTI_TOTAL },
  (_, i) => Math.floor(i / MULTI_TOTAL) * 100 + (i % MULTI_TOTAL),
)
const MULTI_LEVELS = [
  {
    path: 'bin100',
    binSize: 100,
    refs: {
      ctgA: { start: 1000, binOffset: 0, numBins: MULTI_BINS },
      ctgB: { start: 0, binOffset: MULTI_BINS, numBins: MULTI_BINS },
    },
  },
]
const MULTI_STORE: Record<string, Uint8Array | string> = {
  '/zarr.json': groupMetadata(MULTI_LEVELS),
  '/bin100/zarr.json': JSON.stringify(arrayMetadata(MULTI_TOTAL)),
  ...(() => {
    const files: Record<string, Uint8Array> = {}
    for (let c = 0; c * CHUNK_BINS < MULTI_TOTAL; c++) {
      const buf = new Float32Array(SAMPLES.length * CHUNK_BINS).fill(Number.NaN)
      const from = c * CHUNK_BINS
      const width = Math.min(CHUNK_BINS, MULTI_TOTAL - from)
      for (let s = 0; s < SAMPLES.length; s++) {
        buf.set(
          MULTI_VALUES.subarray(
            s * MULTI_TOTAL + from,
            s * MULTI_TOTAL + from + width,
          ),
          s * CHUNK_BINS,
        )
      }
      files[`/bin100/c/0/${c}`] = gzipSync(
        new Uint8Array(buf.buffer, 0, buf.byteLength),
      )
    }
    return files
  })(),
}
STORES['multi.zarr'] = MULTI_STORE

const CTG_A = { refName: 'ctgA', start: 1000, end: 1600, assemblyName: 'a' }
const CTG_B = { refName: 'ctgB', start: 0, end: 600, assemblyName: 'a' }

test('adjacent regions are read as one span, not one read each', async () => {
  const adapter = makeAdapter('multi.zarr')
  // Warmed first: opening a level array is its own metadata read, and it is
  // cached for the adapter's life, so counting it here would measure setup
  // rather than the plan.
  await adapter.getMultiSourceFeatureArraysMulti([CTG_A], { bpPerPx: 1 })
  const before = fetchCalls
  const result = await adapter.getMultiSourceFeatureArraysMulti(
    [CTG_A, CTG_B],
    { bpPerPx: 1 },
  )
  // 12 bins over 4-wide chunks is 3 chunks. Read per region it would be 4:
  // ctgA needs chunks 0-1, ctgB needs 1-2, and chunk 1 is paid for twice.
  expect(fetchCalls - before).toBe(3)

  // and the values still land on the right region
  const s1 = result[0]!
  expect([...s1.raws[0]!.scores]).toEqual([0, 1, 2, 3, 4, 5])
  expect([...s1.raws[1]!.scores]).toEqual([6, 7, 8, 9, 10, 11])
  expect([...s1.raws[0]!.starts]).toEqual([1000, 1100, 1200, 1300, 1400, 1500])
  expect([...s1.raws[1]!.starts]).toEqual([0, 100, 200, 300, 400, 500])
  const s3 = result[2]!
  expect([...s3.raws[1]!.scores]).toEqual([206, 207, 208, 209, 210, 211])
})

// The merge rule never reads a chunk it would not have read anyway, so two
// windows with a real gap between them stay two reads rather than dragging the
// span between them along.
test('regions with a gap wider than a chunk stay separate reads', async () => {
  const adapter = makeAdapter('multi.zarr')
  await adapter.getMultiSourceFeatureArraysMulti([CTG_A], { bpPerPx: 1 })
  const before = fetchCalls
  await adapter.getMultiSourceFeatureArraysMulti(
    [
      { refName: 'ctgA', start: 1000, end: 1100, assemblyName: 'a' },
      { refName: 'ctgB', start: 500, end: 600, assemblyName: 'a' },
    ],
    { bpPerPx: 1 },
  )
  // bin 0 and bin 11: chunk 0 and chunk 2, and nothing in between
  expect(fetchCalls - before).toBe(2)
})

test('a region the level does not cover comes back empty, not wrong', async () => {
  const adapter = makeAdapter('multi.zarr')
  const result = await adapter.getMultiSourceFeatureArraysMulti(
    [{ refName: 'ctgZ', start: 0, end: 600, assemblyName: 'a' }, CTG_A],
    { bpPerPx: 1 },
  )
  expect(result[0]!.raws[0]!.count).toBe(0)
  expect([...result[0]!.raws[1]!.scores]).toEqual([0, 1, 2, 3, 4, 5])
})

// The host sends no summary mode: one fetch serves the mean, the extremes and
// the band around them, so switching the y field or the extent re-encodes
// without a refetch.
test('a summary level reads the extremes under the options the host sends', async () => {
  const result = await makeAdapter(
    'summary.zarr',
  ).getMultiSourceFeatureArraysMulti([REGION], {
    bpPerPx: 200,
    resolution: 1,
    sources: [{ name: 's1' }],
  })
  expect([...result[0]!.raws[0]!.summary!.minScores]).toEqual([0, 2, 4])
  expect([...result[0]!.raws[0]!.summary!.maxScores]).toEqual([1, 3, 5])
})
