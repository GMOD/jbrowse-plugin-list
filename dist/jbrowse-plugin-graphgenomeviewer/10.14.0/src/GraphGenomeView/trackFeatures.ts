import type { Feature } from '@jbrowse/core/util'

export type FeatureLike = Feature | Record<string, unknown>

export function ownField(f: FeatureLike, name: string): unknown {
  return typeof (f as Feature).get === 'function'
    ? (f as Feature).get(name)
    : (f as Record<string, unknown>)[name]
}

export interface TrackChoice {
  trackId: string
  name?: string
  adapterType: string
}

export function namedTrack<T extends TrackChoice>(tracks: T[], named: string) {
  return tracks.find(t => t.trackId === named)
}

// what a track-name hint such as /repeat|tandem/ is matched against
export function trackLabel(t: TrackChoice) {
  return `${t.trackId} ${t.name ?? ''}`
}
