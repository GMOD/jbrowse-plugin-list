import { getConf, readConfObject } from '@jbrowse/core/configuration'
import { getRpcSessionId } from '@jbrowse/core/util/tracks'

import { planTviewMsa } from './tview'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type {
  AbstractSessionModel,
  AbstractTrackModel,
  Feature,
} from '@jbrowse/core/util'

/** the RPC needs assemblyName to resolve refNameAliases for the file */
export interface FetchRegion {
  assemblyName: string
  refName: string
  start: number
  end: number
}

/** what CoreGetFeatures needs, reachable from a live track or from its config */
export interface TviewSource {
  adapterConfig: unknown
  rpcSessionId: string
}

export function sourceFromTrack(track: AbstractTrackModel): TviewSource {
  return {
    adapterConfig: getConf(track, 'adapter'),
    rpcSessionId: getRpcSessionId(track),
  }
}

/**
 * The trackId -> config index, whose shape has changed across hosts still in
 * the wild: v4.0.0 exposes a `tracksById` getter, v4.1-v4.3 a `getTracksById()`
 * method, and newer cores a per-id reactive `getTrackById(id)` (with
 * `getTracksById()` kept but deprecated). All three resolve connection and
 * assembly-sequence tracks; the `tracks` scan is a last resort because it does
 * not, and it subscribes the caller to every track.
 */
export interface SessionTrackLookup {
  tracks: AnyConfigurationModel[]
  getTrackById?: (id: string) => AnyConfigurationModel | undefined
  getTracksById?: () => Record<string, AnyConfigurationModel>
  tracksById?: Record<string, AnyConfigurationModel>
}

export function findTrackConf(session: SessionTrackLookup, trackId: string) {
  return session.getTrackById
    ? session.getTrackById(trackId)
    : session.getTracksById
      ? session.getTracksById()[trackId]
      : session.tracksById
        ? session.tracksById[trackId]
        : session.tracks.find(t => readConfObject(t, 'trackId') === trackId)
}

/**
 * A rebuild runs from the track's config rather than a track model, so it works
 * whether or not the track is still open anywhere in the session.
 */
export function sourceFromConfig(conf: AnyConfigurationModel): TviewSource {
  return {
    adapterConfig: readConfObject(conf, 'adapter'),
    rpcSessionId: `tview-${readConfObject(conf, 'trackId')}`,
  }
}

export async function fetchTviewPlan({
  session,
  source,
  region,
}: {
  session: AbstractSessionModel
  source: TviewSource
  region: FetchRegion
}) {
  const { adapterConfig, rpcSessionId } = source
  const feats = (await session.rpcManager.call(
    rpcSessionId,
    'CoreGetFeatures',
    {
      adapterConfig,
      sessionId: rpcSessionId,
      regions: [region],
    },
  )) as Feature[]
  const features = feats.filter(f => !!f.get('seq'))
  // only planned, not rendered: a caller may cancel, or find it too large
  return {
    plan: planTviewMsa({ features, ...region }),
    rowCount: features.length,
  }
}
