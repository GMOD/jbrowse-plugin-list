import { readConfObject } from '@jbrowse/core/configuration'
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { ucscFeatureData } from './ucscFeature'

import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature, Region } from '@jbrowse/core/util'
import type { Observable } from 'rxjs'

class RegionTooLargeError extends Error {
  regionTooLarge = true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const chromosomeLists = new Map<string, Promise<string[]>>()

async function queryUcsc(
  base: string,
  endpoint: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
) {
  const search = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, `${value}`]),
  )
  const response = await fetch(`${base}${endpoint}?${search}`, { signal })
  const body: unknown = await response.json().catch(() => undefined)
  const error = isRecord(body) ? body.error : undefined
  if (!response.ok || !isRecord(body) || error) {
    throw new Error(
      `UCSC API ${response.status}: ${typeof error === 'string' ? error : response.statusText}`,
    )
  }
  return body
}

function chromosomeList(base: string, genome: string) {
  const key = `${base} ${genome}`
  const cached = chromosomeLists.get(key)
  const list =
    cached ??
    queryUcsc(base, '/list/chromosomes', { genome }).then(
      body => (isRecord(body.chromosomes) ? Object.keys(body.chromosomes) : []),
      (error: unknown) => {
        chromosomeLists.delete(key)
        throw error
      },
    )
  chromosomeLists.set(key, list)
  return list
}

export default class UCSCAdapter extends BaseFeatureDataAdapter {
  private base() {
    const base: unknown = readConfObject(this.config, 'base')
    return isRecord(base) && typeof base.uri === 'string' ? base.uri : ''
  }

  private genome(assemblyName = '') {
    const genome: unknown = readConfObject(this.config, 'genome')
    return typeof genome === 'string' && genome ? genome : assemblyName
  }

  async getRefNames(opts: BaseOptions = {}) {
    const genome = this.genome(opts.assemblyName)
    return genome ? chromosomeList(this.base(), genome) : []
  }

  getFeatures(region: Region, opts: BaseOptions = {}): Observable<Feature> {
    return ObservableCreate<Feature>(async observer => {
      const track = `${readConfObject(this.config, 'track')}`
      const maxItems = Number(readConfObject(this.config, 'maxItems'))
      const body = await queryUcsc(
        this.base(),
        '/getData/track',
        {
          genome: this.genome(region.assemblyName),
          track,
          chrom: region.refName,
          start: Math.max(0, Math.floor(region.start)),
          end: Math.ceil(region.end),
          maxItemsOutput: maxItems,
        },
        opts.signal,
      )
      if (body.maxItemsLimit === true) {
        throw new RegionTooLargeError(
          `More than ${maxItems} features from UCSC track ${track} here; zoom in to see them`,
        )
      }
      const records = body[track]
      if (!Array.isArray(records)) {
        throw new Error(
          `UCSC returned no feature list for ${track} (track type ${String(body.trackType)})`,
        )
      }
      const trackType = typeof body.trackType === 'string' ? body.trackType : ''
      for (const record of records) {
        if (isRecord(record)) {
          observer.next(
            new SimpleFeature({
              id: `${track}-${JSON.stringify(record)}`,
              data: ucscFeatureData(record, trackType, region.refName),
            }),
          )
        }
      }
      observer.complete()
    }, opts.signal)
  }

  freeResources() {}
}
