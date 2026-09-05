import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'
import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'
import { renameRegionsIfNeeded } from '@jbrowse/core/util'

import { buildSampleTree } from '../sampleTree'
import { planTviewMsa, renderTviewMsa } from '../tview'

import type { AlignmentFeature } from '../readLayout'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Region } from '@jbrowse/core/util'

/** one BAM/CRAM to draw rows from, and the name its rows are grouped under */
export interface TviewSourceArgs {
  adapterConfig: Record<string, unknown>
  sample?: string
  /**
   * what this file calls the region's sequence. Filled in on the client, where
   * the assembly's aliases live: two files over one assembly routinely spell it
   * `4` and `chr4`, and a mismatched name fetches nothing and reports nothing.
   */
  refName?: string
}

export interface TviewGetPlanArgs {
  sessionId: string
  sources: TviewSourceArgs[]
  /** the assembly's sequence adapter, when it has one */
  sequenceAdapterConfig?: Record<string, unknown>
  /** the sequence adapter's own spelling of the region */
  sequenceRefName?: string
  region: Region
  /** stop before rendering an alignment bigger than this many cells */
  maxCells: number
}

/** what crosses back: the alignment, and the numbers the dialog reports */
export interface TviewArrayReport {
  start: number
  end: number
  period: number
  unit: string
  width: number
  /** per row: copies carried, and allele length in bp */
  copies: [string, number][]
  lengths: [string, number][]
}

export interface TviewPlanResult {
  msa: string
  /** Newick grouping rows by sample; absent unless several were loaded */
  tree?: string
  rowCount: number
  columnCount: number
  cellCount: number
  insertionWidths: [number, number][]
  arraySpans: [number, number, number][]
  region: { refName: string; start: number; end: number }
  arrays: TviewArrayReport[]
  subjectIndex?: number
  referenceName?: string
  samples: string[]
  /** set when the alignment was over maxCells and `msa` is empty */
  tooLarge?: boolean
}

/** the slice of a data adapter this reads, which is all of `getFeatures` */
interface FeatureSource {
  getFeatures: (region: Region) => {
    subscribe: (observer: {
      next: (feature: AlignmentFeature) => void
      error: (error: unknown) => void
      complete: () => void
    }) => unknown
  }
}

function isFeatureSource(adapter: object): adapter is FeatureSource {
  return 'getFeatures' in adapter && typeof adapter.getFeatures === 'function'
}

/**
 * Drains an adapter's feature observable into an array.
 *
 * Hand-rolled rather than `firstValueFrom(...pipe(toArray()))` because rxjs is
 * not a dependency here and `@jbrowse/core/util/rxjs` publishes only
 * `ObservableCreate`. Subscribing directly needs neither.
 */
async function fetchAll(
  pluginManager: PluginManager,
  sessionId: string,
  adapterConfig: Record<string, unknown>,
  region: Region,
) {
  const { dataAdapter } = await getAdapter(
    pluginManager,
    sessionId,
    adapterConfig,
  )
  if (!isFeatureSource(dataAdapter)) {
    throw new Error(`${adapterConfig.type as string} has no getFeatures`)
  }
  return new Promise<AlignmentFeature[]>((resolve, reject) => {
    const ret: AlignmentFeature[] = []
    dataAdapter.getFeatures(region).subscribe({
      next: feature => ret.push(feature),
      error: reject,
      complete: () => {
        resolve(ret)
      },
    })
  })
}

/**
 * Builds the whole alignment in the worker and sends back the FASTA.
 *
 * The work this moves is not the fetch — `CoreGetFeatures` already ran in a
 * worker — but everything after it. Fetching from the client meant serializing
 * every read's sequence and CIGAR across the boundary and then running the
 * pairwise alignments and the string building on the main thread, where a
 * region carrying a kilobase-scale array froze the UI for as long as it took.
 * What comes back now is the alignment, which is smaller than the reads it was
 * built from and is the only thing the view has a use for.
 *
 * It is also what makes several files one call: their rows are squared up
 * against the same reference interval, so an array's copies are counted once,
 * over rows from all of them.
 */
export default class TviewGetPlan extends RpcMethodType {
  name = 'TviewGetPlan'

