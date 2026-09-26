import { readConfObject } from '@jbrowse/core/configuration'
import { getTrackName } from '@jbrowse/core/util/tracks'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'

export interface SubgraphTrack {
  trackId: string
  name: string
  // The assembly a cut has to be on; see graphReferenceAssembly.
  referenceAssembly: string | undefined
  // The lanes the cut is for; undefined is every haplotype.
  haplotypes: string[] | undefined
}

export interface TrackScanSession {
  tracks: AnyConfigurationModel[]
  assemblies: AnyConfigurationModel[]
}

// The linear view a launch is offered from, as far as the lanes go.
export interface LaunchingView {
  tracks: readonly {
    configuration: AnyConfigurationModel
    displays: readonly unknown[]
  }[]
}

interface LaneSelectingDisplay {
  laneSelection: readonly string[] | undefined
  hiddenLanes: readonly string[]
}

// Whether an adapter declares it can cut a local subgraph. Discovery is by
// declared capability, not adapter name: the old launcher hardcoded
// `GfaTabixAdapter`/`GfaServerAdapter`, which is exactly what left it dead when
// those were removed.
//
// `getAdapterType` throws for a type that was never registered, and a session
// can hold tracks whose plugin isn't loaded, so registration is checked first —
// a session-wide scan reaches tracks a single display's menu never would.
export function adapterCanCutSubgraph(
  pluginManager: PluginManager,
  adapterType: unknown,
) {
  return (
    typeof adapterType === 'string' &&
    pluginManager.adapterTypes.has(adapterType) &&
    pluginManager
      .getAdapterType(adapterType)
      .adapterCapabilities.includes('getSubgraph')
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isLaneSelecting(display: unknown): display is LaneSelectingDisplay {
  return (
    typeof display === 'object' &&
    display !== null &&
    'laneSelection' in display &&
    'hiddenLanes' in display
  )
}

// The assemblies the track names after its reference, which is what core's
// MultiWaySyntenyDisplay opens a lane-declaring source on.
export function trackLanes(track: AnyConfigurationModel) {
  const assemblyNames: unknown = readConfObject(track, 'assemblyNames')
  const lanes = isStringArray(assemblyNames) ? assemblyNames.slice(1) : []
  return lanes.length > 0 ? lanes : undefined
}

// A graph is cut on the first assembly its track names, the rule
// GbzBaseSyntenyAdapter states for its anchor. Every other assembly the track
// names holds its sequence as rank>0 alleles off that reference's backbone, so
// a window on one has no reference coordinates to frame the cut by.
export function graphReferenceAssembly(track: AnyConfigurationModel) {
  const assemblyNames: unknown = readConfObject(track, 'assemblyNames')
  return isStringArray(assemblyNames) ? assemblyNames[0] : undefined
}

export function offReferenceProblem(
  referenceAssembly: string | undefined,
  assemblyName: string,
) {
  return referenceAssembly === undefined || referenceAssembly === assemblyName
    ? undefined
    : `The graph is cut on its reference, ${referenceAssembly}: open it from a view of ${referenceAssembly}`
}

// The lanes the track draws in `view`: the ones in force there less any the
// reader hid. A track not on screen there has its own assemblies to go by.
function lanesToCut(
  track: AnyConfigurationModel,
  trackId: string,
  view: LaunchingView | undefined,
) {
  const shown = view?.tracks
    .find(t => readConfObject(t.configuration, 'trackId') === trackId)
    ?.displays.find(isLaneSelecting)
  return shown
    ? shown.laneSelection?.filter(name => !shown.hiddenLanes.includes(name))
    : trackLanes(track)
}

export function subgraphTrack(
  track: AnyConfigurationModel,
  trackId: string,
  session: TrackScanSession,
  view?: LaunchingView,
): SubgraphTrack {
  return {
    trackId,
    name: getTrackName(track, session),
    referenceAssembly: graphReferenceAssembly(track),
    haplotypes: lanesToCut(track, trackId, view),
  }
}

// Tracks anywhere in the session that can cut a subgraph on `assemblyName`, so
// the launch can be offered from a linear view that doesn't have the graph track
// in it. The entry point no longer has to be the graph track's own menu — which
// was the whole problem: a user browsing genes had no way in.
export function subgraphTracks(
  pluginManager: PluginManager,
  session: TrackScanSession,
  assemblyName: string,
  view?: LaunchingView,
) {
  const found: SubgraphTrack[] = []
  for (const track of session.tracks) {
    const assemblyNames: unknown = readConfObject(track, 'assemblyNames')
    const adapter: unknown = readConfObject(track, 'adapter')
    const trackId: unknown = readConfObject(track, 'trackId')
    if (
      Array.isArray(assemblyNames) &&
      assemblyNames.includes(assemblyName) &&
      typeof trackId === 'string' &&
      typeof adapter === 'object' &&
      adapter !== null &&
      'type' in adapter &&
      adapterCanCutSubgraph(pluginManager, adapter.type)
    ) {
      found.push(subgraphTrack(track, trackId, session, view))
    }
  }
  return found
}
