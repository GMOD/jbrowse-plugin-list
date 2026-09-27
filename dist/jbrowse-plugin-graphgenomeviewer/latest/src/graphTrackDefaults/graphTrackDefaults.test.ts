import PluginManager from '@jbrowse/core/PluginManager'

import GraphTrackDefaultsF, { withGraphDisplayFirst } from './index'

const adapter = { type: 'RgfaTabixAdapter' }

test('a FeatureTrack over an rGFA with no displays opens as the graph', () => {
  expect(
    withGraphDisplayFirst({ type: 'FeatureTrack', trackId: 'g', adapter })
      .displays,
  ).toEqual([{ type: 'LinearGraphDisplay', displayId: 'g-LinearGraphDisplay' }])
})

test('configured displays and other adapters are left alone', () => {
  const chosen = {
    type: 'FeatureTrack',
    trackId: 'g',
    adapter,
    displays: [{ type: 'LinearBasicDisplay' }],
  }
  const bed = {
    type: 'FeatureTrack',
    trackId: 'b',
    adapter: { type: 'BedAdapter' },
  }
  expect(withGraphDisplayFirst(chosen)).toBe(chosen)
  expect(withGraphDisplayFirst(bed)).toBe(bed)
})

test('a segments BED guesses the rGFA adapter, anything else defers', () => {
  const pm = new PluginManager()
  GraphTrackDefaultsF(pm)
  const guess = pm.evaluateExtensionPoint(
    'Core-guessAdapterForLocation',
    () => ({ type: 'Fallback' }),
  )
  const segs = {
    uri: 'https://example.com/hprc.segs.bed.gz',
    locationType: 'UriLocation' as const,
  }
  expect(guess(segs)).toMatchObject({
    type: 'RgfaTabixAdapter',
    linksLocation: { uri: 'https://example.com/hprc.links.bed.gz' },
  })
  expect(guess({ ...segs, uri: 'x.bed.gz' })).toEqual({ type: 'Fallback' })
  expect(guess(segs, undefined, 'BedTabixAdapter')).toEqual({
    type: 'Fallback',
  })
})
