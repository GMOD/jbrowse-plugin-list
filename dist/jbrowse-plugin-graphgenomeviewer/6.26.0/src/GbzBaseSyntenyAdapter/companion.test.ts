import { findCompanion, siblingCompanion } from './companion.ts'

import type * as IO from '@jbrowse/core/util/io'

const statError = vi.hoisted(() => ({ current: undefined as unknown }))

vi.mock('@jbrowse/core/util/io', async importOriginal => {
  const io = await importOriginal<typeof IO>()
  return {
    ...io,
    openLocation: (...args: Parameters<typeof io.openLocation>) =>
      statError.current === undefined
        ? io.openLocation(...args)
        : { stat: () => Promise.reject(statError.current as Error) },
  }
})

test('names the haplotype index beside a .gbz.db, keeping a query string', () => {
  expect(
    siblingCompanion({
      uri: 'https://example.com/hprc.gbz.db?token=t',
      locationType: 'UriLocation',
    }),
  ).toEqual({
    uri: 'https://example.com/hprc.haplotype-index.db?token=t',
    locationType: 'UriLocation',
  })
  expect(
    siblingCompanion({
      localPath: '/data/hprc.gbz.db',
      locationType: 'LocalPathLocation',
    }),
  ).toEqual({
    localPath: '/data/hprc.haplotype-index.db',
    locationType: 'LocalPathLocation',
  })
})

test('names nothing for another file or a picked blob', () => {
  expect(
    siblingCompanion({ uri: 'x.db', locationType: 'UriLocation' }),
  ).toBeUndefined()
  expect(
    siblingCompanion({
      blobId: 'b1',
      name: 'hprc.gbz.db',
      locationType: 'BlobLocation',
    }),
  ).toBeUndefined()
})

const remote = {
  uri: 'https://example.com/hprc.gbz.db',
  locationType: 'UriLocation' as const,
}

test('a missing companion is no index, and an unreachable one says why', async () => {
  expect(
    await findCompanion({
      localPath: '/nonexistent/hprc.gbz.db',
      locationType: 'LocalPathLocation',
    }),
  ).toEqual({})
  for (const answer of ['HTTP 404 fetching x', 'HTTP 403 fetching x']) {
    statError.current = new Error(answer)
    expect(await findCompanion(remote)).toEqual({})
  }
  statError.current = new Error('Failed to fetch fetching x')
  expect(await findCompanion(remote)).toEqual({
    unreadable: 'Error: Failed to fetch fetching x',
  })
  statError.current = undefined
})

test('a companion that is there is found', async () => {
  const gbzDb = {
    localPath: require.resolve('./test_data/micb-kir3dl1.gbz.db'),
    locationType: 'LocalPathLocation' as const,
  }
  expect(await findCompanion(gbzDb)).toEqual({
    location: siblingCompanion(gbzDb),
  })
})
