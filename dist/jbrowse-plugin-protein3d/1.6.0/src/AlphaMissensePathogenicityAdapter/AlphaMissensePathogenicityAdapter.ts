import { max, min } from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'

import { type AlphaMissenseRow, parseAlphaMissense } from './parseAlphaMissense'
import { BaseProteinAnnotationAdapter } from '../BaseProteinAnnotationAdapter'

import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Region } from '@jbrowse/core/util'

export default class AlphaMissensePathogenicityAdapter extends BaseProteinAnnotationAdapter<AlphaMissenseRow> {
  protected async loadFeatures() {
    return parseAlphaMissense(
      await openLocation(this.getConf('location')).readFile('utf8'),
    )
  }

  protected featureData(row: AlphaMissenseRow, refName: string) {
    return { ...row, refName, source: row.variant }
  }

  public async getGlobalStats(_opts?: BaseOptions) {
    const scores = (await this.loadData()).map(s => s.score)
    return { scoreMin: min(scores), scoreMax: max(scores) }
  }

  // always render bigwig instead of calculating a feature density for it
  async getMultiRegionFeatureDensityStats(_regions: Region[]) {
    return { featureDensity: 0 }
  }

  public async getSources() {
    const sources = new Set((await this.loadData()).map(f => f.variant))
    return [...sources].map(s => ({ name: s, __name: s }))
  }
}
