import {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import { NoAssemblyRegion } from '@jbrowse/core/util/types'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'
import SimpleFeature, { Feature } from '@jbrowse/core/util/simpleFeature'
import { toArray } from 'rxjs/operators'
import { readConfObject } from '@jbrowse/core/configuration'

interface WiggleOptions extends BaseOptions {
  resolution?: number
}

export default class QuantitativeSequenceAdapter extends BaseFeatureDataAdapter {
  public static capabilities = [
    'hasResolution',
    'hasLocalStats',
    'hasGlobalStats',
  ]

  private sequenceAdapter: any
  private wiggleAdapter: any

  private async setup() {
    const sequenceAdapterConfig = readConfObject(this.config, 'sequenceAdapter')
    if (sequenceAdapterConfig) {
      if (!this.getSubAdapter) {
        throw new Error('getSubadapter not available')
      }
      const { dataAdapter } = await this.getSubAdapter(sequenceAdapterConfig)
      this.sequenceAdapter = dataAdapter as BaseFeatureDataAdapter
    }

    const wiggleAdapterConfig = readConfObject(this.config, 'wiggleAdapter')
    if (wiggleAdapterConfig) {
      if (!this.getSubAdapter) {
        throw new Error('getSubadapter not available')
      }
      const { dataAdapter } = await this.getSubAdapter(wiggleAdapterConfig)
      this.wiggleAdapter = dataAdapter as BaseFeatureDataAdapter
    }
  }

  public async getRefNames(opts?: BaseOptions) {
    await this.setup()
    return this.wiggleAdapter.getRefNames(opts)
  }

  public async getGlobalStats(opts?: BaseOptions) {
    await this.setup()
    return this.wiggleAdapter.getGlobalStats(opts)
  }

  public getFeatures(
    region: NoAssemblyRegion & { originalRefName?: string },
    opts: WiggleOptions = {},
  ) {
    const { refName } = region
    const { signal } = opts
    return ObservableCreate<Feature>(async observer => {
      const features = this.wiggleAdapter.getFeatures(region, opts)

      if (region.end - region.start < 5000) {
        const sequence = this.sequenceAdapter.getFeatures(
          { ...region, refName: region.originalRefName },
          opts,
        )
        const featureArray = await features.pipe(toArray()).toPromise()
        const sequenceFeatureArray = await sequence.pipe(toArray()).toPromise()

        const seqString = sequenceFeatureArray[0].get('seq')
        const scoreArray = new Array(region.end - region.start)
        featureArray.forEach((feature: any) => {
          const featureStart = feature.get('start')
          const featureEnd = feature.get('end')

          for (let i = featureStart; i < featureEnd; i++) {
            if (i - region.start >= 0 && i - region.start < scoreArray.length) {
              scoreArray[i - region.start] = {
                base: seqString[i - region.start],
                score: feature.get('score'),
              }
            }
          }
        })

        scoreArray.forEach((score, i) => {
          const start = region.start + i
          const end = region.start + i + 1
          observer.next(
            new SimpleFeature({
              id: `${refName} ${start}-${end}`,
              data: { refName, start, end, ...score },
            }),
          )
        })

        observer.complete()
      } else {
        features.subscribe(observer)
      }
    }, signal)
  }

  public freeResources(): void {}
}
