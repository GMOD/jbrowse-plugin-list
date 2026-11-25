import { isSequenceAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'
import { getFeatureAdapterOrThrow } from '@jbrowse/core/data_adapters/getFeatureAdapter'
import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes'
import { assembleLocString } from '@jbrowse/core/util'

import { planModifications } from '../modifications'
import {
  planHighlights,
  planRowData,
  planTviewMsa,
  renderRows,
  toFasta,
} from '../tview'

import type { TviewModifications } from '../modifications'
import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  RpcCallContext,
  RpcExecuteArgs,
} from '@jbrowse/core/rpc/RpcRegistry'
import type { Feature, Region } from '@jbrowse/core/util'
import type { Highlight, RowDataInput } from 'react-msaview'

/** one BAM/CRAM to draw rows from, and the name its rows are grouped under */
export interface TviewSourceArgs {
  adapterConfig: Record<string, unknown>
  sample: string
  /**
   * what this file calls the region's sequence. Filled in on the client, where
   * the assembly's aliases live: two files over one assembly routinely spell it
   * `4` and `chr4`, and a mismatched name fetches nothing and reports nothing.
   */
  refName?: string
}

export interface TviewGetPlanArgs {
  sources: TviewSourceArgs[]
  /** names the genome, so the call layer attaches its sequence adapter */
  assemblyName: string
  /** the sequence adapter's own spelling of the region */
  sequenceRefName: string
  region: Region
  /** stop before rendering an alignment bigger than this many cells */
  maxCells: number
}

export interface TviewPlanResult {
  msa: string
  /** per row name: its sample, and its copies and allele length at the subject */
  rowData: RowDataInput
  /** a bracket over each insertion site and each array block */
  highlights: Highlight[]
  columnCount: number
  cellCount: number
  region: { refName: string; start: number; end: number }
  /** whether rows carry a copy count at a subject array */
  hasSubject: boolean
  samples: string[]
  /** set when the alignment was over maxCells and `msa` is empty */
  tooLarge?: boolean
  /** set when some read in the window has an MM tag */
  modifications?: TviewModifications
}

declare module '@jbrowse/core/rpc/RpcRegistry' {
  interface RpcRegistry {
    TviewGetPlan: { args: TviewGetPlanArgs; return: TviewPlanResult }
  }
}

/**
 * Drains an adapter's feature observable into an array.
 *
 * Hand-rolled rather than `firstValueFrom(...pipe(toArray()))` because rxjs is
 * not a dependency here and `@jbrowse/core/util/rxjs` publishes only
 * `ObservableCreate`. Subscribing directly needs neither.
 */
async function fetchAll(
  args: RpcExecuteArgs<'TviewGetPlan'> & {
    pluginManager: PluginManager
    adapterConfig: Record<string, unknown>
  },
  region: Region,
) {
  const dataAdapter = await getFeatureAdapterOrThrow(args)
  return new Promise<Feature[]>((resolve, reject) => {
    const ret: Feature[] = []
    dataAdapter.getFeatures(region, { signal: args.signal }).subscribe({
      next: feature => ret.push(feature),
      error: reject,
      complete: () => {
        resolve(ret)
      },
    })
  })
}

/**
 * The reference over exactly `region`, which becomes the alignment's first row
 * and is what makes an array an interval rather than an insertion. The region
 * arrives clamped to its contig, so a short answer means the sequence could not
 * be read, and a row that stops early would misplace every column after it.
 */
async function fetchReference(
  pluginManager: PluginManager,
  {
    sessionId,
    sequenceAdapter,
    sequenceRefName,
    region,
    signal,
  }: RpcExecuteArgs<'TviewGetPlan'>,
) {
  const dataAdapter = sequenceAdapter
    ? (await getAdapter(pluginManager, sessionId, sequenceAdapter)).dataAdapter
    : undefined
  const sequence =
    dataAdapter && isSequenceAdapter(dataAdapter)
      ? await dataAdapter.getSequence(
          { ...region, refName: sequenceRefName },
          { signal },
        )
      : undefined
  const want = region.end - region.start
  if (sequence?.length !== want) {
    const n = (x: number) => x.toLocaleString('en-US')
    throw new Error(
      `Could not read the reference sequence over ${assembleLocString(region)}: got ${n(sequence?.length ?? 0)}bp of ${n(want)}bp`,
    )
  }
  return sequence
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
export default class TviewGetPlan extends RpcMethodType<'TviewGetPlan'> {
  name = 'TviewGetPlan' as const

  async serializeArguments(args: TviewGetPlanArgs & RpcCallContext) {
    const sources = await Promise.all(
      args.sources.map(async source => {
        const { regions } = await this.renameRegions({
          sessionId: args.sessionId,
          adapterConfig: source.adapterConfig,
          regions: [args.region],
        })
        return { ...source, refName: regions[0]!.refName }
      }),
    )
    return super.serializeArguments({ ...args, sources })
  }

  async execute(args: RpcExecuteArgs<'TviewGetPlan'>) {
    const { pluginManager } = this
    const { sources, region, maxCells } = args

    const [perSource, sequence] = await Promise.all([
      Promise.all(
        sources.map(source =>
          fetchAll(
            { ...args, pluginManager, adapterConfig: source.adapterConfig },
            { ...region, refName: source.refName ?? region.refName },
          ),
        ),
      ),
      fetchReference(pluginManager, args),
    ])
    const features: Feature[] = []
    const sampleByIndex: string[] = []
    for (const [i, feats] of perSource.entries()) {
      for (const feature of feats) {
        if (feature.get('seq')) {
          features.push(feature)
          sampleByIndex.push(sources[i]!.sample)
        }
      }
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
      columnCount: plan.layout.totalColumns,
      cellCount: plan.cellCount,
      rowData: planRowData(plan),
      highlights: planHighlights(plan),
      region: plan.region,
      hasSubject: plan.subject !== undefined,
      samples: plan.samples,
    }

    // the render is the expensive half and the only part bounded by rows x
    // columns, so the size check happens before it rather than after
    const rows = plan.cellCount > maxCells ? undefined : renderRows(plan)
    const modifications = rows
      ? planModifications({ features, plan, rows })
      : undefined
    return rows
      ? {
          ...shared,
          msa: toFasta(plan, rows),
          ...(modifications ? { modifications } : {}),
        }
      : { ...shared, msa: '', tooLarge: true }
  }
}
