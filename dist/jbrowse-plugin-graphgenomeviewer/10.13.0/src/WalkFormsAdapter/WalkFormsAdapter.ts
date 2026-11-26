import {
  RegionTooLargeError,
  bpString,
  panSNContig,
  panSNMatchesPrefix,
  structuralForms,
} from '@gmod/gfa-tabix'
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { formSources, formVariants, formWarnings } from './formRows.ts'
import { floorOf, pinnedLocus, pinnedOf, warningPrefix } from './pinned.ts'
import { openWalkReader } from '../panSNTabix.ts'

import type { WalkFormsAdapterConfig } from './configSchema.ts'
import type { FormVariant } from './formRows.ts'
import type { Pinned } from './pinned.ts'
import type {
  HaplotypeDepartures,
  StructuralForms,
  WalkFile,
} from '@gmod/gfa-tabix'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature } from '@jbrowse/core/util'
import type { Region } from '@jbrowse/core/util/types'

const megabytes = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`

// A zoom-in notice would mislead, since the view's zoom does not move the
// pinned window
function pinnedTooLarge(error: unknown, pinned: Pinned) {
  if (!(error instanceof RegionTooLargeError)) {
    return error
  }
  const window = pinnedLocus(pinned)
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

  private readonly reader: WalkFile = openWalkReader(this)

  private formsRead: Promise<StructuralForms> | undefined

  private readonly variants = new WeakMap<StructuralForms, FormVariant[]>()

  private async referenceSample(opts: BaseOptions) {
    const { references } = await this.reader.getHeader(opts)
    return references[0] ?? ''
  }

  // The reference sample's contigs, as the assembly names them
  async getRefNames(opts: BaseOptions = {}) {
    const names = await this.reader.getReferenceSequences(opts)
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

  private async pinnedSequence(opts: BaseOptions) {
    const sample = await this.referenceSample(opts)
    const names = [this.pinned().refName, ...this.getConf('pinnedAliases')]
    const found = await Promise.all(
      names.map(name => this.reader.getSequenceName(sample, name, opts)),
    )
    return found.find(name => name !== undefined)
  }

  // Read once per adapter, and so once per floor and exclude list. The cut
  // takes no caller's signal, since every later caller shares it.
  private forms(opts: BaseOptions) {
    if (!this.formsRead) {
      const pinned = this.pinned()
      const byteBudget = this.getConf('walkByteBudget')
      const read = this.pinnedSequence({})
        .then(sequence => {
          const window = { ...pinned, refName: sequence ?? pinned.refName }
          const key = `${JSON.stringify(this.getConf('walksLocation'))}\t${window.refName}:${window.start}-${window.end}\t${byteBudget}`
          return sequence === undefined
            ? this.unplaced()
            : cachedCut(key, () =>
                updateStatus('Cutting walks', opts.statusCallback, () =>
                  this.reader
                    .getFormsForRange(sequence, window.start, window.end, {
                      byteBudget,
                    })
                    .catch((error: unknown) => {
                      throw pinnedTooLarge(error, pinned)
                    }),
                ),
              )
        })
        .then(departures =>
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

  // every haplotype the header names, none placed, for a pinned window on a
  // sequence the walk file lacks
  private async unplaced(): Promise<HaplotypeDepartures[]> {
    const { haplotypes } = await this.reader.getHeader()
    return haplotypes.map(haplotype => ({
      haplotype,
      covered: [],
      departures: [],
    }))
  }

  private variantsOf(result: StructuralForms) {
    const kept = this.variants.get(result)
    const variants = kept ?? formVariants(result, this.maxForms())
    if (!kept) {
      this.variants.set(result, variants)
    }
    return variants
  }

  private maxForms() {
    return this.getConf('maxForms')
  }

  /**
   * One source per form up to maxForms, which core's multi-sample variant
   * display draws as a row, and warnings naming the haplotypes left
   * unplaced or in the "other forms" row
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
      this.reader.getSequenceName(sample, refName, opts),
      this.pinnedSequence(opts),
    ])
    return query !== undefined && query === pinned
  }

  getFeatures(query: Region, opts: BaseOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      if (await this.onPinnedSequence(query.refName, opts)) {
        const result = await this.forms(opts)
        for (const v of this.variantsOf(result)) {
          if (v.start < query.end && v.end > query.start) {
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
        }
      }
      observer.complete()
    }, opts.signal)
  }
}
