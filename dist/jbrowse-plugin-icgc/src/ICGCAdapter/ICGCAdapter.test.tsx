import { toArray } from 'rxjs/operators'
import ICGCAdapter from './ICGCAdapter'
import configSchema from './configSchema'
import { icgcFilters, icgcResponse } from './test_data/icgc_test_data.jsx'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

test('adapter can fetch features from the icgc', async () => {
  const adapter = new ICGCAdapter(
    configSchema.create({
      ICGCAdapterId: 'test-icgc-adapter',
      filters: JSON.stringify(icgcFilters),
    }),
  )

  fetchMock.mockResponseOnce(JSON.stringify(icgcResponse))

  const features = adapter.getFeatures({
    assemblyName: 'volvox',
    refName: 'chr3',
    start: 124900600,
    end: 124925000,
  })

  const names = await adapter.getRefNames()
  expect(names).toMatchSnapshot()

  const featuresArray = await features.pipe(toArray()).toPromise()
  expect(featuresArray.slice(0, 3)).toMatchSnapshot()
})
