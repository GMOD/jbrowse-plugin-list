import { firstValueFrom, toArray } from 'rxjs'
import { afterEach, describe, expect, test, vi } from 'vitest'

import UCSCAdapter from './UCSCAdapter'
import cosmicMuts from './__fixtures__/cosmicMuts.json'
import configSchema from './configSchema'

const region = {
  assemblyName: 'hg38',
  refName: 'chr17',
  start: 43044380,
  end: 43044450,
}

function adapterFor(config: Record<string, unknown>) {
  return new UCSCAdapter(
    configSchema.create({ type: 'UCSCAdapter', ...config }),
  )
}

function respond(status: number, body: unknown) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(Response.json(body, { status })),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function requestedUrl(fetchMock: ReturnType<typeof respond>) {
  return new URL(String(fetchMock.mock.calls[0]?.[0]))
}

function features(adapter: UCSCAdapter) {
  return firstValueFrom(adapter.getFeatures(region).pipe(toArray()))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('UCSCAdapter', () => {
  test('queries the configured track for the region', async () => {
    const fetchMock = respond(200, cosmicMuts)
    const result = await features(adapterFor({ track: 'cosmicMuts' }))
    expect(result.map(feature => feature.get('name'))).toEqual([
      'COSV58790086',
      'COSV106433609',
    ])
    expect(
      Object.fromEntries(requestedUrl(fetchMock).searchParams),
    ).toMatchObject({
      genome: 'hg38',
      track: 'cosmicMuts',
      chrom: 'chr17',
      start: '43044380',
      end: '43044450',
    })
  })

  test('prefers the configured genome over the assembly name', async () => {
    const fetchMock = respond(200, cosmicMuts)
    await features(adapterFor({ track: 'cosmicMuts', genome: 'GCF_1' }))
    expect(requestedUrl(fetchMock).searchParams.get('genome')).toBe('GCF_1')
  })

  test('reports the error UCSC gives', async () => {
    respond(403, { error: "'track=hgmd' is protected data" })
    await expect(features(adapterFor({ track: 'hgmd' }))).rejects.toThrow(
      "UCSC API 403: 'track=hgmd' is protected data",
    )
  })

  test('asks to zoom in when UCSC truncates the region', async () => {
    respond(200, { ...cosmicMuts, maxItemsLimit: true })
    await expect(
      features(adapterFor({ track: 'cosmicMuts', maxItems: 2 })),
    ).rejects.toMatchObject({ regionTooLarge: true })
  })

  test('lists the chromosomes of the configured genome', async () => {
    const fetchMock = respond(200, {
      chromosomes: { chr1: 248956422, chrX: 156040895, chrM: 16569 },
    })
    const adapter = adapterFor({ track: 'cosmicMuts', genome: 'hg38' })
    expect(await adapter.getRefNames()).toEqual(['chr1', 'chrX', 'chrM'])
    expect(requestedUrl(fetchMock).pathname).toBe('/list/chromosomes')
  })

  test('lists no chromosomes without a genome', async () => {
    const fetchMock = respond(200, {})
    expect(await adapterFor({ track: 'cosmicMuts' }).getRefNames()).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
