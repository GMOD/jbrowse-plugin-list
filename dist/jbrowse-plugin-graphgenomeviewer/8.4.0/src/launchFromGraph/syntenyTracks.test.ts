import { launchableSyntenyTracks } from './syntenyTracks'

const CATEGORIES: Record<string, string> = {
  PAFAdapter: 'Synteny adapters',
  GbzBaseSyntenyAdapter: 'Synteny adapters',
  RgfaTabixAdapter: 'Graph adapters',
}

const adapters = {
  hasAdapterType: (name: string) => name in CATEGORIES,
  getAdapterType: (name: string) => ({
    adapterMetadata: { category: CATEGORIES[name] },
  }),
}

// a session's tracks are frozen entries, as on a 5.0.0-beta.18 host
const track = (trackId: string, type: string, adapterType: string) => ({
  trackId,
  type,
  assemblyNames: ['hg38', 'HG002.1'],
  adapter: { type: adapterType },
})

test('offers a SyntenyTrack and a gbz-base GraphTrack, not an rGFA one', () => {
  const found = launchableSyntenyTracks(
    {
      tracks: [
        track('paf', 'SyntenyTrack', 'PAFAdapter'),
        track('gbz', 'GraphTrack', 'GbzBaseSyntenyAdapter'),
        track('rgfa', 'GraphTrack', 'RgfaTabixAdapter'),
      ],
      assemblies: [],
    },
    ['hg38', 'HG002.1'],
    adapters,
  )
  expect(found.map(t => t.trackId)).toEqual(['paf', 'gbz'])
})

// a track naming an assembly by an alias covers it, the contributors being
// resolved to canonical names
test('a track naming its assemblies by alias covers them', () => {
  const canonical: Record<string, string> = { 'HG002.1': 'hg002_hap1' }
  const found = launchableSyntenyTracks(
    {
      tracks: [track('paf', 'SyntenyTrack', 'PAFAdapter')],
      assemblies: [],
      assemblyManager: {
        has: name => name in canonical || name === 'hg38',
        get: name => ({ name: canonical[name] ?? name }),
      },
    },
    ['hg38', 'hg002_hap1'],
    adapters,
  )
  expect(found).toMatchObject([{ trackId: 'paf', coverage: 2 }])
})
