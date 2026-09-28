import { types } from '@jbrowse/mobx-state-tree'

import { launchableSyntenyTracks } from './syntenyTracks'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'

const CATEGORIES: Record<string, string> = {
  PAFAdapter: 'Synteny adapters',
  GbzBaseSyntenyAdapter: 'Synteny adapters',
  RgfaTabixAdapter: 'Graph adapters',
}

const pluginManager = {
  hasAdapterType: (name: string) => name in CATEGORIES,
  getAdapterType: (name: string) => ({
    adapterMetadata: { category: CATEGORIES[name] },
  }),
}

const TrackConf = types.model({
  trackId: types.string,
  type: types.string,
  assemblyNames: types.array(types.string),
  adapter: types.frozen<{ type: string }>(),
})

const Session = types.model({ tracks: types.array(TrackConf) })

const track = (trackId: string, type: string, adapterType: string) => ({
  trackId,
  type,
  assemblyNames: ['hg38', 'HG002.1'],
  adapter: { type: adapterType },
})

test('offers a SyntenyTrack and a gbz-base GraphTrack, not an rGFA one', () => {
  const session = Session.create(
    {
      tracks: [
        track('paf', 'SyntenyTrack', 'PAFAdapter'),
        track('gbz', 'GraphTrack', 'GbzBaseSyntenyAdapter'),
        track('rgfa', 'GraphTrack', 'RgfaTabixAdapter'),
      ],
    },
    { pluginManager },
  )
  const found = launchableSyntenyTracks(
    {
      tracks: session.tracks as unknown as AnyConfigurationModel[],
      assemblies: [],
    },
    ['hg38', 'HG002.1'],
  )
  expect(found.map(t => t.trackId)).toEqual(['paf', 'gbz'])
})
