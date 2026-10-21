import {
  manifestLocation,
  parseGraphManifest,
  readGraphManifest,
} from './graphManifest'

import type { FileLocation } from '@jbrowse/core/util'
import type * as IO from '@jbrowse/core/util/io'

const served = vi.hoisted(() => new Map<string, string | Error>())

vi.mock('@jbrowse/core/util/io', async importOriginal => {
  const io = await importOriginal<typeof IO>()
  return {
    ...io,
    openLocation: (loc: FileLocation) => ({
      readFile: () => {
        const body = 'uri' in loc ? served.get(loc.uri) : undefined
        return body === undefined
          ? Promise.reject(new Error('HTTP 404'))
          : body instanceof Error
            ? Promise.reject(body)
            : Promise.resolve(body)
      },
    }),
  }
})

beforeEach(() => {
  served.clear()
})

const manifest = {
  schema: 1,
  reference: 'GRCh38',
  index: 'out',
  contig: 'out.contig',
  tier: { prefix: 'out.fold10000', foldBelowBp: 10000 },
  bubbles: 'out.bubbles.bed.gz',
  alleles: 'out.alleles.bed.gz',
}

const parse = (value: unknown) => parseGraphManifest(JSON.stringify(value))

test('reads the reference and tier, ignoring unknown fields', () => {
  expect(parse({ ...manifest, future: [1, 2] })).toEqual({
    reference: 'GRCh38',
    tier: { prefix: 'out.fold10000', foldBelowBp: 10000 },
  })
})

test('a null reference, tier and companions leave those out', () => {
  expect(
    parse({
      ...manifest,
      reference: null,
      contig: null,
      tier: null,
      bubbles: null,
      alleles: null,
    }),
  ).toEqual({})
})

test('refuses malformed JSON and any schema but 1', () => {
  expect(parseGraphManifest('{"schema": 1,')).toBeUndefined()
  expect(parseGraphManifest('[]')).toBeUndefined()
  expect(parse({ ...manifest, schema: 2 })).toBeUndefined()
  expect(parse({ ...manifest, schema: '1' })).toBeUndefined()
  expect(parse({ ...manifest, schema: undefined })).toBeUndefined()
})

test('refuses wrongly typed fields', () => {
  expect(parse({ ...manifest, reference: 7 })).toBeUndefined()
  expect(parse({ ...manifest, reference: ' ' })).toBeUndefined()
  expect(parse({ ...manifest, tier: 'out.fold10000' })).toBeUndefined()
  for (const foldBelowBp of ['10000', 0, -5, null]) {
    expect(
      parse({ ...manifest, tier: { prefix: 'out.fold10000', foldBelowBp } }),
    ).toBeUndefined()
  }
  expect(parse({ ...manifest, alleles: 3 })).toBeUndefined()
})

test('refuses any name that is not a file beside the manifest', () => {
  for (const name of [
    '../x',
    '..',
    '.hidden',
    'a/b',
    'a\\b',
    '/etc/passwd',
    'https://evil.example/x',
    '//evil.example/x',
    'x?y',
    '%2e%2e',
    '',
  ]) {
    expect(
      parse({ ...manifest, tier: { prefix: name, foldBelowBp: 10000 } }),
    ).toBeUndefined()
    expect(parse({ ...manifest, bubbles: name })).toBeUndefined()
    expect(parse({ ...manifest, index: name })).toBeUndefined()
  }
})

const segs = {
  uri: 'https://example.com/g/out.segs.bed.gz?sig=1',
  locationType: 'UriLocation' as const,
}

test('looks for <prefix>.graph.json beside the segments, keeping the query', () => {
  expect(manifestLocation(segs)).toEqual({
    uri: 'https://example.com/g/out.graph.json?sig=1',
    locationType: 'UriLocation',
  })
  expect(
    manifestLocation({
      name: 'out.segs.bed.gz',
      blobId: 'b',
      locationType: 'BlobLocation',
    }),
  ).toBeUndefined()
})

test('reads a manifest that is there', async () => {
  served.set(
    'https://example.com/g/out.graph.json?sig=1',
    JSON.stringify(manifest),
  )
  expect(await readGraphManifest(segs)).toEqual({
    reference: 'GRCh38',
    tier: { prefix: 'out.fold10000', foldBelowBp: 10000 },
  })
})

test('a missing, unreachable or malformed manifest is none', async () => {
  expect(await readGraphManifest(segs)).toBeUndefined()
  served.set('https://example.com/g/out.graph.json?sig=1', new Error('CORS'))
  expect(await readGraphManifest(segs)).toBeUndefined()
  served.set('https://example.com/g/out.graph.json?sig=1', '<html>')
  expect(await readGraphManifest(segs)).toBeUndefined()
})
