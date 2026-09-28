import { readConfObject } from '@jbrowse/core/configuration'
import { getTrackName } from '@jbrowse/core/util/tracks'
import { getEnv, isStateTreeNode } from '@jbrowse/mobx-state-tree'

import type { TrackScanSession } from './launchFromGraph'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'

export interface LaunchableSyntenyTrack {
  trackId: string
  name: string
  // how many of the requested assemblies this track covers, so a whole-set
  // all-vs-all sorts above a pairwise alignment covering two of them
  coverage: number
}

const SYNTENY_TRACK_TYPE = 'SyntenyTrack'
const SYNTENY_ADAPTER_CATEGORY = 'Synteny adapters'

// A SyntenyTrack, or any track reading a synteny adapter (a GraphTrack over a
// gbz-base database). Core's isSyntenyTrack makes the same test on newer hosts.
function isSyntenyTrack(track: AnyConfigurationModel) {
  if (readConfObject(track, 'type') === SYNTENY_TRACK_TYPE) {
    return true
  }
  const adapterType: unknown = track.adapter?.type
  if (typeof adapterType !== 'string' || !isStateTreeNode(track)) {
    return false
  }
  const { pluginManager } = getEnv<{ pluginManager?: PluginManager }>(track)
  return (
    !!pluginManager?.hasAdapterType(adapterType) &&
    pluginManager.getAdapterType(adapterType).adapterMetadata?.category ===
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
) {
  const wanted = new Set(assemblyNames)
  const found: LaunchableSyntenyTrack[] = []
  for (const track of session.tracks) {
    const trackAssemblies: unknown = readConfObject(track, 'assemblyNames')
    const trackId: unknown = readConfObject(track, 'trackId')
    if (
      isSyntenyTrack(track) &&
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
