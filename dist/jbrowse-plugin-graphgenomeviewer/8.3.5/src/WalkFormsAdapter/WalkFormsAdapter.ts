import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'
import {
  ExpansionTooLargeError,
  RegionTooLargeError,
  WalkReader,
  bpString,
  formsCut,
  panSNContig,
  panSNMatchesPrefix,
  structuralForms,
} from '@jbrowse/graph-walks'

import {
  formSources,
  formVariants,
  formWarnings,
  referenceGenotypes,
} from './formRows.ts'
import { floorOf, pinnedLocus, pinnedOf, warningPrefix } from './pinned.ts'
import { openTabixSlot } from '../panSNTabix.ts'

import type { WalkFormsAdapterConfig } from './configSchema.ts'
import type { Pinned } from './pinned.ts'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature } from '@jbrowse/core/util'
import type { Region } from '@jbrowse/core/util/types'
import type { HaplotypeDepartures, StructuralForms } from '@jbrowse/graph-walks'

const megabytes = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`

const millions = (n: number) => `${(n / 1_000_000).toFixed(1)} M`

// A zoom-in notice would mislead, since the view's zoom does not move the
// pinned window
function pinnedTooLarge(error: unknown, pinned: Pinned) {
  if (!(error instanceof RegionTooLargeError)) {
    return error
  }
  const window = pinnedLocus(pinned)
  if (error instanceof ExpansionTooLargeError) {
    return new Error(
      `The pinned window ${window} is too large to read every walk in full for structural forms: its walks take ${millions(error.steps)} steps, over the ${millions(error.limit)} step budget, and about ${bpString(error.fitsBp)} of it fits. Pin a narrower window`,
    )
  }
  const budget = `walkByteBudget, ${megabytes(error.limit)}`
  return new Error(
    `The pinned window ${window} is too large to cut for structural forms: ${
      error.zoomHelps
        ? `about ${bpString(error.fitsBp)} of it fits in ${budget}. Pin a narrower window or raise walkByteBudget`
        : `its cut fetches ${megabytes(error.bytes ?? 0)}, over ${budget}. Raise walkByteBudget`
    }`,
  )
}

// The departures of each pinned window, shared across adapter instances:
// dataAdapterCache keys an adapter on its whole config, so a new floor or
// exclude list makes a new adapter, which regroups these without a new cut.
// A cut at the MHC takes 8 s.
const CUTS_KEPT = 8
const cuts = new Map<string, Promise<HaplotypeDepartures[]>>()

function cachedCut(key: string, cut: () => Promise<HaplotypeDepartures[]>) {
  const kept = cuts.get(key)
  const read = kept ?? cut()
  cuts.delete(key)
  cuts.set(key, read)
  if (!kept) {
    read.catch(() => {
      if (cuts.get(key) === read) {
        cuts.delete(key)
      }
    })
    for (const old of cuts.keys()) {
      if (cuts.size <= CUTS_KEPT) {
        break
      }
      cuts.delete(old)
    }
  }
  return read
}

export default class WalkFormsAdapter extends BaseFeatureDataAdapter<WalkFormsAdapterConfig> {
  public static capabilities = ['getFeatures', 'getRefNames']

  private readonly reader = new WalkReader(
    openTabixSlot(this, ['walksLocation'], ['walksIndex']),
  )

  private formsRead: Promise<StructuralForms> | undefined

  private async referenceSample(opts: BaseOptions) {
    const { references } = await this.reader.header(opts)
    return references[0] ?? ''
  }

  // The reference sample's contigs, as the assembly names them
  async getRefNames(opts: BaseOptions = {}) {
    const names = await this.reader.referenceSequences(opts)
    const sample = await this.referenceSample(opts)
    const contigs = names
      .filter(n => panSNMatchesPrefix(n, sample))
      .map(n => panSNContig(n))
    return contigs.length > 0 ? [...new Set(contigs)] : names
  }

  private pinned() {
    const pinned = pinnedOf(this.getConf('pinned'))
    if (!pinned) {
      throw new Error(
        'WalkFormsAdapter needs `pinned`, the window its forms come from: { refName, start, end }',
      )
    }
    return pinned
  }

  // Read once per adapter, and so once per floor and exclude list. The cut
  // takes no caller's signal, since every later caller shares it. A partial
  // expansion would leave some walks as net changes over a whole chunk, so a
  // window too large to read them all errors instead.
  private forms(opts: BaseOptions) {
    if (!this.formsRead) {
      const pinned = this.pinned()
      const key = `${JSON.stringify(this.getConf('walksLocation'))}\t${pinned.refName}:${pinned.start}-${pinned.end}`
      const byteBudget = this.getConf('walkByteBudget')
      const read = cachedCut(`${key}\t${byteBudget}`, () =>
        updateStatus('Cutting walks', opts.statusCallback, () =>
          formsCut(this.reader, pinned, { byteBudget, partial: false }).catch(
            (error: unknown) => {
              throw pinnedTooLarge(error, pinned)
            },
          ),
        ),
      ).then(departures =>
        structuralForms(departures, {
          window: pinned,
          floorBp: floorOf(this.getConf('floorBp')),
          exclude: this.getConf('exclude'),
        }),
      )
      read.catch(() => {
        if (this.formsRead === read) {
          this.formsRead = undefined
        }
      })
      this.formsRead = read
    }
    return this.formsRead
  }

  private maxForms() {
    return this.getConf('maxForms')
  }

  /**
   * One source per form up to maxForms, which core's multi-sample variant
   * display draws as a row, and warnings naming the haplotypes left
   * abridged, unplaced or in the "other forms" row
   */
  async getSourcesAndWarnings(opts: BaseOptions = {}) {
    const result = await this.forms(opts)
    const prefix = warningPrefix(this.pinned())
    return {
      sources: formSources(result, this.maxForms()),
      warnings: formWarnings(result, this.maxForms()).map(w => prefix + w),
    }
  }

  async getSources(_regions: Region[], opts: BaseOptions = {}) {
    return formSources(await this.forms(opts), this.maxForms())
  }

  private async onPinnedSequence(refName: string, opts: BaseOptions) {
    const sample = await this.referenceSample(opts)
    const [query, pinned] = await Promise.all([
      this.reader.sequenceFor(sample, refName, opts),
      this.reader.sequenceFor(sample, this.pinned().refName, opts),
    ])
    return query !== undefined && query === pinned
  }

  getFeatures(query: Region, opts: BaseOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const result = await this.forms(opts)
      const variants = (await this.onPinnedSequence(query.refName, opts))
        ? formVariants(result, this.maxForms()).filter(
            v => v.start < query.end && v.end > query.start,
          )
        : []
      for (const v of variants) {
        observer.next(
          new SimpleFeature({
            uniqueId: `forms-${result.floorBp}-${v.id}`,
            refName: query.refName,
            start: v.start,
            end: v.end,
            name: v.name,
            description: v.description,
            type: v.type,
            svType: v.svType,
            consequence: v.consequence,
            REF: 'N',
            ALT: [v.alt],
            INFO: { SVTYPE: [v.svType], SVLEN: [v.mark.delta] },
            mark: v.mark,
            genotypes: v.genotypes,
          }),
        )
      }
      // Core before 5.0.0-beta.14 (1845c280a9) sends no payload for a block
      // with no records, which leaves the display on "Loading". The reference
      // placeholder draws nothing; drop it once the host floor reaches beta.14
      if (variants.length === 0) {
        const start = Math.floor(query.start)
        observer.next(
          new SimpleFeature({
            uniqueId: `forms-reference-${query.refName}-${start}`,
            refName: query.refName,
            start,
            end: start + 1,
            REF: 'N',
            ALT: ['.'],
            genotypes: referenceGenotypes(result, this.maxForms()),
          }),
        )
      }
      observer.complete()
    }, opts.signal)
  }
}
