import {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import {
  Feature,
  Region,
  SimpleFeature,
  doesIntersect2,
} from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

export default class AlphaFoldConfidenceAdapter extends BaseFeatureDataAdapter {
  public static capabilities = ['getFeatures', 'getRefNames']

  public feats:
    | Promise<{ uniqueId: string; start: number; end: number; score: number }[]>
    | undefined

  private async loadDataP() {
    const scores = JSON.parse(
      await openLocation(this.getConf('location')).readFile('utf8'),
    ) as { residueNumber: number[]; confidenceScore: number[] }

    return scores.residueNumber.map((value, idx) => ({
      uniqueId: `feat-${idx}`,
      start: value,
      end: value + 1,
      score: scores.confidenceScore[idx]!,
    }))
  }

  private async loadData(_opts: BaseOptions = {}) {
    this.feats ??= this.loadDataP().catch((e: unknown) => {
      this.feats = undefined
      throw e
    })

    return this.feats
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
          observer.next(new SimpleFeature({ ...f, refName }))
        }
      }
      observer.complete()
    })
  }

  public freeResources(): void {}
}
