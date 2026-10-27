import { getTrackName, toTrackConfigEntry } from '@jbrowse/core/util/tracks'

import { trackAssemblies } from './launchFromGraph'

import type { TrackScanSession } from './launchFromGraph'
import type { AnyTrackConfig } from '@jbrowse/core/configuration'

export interface LaunchableSyntenyTrack {
  trackId: string
  name: string
  // how many of the requested assemblies this track covers, so a whole-set
  // all-vs-all sorts above a pairwise alignment covering two of them
  coverage: number
}

const SYNTENY_TRACK_TYPE = 'SyntenyTrack'
const SYNTENY_ADAPTER_CATEGORY = 'Synteny adapters'

export interface AdapterCategories {
  hasAdapterType: (name: string) => boolean
  getAdapterType: (name: string) => {
    adapterMetadata?: { category?: string }
  }
}

// A SyntenyTrack, or any track reading a synteny adapter (a GraphTrack over a
// gbz-base database). Core's isSyntenyTrack makes the same test.
function isSyntenyTrack(track: AnyTrackConfig, adapters: AdapterCategories) {
  const { type, adapter } = toTrackConfigEntry(track)
  if (type === SYNTENY_TRACK_TYPE) {
    return true
  }
  const adapterType: unknown = (adapter as { type?: unknown } | undefined)?.type
  return (
    typeof adapterType === 'string' &&
    adapters.hasAdapterType(adapterType) &&
    adapters.getAdapterType(adapterType).adapterMetadata?.category ===
      SYNTENY_ADAPTER_CATEGORY
  )
}

// Synteny datasets in the session that align at least two of `assemblyNames`.
//
// Two is the floor because that is the floor for a synteny view; more is better,
// and an all-vs-all covering every contributing assembly is what makes the
// multi-panel launch worth offering at all.
export function launchableSyntenyTracks(
  session: TrackScanSession,
  assemblyNames: string[],
  adapters: AdapterCategories,
) {
  const wanted = new Set(assemblyNames)
  const found: LaunchableSyntenyTrack[] = []
  for (const track of session.tracks) {
    const { trackId } = track
    if (isSyntenyTrack(track, adapters)) {
      const coverage = trackAssemblies(session, track).filter(name =>
        wanted.has(name),
      ).length
      if (coverage >= 2) {
        found.push({ trackId, name: getTrackName(track, session), coverage })
      }
    }
  }
  return found.sort((a, b) => b.coverage - a.coverage)
}
