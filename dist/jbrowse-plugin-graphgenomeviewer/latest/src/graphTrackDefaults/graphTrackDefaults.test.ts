import PluginManager from '@jbrowse/core/PluginManager'

import GraphTrackDefaultsF, { withLaneAnchor, withWalkReference } from './index'

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

// its links BED is out of the browser's reach, so it opens as whatever else
// guesses it rather than failing the guess
test('a segments BED picked in the browser defers', () => {
  expect(
    guessers().adapter({
      name: 'g.segs.bed.gz',
      blobId: 'b1',
      locationType: 'BlobLocation',
    }),
  ).toEqual({ type: 'Fallback' })
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
  expect(withLaneAnchor(track).adapter).toEqual({
    type: 'GbzBaseSyntenyAdapter',
    assemblyNames: ['hg38'],
  })
  const named = {
    ...track,
    adapter: { type: 'GbzBaseSyntenyAdapter', assemblyNames: ['hs1'] },
  }
  expect(withLaneAnchor(named)).toBe(named)
})

test("a walk lanes adapter naming no assemblies takes the track's", () => {
  const track = {
    type: 'GraphTrack',
    assemblyNames: ['hg38', 'HG002.1'],
    adapter: { type: 'WalkTabixSyntenyAdapter' },
  }
  expect(withLaneAnchor(track).adapter).toEqual({
    type: 'WalkTabixSyntenyAdapter',
    assemblyNames: ['hg38', 'HG002.1'],
  })
})

test('a walk file guesses the lanes adapter, so the track has graph and lanes', () => {
  const walks = uri('https://example.com/chr22.GRCh38.walks.bed.gz?sig=1')
  const expected = {
    walksLocation: walks,
    walksIndex: {
      indexType: 'TBI',
      location: uri('https://example.com/chr22.GRCh38.walks.bed.gz.tbi?sig=1'),
    },
  }
  const { adapter, trackType } = guessers()
  expect(adapter(walks)).toEqual({
    type: 'WalkTabixSyntenyAdapter',
    ...expected,
  })
  expect(adapter(walks, undefined, 'WalkTabixSyntenyAdapter')).toEqual({
    type: 'WalkTabixSyntenyAdapter',
    ...expected,
  })
  expect(adapter(walks, undefined, 'RgfaTabixAdapter')).toEqual({
    type: 'RgfaTabixAdapter',
    ...expected,
  })
  expect(trackType('WalkTabixSyntenyAdapter')).toBe('GraphTrack')
})

test('a walk file picked in the browser needs its index picked too', () => {
  const picked = (name: string) => ({
    name,
    blobId: name,
    locationType: 'BlobLocation' as const,
  })
  const { adapter } = guessers()
  expect(adapter(picked('g.GRCh38.walks.bed.gz'))).toEqual({
    type: 'Fallback',
  })
  expect(
    adapter(picked('g.GRCh38.walks.bed.gz'), picked('g.walks.bed.gz.csi')),
  ).toMatchObject({
    type: 'WalkTabixSyntenyAdapter',
    walksIndex: { indexType: 'CSI' },
  })
})

test("gfa-to-tabix's bubbles file guesses a bubble feature track", () => {
  const bubbles = uri('https://example.com/hprc.bubbles.bed.gz')
  const { adapter, trackType } = guessers()
  expect(adapter(bubbles)).toEqual({
    type: 'MinigraphBubbleAdapter',
    bubblesLocation: bubbles,
    index: {
      indexType: 'TBI',
      location: uri('https://example.com/hprc.bubbles.bed.gz.tbi'),
    },
  })
  expect(
    adapter(
      uri('https://example.com/b.bed.gz'),
      undefined,
      'MinigraphBubbleAdapter',
    ),
  ).toMatchObject({ type: 'MinigraphBubbleAdapter' })
  expect(adapter(bubbles, undefined, 'BedTabixAdapter')).toEqual({
    type: 'Fallback',
  })
  expect(trackType('MinigraphBubbleAdapter')).toBe('FeatureTrack')
})

test('a CSI beside the segments implies one beside the links', () => {
  expect(
    guessers().adapter(
      uri('https://example.com/hprc.segs.bed.gz'),
      uri('https://example.com/hprc.segs.bed.gz.CSI'),
    ),
  ).toMatchObject({
    segmentsIndex: { indexType: 'CSI' },
    linksIndex: {
      indexType: 'CSI',
      location: { uri: 'https://example.com/hprc.links.bed.gz.csi' },
    },
  })
})

test("a walk file with no PanSN map reads as its name's sample on the track's assembly", () => {
  const track = {
    type: 'GraphTrack',
    assemblyNames: ['hg38'],
    adapter: {
      type: 'RgfaTabixAdapter',
      walksLocation: uri('https://example.com/chr22.GRCh38.walks.bed.gz'),
    },
  }
  expect(withWalkReference(track).adapter).toMatchObject({
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  })
  const mapped = {
    ...track,
    adapter: { ...track.adapter, assemblyNameToPanSN: { hg38: 'X' } },
  }
  expect(withWalkReference(mapped)).toBe(mapped)
  const same = { ...track, assemblyNames: ['GRCh38'] }
  expect(withWalkReference(same)).toBe(same)
  const lanes = {
    ...track,
    adapter: { ...track.adapter, type: 'WalkTabixSyntenyAdapter' },
  }
  expect(withWalkReference(lanes).adapter).toMatchObject({
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  })
})
