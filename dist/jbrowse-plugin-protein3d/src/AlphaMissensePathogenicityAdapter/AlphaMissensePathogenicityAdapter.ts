import {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import {
  Feature,
  Region,
  SimpleFeature,
  doesIntersect2,
  max,
  min,
} from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

export default class AlphaMissensePathogenicityAdapter extends BaseFeatureDataAdapter {
  public static capabilities = ['getFeatures', 'getRefNames']

  public feats:
    | Promise<
        {
          uniqueId: string
          start: number
          end: number
          score: number
          ref: string
          variant: string
          am_class: string
        }[]
      >
    | undefined

  private async loadDataP() {
    const scores = await openLocation(this.getConf('location')).readFile('utf8')
    return scores
      .split('\n')
      .slice(1)
      .map(f => f.trim())
      .filter(f => !!f)
      .map((row, idx) => {
        const [protein_variant, score, am_class] = row.split(',')
        const ref = protein_variant![0]
        const variant = protein_variant!.at(-1)
        const coord = protein_variant!.slice(1, -1)
        return {
          uniqueId: `feat-${idx}`,
          ref: ref!,
          variant: variant!,
          start: +coord,
          end: +coord + 1,
          score: +score!,
          am_class: am_class!,
        }
      })
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
    const scoreMin = min(data.map(s => s.score))
    const scoreMax = max(data.map(s => s.score))
    return { scoreMin, scoreMax }
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
