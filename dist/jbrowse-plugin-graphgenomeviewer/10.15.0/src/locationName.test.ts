import { walkFileSample } from './locationName'

test('a walk file gives the sample after the last dot of its prefix', () => {
  expect(walkFileSample('chr22.GRCh38.walks.gz')).toBe('GRCh38')
  expect(walkFileSample('/data/hprc-v2.1-mc-grch38-f5s.GRCh38.walks.gz')).toBe(
    'GRCh38',
  )
  expect(walkFileSample('C:\\data\\pg.CHM13.walks.gz')).toBe('CHM13')
})

test('a digits-only tail, the version of a dotted name, gives no guess', () => {
  expect(walkFileSample('pg.GCA_000005845.2.walks.gz')).toBeUndefined()
  expect(walkFileSample('pg.CHM13v2.0.walks.gz')).toBeUndefined()
})

test('a name with no sample, or no walk suffix, gives none', () => {
  expect(walkFileSample('GRCh38.walks.gz')).toBeUndefined()
  expect(walkFileSample('pg..walks.gz')).toBeUndefined()
  expect(walkFileSample('pg.GRCh38.segs.bed.gz')).toBeUndefined()
})
