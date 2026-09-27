import { expect, test } from 'vitest'

import { launchTracks } from './launchTracks'

// Plain objects rather than config models: readConfObject returns a non-MST
// object's own fields unchanged, so this exercises the same read path.
function track(props: Record<string, unknown>) {
  return props as never
}

const TRACKS = [
  track({
    type: 'FeatureTrack',
    trackId: 'K12_genes',
    assemblyNames: ['K12'],
  }),
  track({
    type: 'FeatureTrack',
    trackId: 'CFT073_genes',
    assemblyNames: ['CFT073'],
  }),
  track({
    type: 'FeatureTrack',
    trackId: 'ecoli_minigraph_segments',
    assemblyNames: ['K12'],
  }),
  track({
    type: 'SyntenyTrack',
    trackId: 'ecoli_pggb_ava',
    assemblyNames: ['K12', 'CFT073'],
  }),
  track({
    type: 'AlignmentsTrack',
    trackId: 'K12_reads',
    assemblyNames: ['K12'],
  }),
]

const session = { tracks: TRACKS, assemblies: [] }

// The bug this exists for: the graph's own track is configured for the
// reference alone, so a per-strain launch carrying only that landed on
// `No tracks active`.
test("a non-reference launch gets that strain's own annotation", () => {
  expect(launchTracks({ session, assemblyName: 'CFT073' })).toEqual([
    'CFT073_genes',
  ])
})

test("the graph's own track leads a launch on the reference", () => {
  expect(
    launchTracks({
      session,
      assemblyName: 'K12',
      first: 'ecoli_minigraph_segments',
    }),
  ).toEqual(['ecoli_minigraph_segments', 'K12_genes'])
})

// A launch is a jump to a locus, not a session restore: an alignments track
// turned on behind the user fetches data nobody asked for, and a synteny track
// is what the launch beside this one opens as a view of its own.
test('only annotation tracks are carried', () => {
  expect(launchTracks({ session, assemblyName: 'K12' })).toEqual([
    'K12_genes',
    'ecoli_minigraph_segments',
  ])
})

test('an assembly the session has no annotation for gets none', () => {
  expect(launchTracks({ session, assemblyName: 'IAI39' })).toEqual([])
})
