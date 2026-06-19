import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'
import { Region } from '@jbrowse/core/util/types'
import { Feature } from '@jbrowse/core/util/simpleFeature'
import { Instance } from 'mobx-state-tree'
import { readConfObject } from '@jbrowse/core/configuration'
import { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import ICGCFeature from './ICGCFeature'
import MyConfigSchema from './configSchema'
import AbortablePromiseCache from 'abortable-promise-cache'
import LRU from '@jbrowse/core/util/QuickLRU'

export default class ICGCAdapter extends BaseFeatureDataAdapter {
  private filters: string

  private size: number

  private featureType: string

  public static capabilities = ['getFeatures', 'getRefNames']

  public constructor(config: Instance<typeof MyConfigSchema>) {
    super(config)

    const filters = readConfObject(config, 'filters') as string
    const size = readConfObject(config, 'size') as number
    const featureType = readConfObject(config, 'featureType') as string

    this.filters = filters
    this.size = size
    this.featureType = featureType
  }

  private featureCache = new AbortablePromiseCache({
    cache: new LRU({ maxSize: 200 }),
    fill: async (query: any, abortSignal?: AbortSignal) => {
      return this.fetchFeatures(query, abortSignal)
    },
  })

  private async fetchFeatures(query: string, signal?: AbortSignal) {
    const response = await fetch(
      `http://localhost:7080/proxy/api/v1/${this.featureType}?filters=${query}&size=${this.size}`,
      {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        signal,
      },
    )
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${response.status} ${response.statusText}`,
      )
    }
    return response.json()
  }

  public async getRefNames() {
    return [
      'chr1',
      'chr10',
      'chr11',
      'chr12',
      'chr13',
      'chr14',
      'chr15',
      'chr16',
      'chr17',
      'chr18',
      'chr19',
      'chr2',
      'chr20',
      'chr21',
      'chr22',
      'chr3',
      'chr4',
      'chr5',
      'chr6',
      'chr7',
      'chr8',
      'chr9',
      'chrX',
      'chrY',
    ]
  }

  private createQuery(location: string, start: number, end: number) {
    let query = {}
    if (this.filters != '{}') {
      const mutation = JSON.parse(this.filters)['mutation']
      const gene = JSON.parse(this.filters)['gene']
      const donor = JSON.parse(this.filters)['donor']

      if (mutation) {
        query = {
          mutation: {
            ...mutation,
            location: {
              is: `${location}:${start}-${end}`,
            },
          },
        }
      } else {
        query = {
          mutation: {
            location: {
              is: `${location}:${start}-${end}`,
            },
          },
        }
      }
      if (gene) {
        query = {
          ...query,
          gene,
        }
      }
      if (donor) {
        query = {
          ...query,
          donor,
        }
      }
    } else {
      query = {
        mutation: {
          location: {
            is: `${location}:${start}-${end}`,
          },
        },
      }
    }
    return query
  }

  public getFeatures(region: Region, opts: BaseOptions = {}) {
    const { refName, start, end } = region

    return ObservableCreate<Feature>(async (observer) => {
      try {
        const query = this.createQuery(refName, start, end)
        // idField for occurrences is donorId
        const idField = this.featureType === 'mutations' ? 'id' : 'donorId'

        const result = await this.featureCache.get(
          JSON.stringify(query),
          JSON.stringify(query),
          opts.signal,
        )

        for (const hit of result.hits) {
          const feature = new ICGCFeature({
            icgcObject: hit,
            id: hit[idField] as string,
            featureType: this.featureType,
          })
          observer.next(feature)
        }
      } catch (e) {
        observer.error(e)
      }
      observer.complete()
    }, opts.signal)
  }

  public freeResources(): void {}
}
