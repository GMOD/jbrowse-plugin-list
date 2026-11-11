import { fileName, formatSpanBp } from './paneBase'

test('a span under a kilobase reads in bp', () => {
  expect(formatSpanBp(0)).toBe('0 bp')
  expect(formatSpanBp(420)).toBe('420 bp')
  expect(formatSpanBp(999)).toBe('999 bp')
  expect(formatSpanBp(1000)).toBe('1 kb')
})

test('a file name is the last path segment without its query', () => {
  expect(
    fileName({
      uri: 'https://example.com/g/graph.gfa?sig=a/b#frag',
      locationType: 'UriLocation',
    }),
  ).toBe('graph.gfa')
  expect(
    fileName({
      localPath: 'C:\\data\\graph.gfa',
      locationType: 'LocalPathLocation',
    }),
  ).toBe('graph.gfa')
})
