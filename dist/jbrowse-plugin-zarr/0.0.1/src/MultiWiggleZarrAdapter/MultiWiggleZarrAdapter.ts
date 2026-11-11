import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { parseSignalMatrixMetadata, pickLevel } from './signalMatrixMetadata'
import { openZarrGroup, zarritaP } from '../zarrStore'

import type {
  SignalMatrixLevel,
  SignalMatrixMetadata,
} from './signalMatrixMetadata'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature, Region } from '@jbrowse/core/util'
import type { Observable } from 'rxjs'
import type {
  Array as ZarrArray,
  DataType,
  FetchStore,
  Group as ZarrGroup,
} from 'zarrita'

// The shape @jbrowse/plugin-wiggle's multi-source RPC executor expects back.
// Declared here rather than imported: that interface is duck-typed on purpose
// (adr-021), so this plugin has no build-time dependency on the wiggle plugin.
export interface RawFeatureArrays {
  starts: Int32Array
  ends: Int32Array
  scores: Float32Array
  minScores: Float32Array | undefined
  maxScores: Float32Array | undefined
  count: number
}

interface WiggleOptions extends BaseOptions {
  bpPerPx?: number
  resolution?: number
  sources?: { name: string }[]
  // The summary presentation the display is configured for. The caller sends
  // its raw setting rather than what the current rendering resolves to, so
  // this can be `whiskers` on a density track that will draw averages: the
  // alternative made switching rendering type invalidate the fetch. Absent
  // from an older caller, which is why the test is for the one mode that draws
  // no summary rather than for the modes that do -- unknown means "read them".
  summaryScoreMode?: string
}

// One region's window onto a fetched block of the matrix. The block may be
// wider than this region and shared with its neighbours (see planFetch), so a
// row is addressed by `stride` and `offset` rather than assumed to start at
// `sampleIndex * numBins`: sample i's values are
// `values.subarray(i * stride + offset, i * stride + offset + numBins)`.
// `mins`/`maxs` are the same shape when the level carries a summary, and absent
// on the finest level, which has nothing below it to summarize.
interface RegionSlab {
  numBins: number
  binSize: number
  // genomic coordinate of the slab's first bin
  start: number
  // bins per sample row in the underlying block, and this region's column
  // offset within it
  stride: number
  offset: number
  values: Float32Array
  mins: Float32Array | undefined
  maxs: Float32Array | undefined
  // The region's bin grid, built once on first use and shared by every sample
  // whose row has no gaps. Cached on the slab rather than recomputed per sample
  // because it depends only on the region.
  gridStarts?: Int32Array
  gridEnds?: Int32Array
}

const EMPTY_SLAB: RegionSlab = {
  numBins: 0,
  binSize: 1,
  start: 0,
  stride: 0,
  offset: 0,
  values: new Float32Array(0),
  mins: undefined,
  maxs: undefined,
}

const EMPTY_RAW: RawFeatureArrays = {
  starts: new Int32Array(0),
  ends: new Int32Array(0),
  scores: new Float32Array(0),
  minScores: undefined,
  maxScores: undefined,
  count: 0,
}

// The subtree filter in the clustering sidebar narrows the source list the
// display sends down, so this is a real user-driven filter and not just the
// full list echoed back. `undefined` means "no filter", which is not the same
// as an empty one.
function wantedNames(sources: { name: string }[] | undefined) {
  return sources?.length ? new Set(sources.map(s => s.name)) : undefined
}

