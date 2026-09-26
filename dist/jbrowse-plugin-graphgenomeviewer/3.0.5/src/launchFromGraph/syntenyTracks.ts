import { readConfObject } from '@jbrowse/core/configuration'
import { getTrackName } from '@jbrowse/core/util/tracks'

import type { TrackScanSession } from '../launchSubgraph/subgraphTracks'

export interface LaunchableSyntenyTrack {
  trackId: string
  name: string
  // how many of the requested assemblies this track covers, so a whole-set
  // all-vs-all sorts above a pairwise alignment covering two of them
  coverage: number
}

const SYNTENY_TRACK_TYPE = 'SyntenyTrack'

// Synteny datasets in the session that align at least two of `assemblyNames`.
//
// Track type rather than adapter name: SyntenyTrack is the core track type every
// synteny adapter is configured under, so this does not go stale when an adapter
// is added or renamed the way naming PAF adapters would.
//
// Two is the floor because that is the floor for a synteny view; more is better,
// and an all-vs-all covering every contributing assembly is what makes the
// multi-panel launch worth offering at all.
export function launchableSyntenyTracks(
  session: TrackScanSession,
  assemblyNames: string[],
) {
  const wanted = new Set(assemblyNames)
  const found: LaunchableSyntenyTrack[] = []
  for (const track of session.tracks) {
    const type: unknown = readConfObject(track, 'type')
    const trackAssemblies: unknown = readConfObject(track, 'assemblyNames')
    const trackId: unknown = readConfObject(track, 'trackId')
    if (
      type === SYNTENY_TRACK_TYPE &&
      typeof trackId === 'string' &&
      Array.isArray(trackAssemblies)
    ) {
      const coverage = trackAssemblies.filter(name => wanted.has(name)).length
      if (coverage >= 2) {
        found.push({ trackId, name: getTrackName(track, session), coverage })
      }
    }
  }
  return found.sort((a, b) => b.coverage - a.coverage)
}