  /**
   * Written against the 4.3.0 base class, which takes a bare
   * `Record<string, unknown>` and has no `renameRegions` helper — that is the
   * oldest host this bundle boots on, and the newer base class accepts the same
   * shape.
   */
  async serializeArguments(
    args: Record<string, unknown>,
    rpcDriverClassName: string,
  ) {
    const typed = args as unknown as TviewGetPlanArgs
    const assemblyManager =
      this.pluginManager.rootModel?.session?.assemblyManager
    if (!assemblyManager) {
      throw new Error('no assembly manager')
    }
    const refNameFor = async (adapterConfig: Record<string, unknown>) => {
      const { regions } = await renameRegionsIfNeeded(assemblyManager, {
        sessionId: typed.sessionId,
        adapterConfig,
        regions: [typed.region],
      })
      return regions[0]!.refName
    }
    const sources = await Promise.all(
      typed.sources.map(async source => ({
        ...source,
        refName: await refNameFor(source.adapterConfig),
      })),
    )
    const sequenceRefName = typed.sequenceAdapterConfig
      ? await refNameFor(typed.sequenceAdapterConfig)
      : undefined

    return super.serializeArguments(
      { ...args, sources, sequenceRefName },
      rpcDriverClassName,
    )
  }

  async execute(args: TviewGetPlanArgs, rpcDriverClassName: string) {
    const {
      sessionId,
      sources,
      sequenceAdapterConfig,
      sequenceRefName,
      region,
      maxCells,
    } = await this.deserializeArguments(args, rpcDriverClassName)

    const perSource = await Promise.all(
      sources.map(source =>
        fetchAll(this.pluginManager, sessionId, source.adapterConfig, {
          ...region,
          refName: source.refName ?? region.refName,
        }),
      ),
    )
    const features: AlignmentFeature[] = []
    const sampleByIndex: (string | undefined)[] = []
    for (const [i, feats] of perSource.entries()) {
      for (const feature of feats) {
        if (feature.get('seq')) {
          features.push(feature)
          sampleByIndex.push(sources[i]!.sample)
        }
      }
    }

    let sequence: string | undefined
    if (sequenceAdapterConfig) {
      const seqFeats = await fetchAll(
        this.pluginManager,
        sessionId,
        sequenceAdapterConfig,
        { ...region, refName: sequenceRefName ?? region.refName },
      )
      const seq = seqFeats[0]?.get('seq') as string | undefined
      const seqStart = seqFeats[0]?.get('start') as number | undefined
      // the adapter may answer with a wider block than it was asked for
      const sliced =
        seq !== undefined && seqStart !== undefined
          ? seq.slice(region.start - seqStart, region.end - seqStart)
          : undefined
      // a short answer means the region runs off the end of the contig, and a
      // reference row that stops early would misplace every column after it
      sequence =
        sliced?.length === region.end - region.start ? sliced : undefined
    }

    const plan = planTviewMsa({
      features,
      refName: region.refName,
      start: region.start,
      end: region.end,
      sequence,
      sampleOf: i => sampleByIndex[i],
    })

    const shared = {
      rowCount: plan.reads.length,
      columnCount: plan.layout.totalColumns,
      cellCount: plan.cellCount,
      insertionWidths: plan.insertionWidths,
      arraySpans: plan.arraySpans,
      region: plan.region,
      arrays: plan.arrays.map(a => ({
        start: a.start,
        end: a.end,
        period: a.period,
        unit: a.unit,
        width: a.width,
        copies: [...a.copiesByName.entries()],
        lengths: [...a.lengthByName.entries()],
      })),
      subjectIndex: plan.subject
        ? plan.arrays.indexOf(plan.subject)
        : undefined,
      referenceName: plan.referenceName,
      samples: plan.samples,
    }

    // the render is the expensive half and the only part bounded by rows x
    // columns, so the size check happens before it rather than after
    return plan.cellCount > maxCells
      ? { ...shared, msa: '', tooLarge: true }
      : {
          ...shared,
          msa: renderTviewMsa(plan),
          tree: buildSampleTree(plan.reads),
        }
  }
}