// A bin the converter never wrote (no k-mers, a gap, or outside the store's
// covered window) comes back as the array's NaN fill value. Dropping those keeps
// an unmeasured region visibly empty rather than drawing it as zero coverage.
function slabToRaw(slab: RegionSlab, sampleIndex: number): RawFeatureArrays {
  const { numBins, binSize, start, stride, offset, values, mins, maxs } = slab
  const lo = sampleIndex * stride + offset
  const hi = lo + numBins
  const row = values.subarray(lo, hi)
  const minRow = mins?.subarray(lo, hi)
  const maxRow = maxs?.subarray(lo, hi)
  let count = 0
  for (let i = 0; i < numBins; i++) {
    if (!Number.isNaN(row[i]!)) {
      count++
    }
  }

  // The whole row is measured, which is the ordinary case for a binned store
  // and universal at the coarse levels (a 1Mb bin is empty only where the
  // reference is). Then the bin grid is the region's own, identical for every
  // sample, and the values are already a contiguous run of the slab: hand back
  // one shared grid and three views instead of five fresh arrays per sample.
  //
  // This is what decides whether a cohort renders at all. The interface is one
  // RawFeatureArrays per sample PER REGION, so a 24-contig view of 2504 samples
  // asks for 60,096 of them; copying meant ~300,000 typed arrays for a frame
  // holding 31 MB of actual values, and the tab died before it drew. Sharing is
  // safe because the consumer copies into its own buffers
  // (processFeaturesFromArrays) and the transferable collector dedupes the
  // buffers, so 2504 views of one slab transfer once rather than 2504 times.
  if (count === numBins) {
    let { gridStarts, gridEnds } = slab
    if (!gridStarts || !gridEnds) {
      gridStarts = new Int32Array(numBins)
      gridEnds = new Int32Array(numBins)
      for (let i = 0; i < numBins; i++) {
        gridStarts[i] = start + i * binSize
        gridEnds[i] = start + (i + 1) * binSize
      }
      slab.gridStarts = gridStarts
      slab.gridEnds = gridEnds
    }
    return {
      starts: gridStarts,
      ends: gridEnds,
      scores: row,
      minScores: minRow,
      maxScores: maxRow,
      count,
    }
  }

  const starts = new Int32Array(count)
  const ends = new Int32Array(count)
  const scores = new Float32Array(count)
  // Allocated only on a summary level, so a base-resolution read still transfers
  // three arrays rather than five.
  const minScores = minRow ? new Float32Array(count) : undefined
  const maxScores = maxRow ? new Float32Array(count) : undefined
  let out = 0
  for (let i = 0; i < numBins; i++) {
    const score = row[i]!
    if (!Number.isNaN(score)) {
      starts[out] = start + i * binSize
      ends[out] = start + (i + 1) * binSize
      scores[out] = score
      // The converter writes all three from the same set of finer bins, so a
      // NaN here would mean a torn store; fall back to the mean rather than
      // emit a NaN the renderer would carry into its scale.
      if (minScores && maxScores) {
        const min = minRow![i]!
        const max = maxRow![i]!
        minScores[out] = Number.isNaN(min) ? score : min
        maxScores[out] = Number.isNaN(max) ? score : max
      }
      out++
    }
  }
  return { starts, ends, scores, minScores, maxScores, count }
}

// Checked rather than trusted, because the failure is silent otherwise: a level
// with fewer rows than the metadata claims makes the last samples' `subarray`
// run off the end, and `Number.isNaN(undefined)` is false, so those rows come
// back as full-length runs of NaN-scored features instead of an error.
async function openLevelArray(
  group: ZarrGroup<FetchStore>,
  path: string,
  numSamples: number,
) {
  const zarr = await zarritaP
  const array = await zarr.open.v3(group.resolve(path), { kind: 'array' })
  const { shape } = array
  if (shape.length !== 2 || shape[0] !== numSamples) {
    throw new Error(
      `signal matrix level "${path}" is shaped [${shape.join(', ')}], expected [${numSamples}, bins] to match the ${numSamples} samples in the store metadata`,
    )
  }
  return array
}

// A samples-by-bins quantitative matrix in a Zarr v3 store: one chunk holds
// every sample over a span of bins, so a screenful of a 2500-sample cohort is a
// couple of range requests instead of the 3-4 sequential index reads per file
// that a BigWig-per-sample track pays. The store's own attributes carry the
// sample list, bin size and resolution levels — see signalMatrixMetadata.ts.
export default class MultiWiggleZarrAdapter extends BaseFeatureDataAdapter {
  public static capabilities = ['hasResolution']

  private setupP?: Promise<{
    meta: SignalMatrixMetadata
    group: ZarrGroup<FetchStore>
    arrays: Map<string, Promise<ZarrArray<DataType, FetchStore>>>
  }>

