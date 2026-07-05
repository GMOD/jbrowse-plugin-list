import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, doesIntersect2, max, min } from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature, Region } from '@jbrowse/core/util'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Observable } from 'rxjs'

export interface AlphaMissenseRow {
  uniqueId: string
  start: number
  end: number
  score: number
  ref: string
  variant: string
  am_class: string
}

/**
 * Parses AlphaMissense CSV text (protein_variant,score,am_class). The
 * protein_variant column looks like "V123L": a ref AA, a 1-based residue
 * coordinate, and a variant AA. Rows that don't parse to a numeric coordinate
 * are skipped rather than emitted as bogus position-0 features.
 */
export function parseAlphaMissense(text: string): AlphaMissenseRow[] {
  return text
    .split('\n')
    .slice(1)
    .map(f => f.trim())
    .filter(f => !!f)
    .flatMap((row, idx) => {
      const [protein_variant = '', score, am_class] = row.split(',')
      const ref = protein_variant[0]
      const variant = protein_variant.at(-1)
      const coord = +protein_variant.slice(1, -1)
      return ref !== undefined &&
        variant !== undefined &&
        !Number.isNaN(coord) &&
        score !== undefined &&
        am_class !== undefined
        ? [
            {
              uniqueId: `feat-${idx}`,
              ref,
              variant,
              start: coord,
              end: coord + 1,
              score: +score,
              am_class,
            },
          ]
        : []
    })
}

export default class AlphaMissensePathogenicityAdapter extends BaseFeatureDataAdapter {
  public static capabilities = ['getFeatures', 'getRefNames']

  public feats: Promise<AlphaMissenseRow[]> | undefined

  private async loadDataP() {
    const scores = await openLocation(this.getConf('location')).readFile('utf8')
    return parseAlphaMissense(scores)
  }

  private async loadData(_opts: BaseOptions = {}) {
    this.feats ??= this.loadDataP().catch((e: unknown) => {
      this.feats = undefined
      throw e
    })

    return this.feats
  }

  public async getGlobalStats(_opts?: BaseOptions) {
    const data = await this.loadData()
    const scores = data.map(s => s.score)
    return { scoreMin: min(scores), scoreMax: max(scores) }
  }

  // always render bigwig instead of calculating a feature density for it
  async getMultiRegionFeatureDensityStats(_regions: Region[]) {
    return { featureDensity: 0 }
  }
  public async getRefNames(_opts: BaseOptions = {}) {
    return []
  }

  public getFeatures(query: Region, _opts: BaseOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const { start, end, refName } = query
      const data = await this.loadData()
      for (const f of data) {
        if (doesIntersect2(f.start, f.end, start, end)) {
          observer.next(
            new SimpleFeature({
              ...f,
              refName,
              source: f.variant,
            }),
          )
        }
      }
      observer.complete()
    })
  }

  public async getSources() {
    const sources = new Set<string>()
    const data = await this.loadData()
    for (const f of data) {
      sources.add(f.variant)
    }
    return [...sources].map(s => ({
      name: s,
      __name: s,
    }))
  }

  public freeResources(): void {}
}
