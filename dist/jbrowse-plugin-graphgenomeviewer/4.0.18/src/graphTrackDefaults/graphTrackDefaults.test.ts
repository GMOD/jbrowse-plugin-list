import PluginManager from '@jbrowse/core/PluginManager'

import GraphTrackDefaultsF, { withGbzAnchor } from './index'

const uri = (u: string) => ({ uri: u, locationType: 'UriLocation' as const })

function guessers() {
  const pm = new PluginManager()
  GraphTrackDefaultsF(pm)
  return {
    adapter: pm.evaluateExtensionPoint('Core-guessAdapterForLocation', () => ({
      type: 'Fallback',
    })),
    trackType: pm.evaluateExtensionPoint(
      'Core-guessTrackTypeForLocation',
      () => 'FeatureTrack',
    ),
  }
}

test('a segments BED guesses the rGFA adapter', () => {
  expect(
    guessers().adapter(uri('https://example.com/hprc.segs.bed.gz')),
  ).toMatchObject({
    type: 'RgfaTabixAdapter',
    linksLocation: { uri: 'https://example.com/hprc.links.bed.gz' },
  })
})

test('a .gbz.db guesses the gbz-base adapter, its index as the haplotype index', () => {
  const index = uri('https://example.com/hprc.haplotype-index.db')
  expect(
    guessers().adapter(uri('https://example.com/hprc.gbz.db'), index),
  ).toEqual({
    type: 'GbzBaseSyntenyAdapter',
    gbzDbLocation: uri('https://example.com/hprc.gbz.db'),
    haplotypeIndexLocation: index,
  })
})

test("a url's query string keeps both graph files recognised, and rides on the siblings", () => {
  const { adapter } = guessers()
  expect(
    adapter(uri('https://example.com/hprc.gbz.db?X-Amz-Signature=abc')),
  ).toMatchObject({ type: 'GbzBaseSyntenyAdapter' })
  expect(
    adapter(uri('https://example.com/hprc.segs.bed.gz?token=t#frag')),
  ).toMatchObject({
    type: 'RgfaTabixAdapter',
    segmentsIndex: {
      location: {
        uri: 'https://example.com/hprc.segs.bed.gz.tbi?token=t#frag',
      },
    },
    linksLocation: {
      uri: 'https://example.com/hprc.links.bed.gz?token=t#frag',
    },
    linksIndex: {
      location: {
        uri: 'https://example.com/hprc.links.bed.gz.tbi?token=t#frag',
      },
    },
  })
})

test('other files and other adapter hints defer', () => {
  const { adapter } = guessers()
  expect(adapter(uri('x.bed.gz'))).toEqual({ type: 'Fallback' })
  expect(adapter(uri('x.gbz.db'), undefined, 'BedTabixAdapter')).toEqual({
    type: 'Fallback',
  })
})

test('both graph adapters guess a GraphTrack', () => {
  const { trackType } = guessers()
  expect(trackType('RgfaTabixAdapter')).toBe('GraphTrack')
  expect(trackType('GbzBaseSyntenyAdapter')).toBe('GraphTrack')
  expect(trackType('BedAdapter')).toBe('FeatureTrack')
})

test("a gbz adapter naming no assemblies takes the track's", () => {
  const track = {
    type: 'GraphTrack',
    assemblyNames: ['hg38'],
    adapter: { type: 'GbzBaseSyntenyAdapter' },
  }
  expect(withGbzAnchor(track).adapter).toEqual({
    type: 'GbzBaseSyntenyAdapter',
    assemblyNames: ['hg38'],
  })
  const named = {
    ...track,
    adapter: { type: 'GbzBaseSyntenyAdapter', assemblyNames: ['hs1'] },
  }
  expect(withGbzAnchor(named)).toBe(named)
})