  private async setupPre(opts?: BaseOptions) {
    const { statusCallback = () => {} } = opts ?? {}
    const group = await updateStatus(
      'Downloading zarr metadata',
      statusCallback,
      () =>
        openZarrGroup({
          adapterName: 'MultiWiggleZarrAdapter',
          location: this.getConf('zarrLocation'),
          pluginManager: this.pluginManager,
        }),
    )
    return {
      group,
      meta: parseSignalMatrixMetadata(group.attrs),
      arrays: new Map<string, Promise<ZarrArray<DataType, FetchStore>>>(),
    }
  }

  async setup(opts?: BaseOptions) {
    this.setupP ??= this.setupPre(opts).catch((e: unknown) => {
      this.setupP = undefined
      throw e
    })
    return this.setupP
  }

  // One open per array for the life of the adapter: opening an array is its own
  // metadata read, and the level is re-picked on every navigation. Keyed by
  // path rather than by level so a level's mean/min/max are three cache entries
  // and the summary pair is only ever opened on a level that declares it.
  private async openArray(path: string, opts?: BaseOptions) {
    const { group, arrays, meta } = await this.setup(opts)
    let arrayP = arrays.get(path)
    if (!arrayP) {
      // The rejection is not kept. A failed open is usually a transient fetch,
      // and the level is re-picked on every navigation, so caching it would
      // leave that zoom level broken for the life of the adapter with no way
      // back short of reloading the page.
      arrayP = openLevelArray(group, path, meta.samples.length).catch(
        (e: unknown) => {
          arrays.delete(path)
          throw e
        },
      )
      arrays.set(path, arrayP)
    }
    return arrayP
  }

  public async getRefNames(opts?: BaseOptions) {
    const { meta } = await this.setup(opts)
    return [...new Set(meta.levels.flatMap(l => Object.keys(l.refs)))]
  }

  // Where one region lands on a level's flat bin axis, or undefined if the
  // level does not cover it.
  private placeRegion(region: Region, level: SignalMatrixLevel) {
    const span = level.refs[region.refName]
    if (!span) {
      return undefined
    }
    const { binSize } = level
    const first = Math.max(0, Math.floor((region.start - span.start) / binSize))
    const last = Math.min(
      span.numBins,
      Math.ceil((region.end - span.start) / binSize),
    )
    return last <= first
      ? undefined
      : {
          from: span.binOffset + first,
          to: span.binOffset + last,
          start: span.start + first * binSize,
        }
  }

  // Merge the placed regions into as few reads as the layout allows.
  //
  // Every refName sits end to end on one bin axis in karyotype order, so a
  // multi-region view is usually a contiguous run of it and a whole-genome view
  // always is: 24 contigs at the coarsest level are ~3100 adjacent bins, which
  // is a dozen chunks. Asking per region instead turns that into 24 slices, and
  // 72 once a summary level triples them, for bytes the store would have handed
  // over in one pass.
  //
  // Two runs merge when the gap between them is under a chunk, because that
  // chunk is fetched either way. That is the whole rule: it never reads a chunk
  // it would not have read, so two far-apart windows stay two reads and do not
  // drag the space between them along.
  private planFetch(placed: { from: number; to: number }[], chunkBins: number) {
    const order = placed
      .map((_, i) => i)
      .sort((a, b) => placed[a]!.from - placed[b]!.from)
    const runs: { from: number; to: number }[] = []
    for (const i of order) {
      const { from, to } = placed[i]!
      const last = runs.at(-1)
      if (last && from - last.to <= chunkBins) {
        last.to = Math.max(last.to, to)
      } else {
        runs.push({ from, to })
      }
    }
    return runs
  }

