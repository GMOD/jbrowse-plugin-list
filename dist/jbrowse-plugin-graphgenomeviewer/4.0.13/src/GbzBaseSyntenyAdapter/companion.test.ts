import { siblingCompanion } from './companion.ts'

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