  private async fetchRegionSlabs(
    regions: Region[],
    opts: WiggleOptions = {},
  ): Promise<RegionSlab[]> {
    const { bpPerPx = 0, resolution = 1 } = opts
    const { meta } = await this.setup(opts)
    const resolutionMultiplier: number = this.getConf('resolutionMultiplier')
    // One level for the whole call: bpPerPx describes the view, not a region.
    const level = pickLevel(
      meta.levels,
      (bpPerPx / resolution) * resolutionMultiplier,
    )
    const placed = regions.map(region => this.placeRegion(region, level))
    const present = placed.filter(p => p !== undefined)
    if (!present.length) {
      return regions.map(() => EMPTY_SLAB)
    }

    const zarr = await zarritaP
    const { minPath, maxPath } = level
    // `avg` draws the mean and nothing else, and it is the default, so reading
    // the summary arrays there triples the bytes for a screenful to buy a pair
    // the consumer allocates, fills and then discards.
    const wantSummary = minPath && maxPath && opts.summaryScoreMode !== 'avg'
    const paths = [level.path, ...(wantSummary ? [minPath, maxPath] : [])]
    const arrays = await Promise.all(paths.map(p => this.openArray(p, opts)))
    const chunkBins = arrays[0]!.chunks[1] ?? 1
    const runs = this.planFetch(present, chunkBins)

    // Every read of every run at once: they are independent range requests and
    // the point of the layout is that a screenful is a couple of them.
    const blocks = await Promise.all(
      runs.map(async run => {
        const selection = [null, zarr.slice(run.from, run.to)]
        const datas = await Promise.all(
          arrays.map(async (array, i) => {
            const { data } = await zarr.get(array, selection)
            if (!(data instanceof Float32Array)) {
              throw new Error(
                `signal matrix level "${paths[i]}" must be float32, got ${array.dtype}`,
              )
            }
            return data
          }),
        )
        return { run, values: datas[0]!, mins: datas[1], maxs: datas[2] }
      }),
    )

    return placed.map(p => {
      if (!p) {
        return EMPTY_SLAB
      }
      const block = blocks.find(b => b.run.from <= p.from && p.to <= b.run.to)!
      return {
        numBins: p.to - p.from,
        binSize: level.binSize,
        start: p.start,
        stride: block.run.to - block.run.from,
        offset: p.from - block.run.from,
        values: block.values,
        mins: block.mins,
        maxs: block.maxs,
      }
    })
  }

  public async getMultiSourceFeatureArraysMulti(
    regions: Region[],
    opts: WiggleOptions = {},
  ): Promise<{ source: string; raws: RawFeatureArrays[] }[]> {
    const { meta } = await this.setup(opts)
    const wanted = wantedNames(opts.sources)
    const slabs = await updateStatus(
      'Downloading signal matrix',
      opts.statusCallback ?? (() => {}),
      () => this.fetchRegionSlabs(regions, opts),
    )
    return meta.samples
      .map((sample, sampleIndex) => ({ sample, sampleIndex }))
      .filter(({ sample }) => !wanted || wanted.has(sample.name))
      .map(({ sample, sampleIndex }) => ({
        source: sample.name,
        raws: slabs.map(slab =>
          slab.numBins ? slabToRaw(slab, sampleIndex) : EMPTY_RAW,
        ),
      }))
  }

  public async getSources(_regions: Region[]) {
    const { meta } = await this.setup()
    return meta.samples.map(sample => ({ ...sample, source: sample.name }))
  }

  // The feature-object path, which the multiwiggle render never takes — it uses
  // the typed arrays above. This is what clustering (getScoreMatrix) reads, and
  // it costs one SimpleFeature per sample per bin, so it emits straight off the
  // slab rather than building per-sample typed arrays it would immediately throw
  // away.
  public getFeatures(
    region: Region,
    opts: WiggleOptions = {},
  ): Observable<Feature> {
    return ObservableCreate<Feature>(async observer => {
      const { meta } = await this.setup(opts)
      const wanted = wantedNames(opts.sources)
      const [slab] = await this.fetchRegionSlabs([region], opts)
      const { numBins, binSize, start, stride, offset, values } = slab!
      const { refName } = region
      for (const [sampleIndex, sample] of meta.samples.entries()) {
        if (wanted && !wanted.has(sample.name)) {
          continue
        }
        const lo = sampleIndex * stride + offset
        const row = values.subarray(lo, lo + numBins)
        for (let i = 0; i < numBins; i++) {
          const score = row[i]!
          if (Number.isNaN(score)) {
            continue
          }
          const featureStart = start + i * binSize
          observer.next(
            new SimpleFeature({
              // refName included: getFeaturesInMultipleRegions concatenates
              // regions, and two of them can hold the same bin coordinate on
              // different contigs.
              uniqueId: `${sample.name}-${refName}-${featureStart}`,
              refName,
              start: featureStart,
              end: featureStart + binSize,
              score,
              source: sample.name,
            }),
          )
        }
      }
      observer.complete()
    }, opts.signal)
  }
}
