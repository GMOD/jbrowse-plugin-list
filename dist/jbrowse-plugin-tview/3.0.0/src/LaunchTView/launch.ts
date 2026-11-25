import { assembleLocString } from '@jbrowse/core/util'

import { checkRegion } from '../TViewPanel/init'

import type { LocAssembly, TviewTrackInit } from '../TViewPanel/init'
import type { AbstractSessionModel } from '@jbrowse/core/util'

export interface WholeBaseRegion {
  assemblyName: string
  refName: string
  start: number
  end: number
}

export interface TrackLike {
  configuration: { trackId: string }
  displays: readonly { type: string }[]
}

export interface GenomeView {
  id: string
  tracks: readonly TrackLike[]
  visibleWholeBaseRegions: WholeBaseRegion[]
}

export interface AssemblySource {
  assemblyManager: {
    get: (name: string) => (LocAssembly & { initialized: boolean }) | undefined
  }
}

export interface TViewLaunch {
  assembly: string
  loc: string
  tracks: TviewTrackInit[]
  connectedViewId?: string
}

export type RegionLaunch =
  { assembly: string; loc: string; reason?: undefined } | { reason: string }

export function isGenomeView(view: object): view is GenomeView {
  return 'visibleWholeBaseRegions' in view && 'tracks' in view
}

export function alignmentsTrackIds(tracks: readonly TrackLike[]) {
  return tracks
    .filter(track =>
      track.displays.some(d => d.type === 'LinearAlignmentsDisplay'),
    )
    .map(track => track.configuration.trackId)
}

/**
 * The locus a tview over `regions` would show, or why there is none. The width
 * and contig rules are {@link checkRegion}'s, so a menu offers exactly what the
 * view would then agree to load.
 */
export function regionLaunch(
  session: AssemblySource,
  regions: readonly WholeBaseRegion[],
): RegionLaunch {
  const [region] = regions
  const assembly = region
    ? session.assemblyManager.get(region.assemblyName)
    : undefined
  const loc = region
    ? assembleLocString({
        refName: region.refName,
        start: region.start,
        end: region.end,
      })
    : ''
  const check = assembly?.initialized ? checkRegion(assembly, loc) : undefined
  return !region
    ? { reason: 'No region is in view' }
    : regions.length > 1
      ? { reason: 'Spans more than one region' }
      : !check
        ? { reason: `Assembly ${region.assemblyName} is not loaded` }
        : check.error !== undefined
          ? { reason: check.error }
          : { assembly: region.assemblyName, loc }
}

export function launchTView(
  session: Pick<AbstractSessionModel, 'addView'>,
  { assembly, loc, tracks, connectedViewId }: TViewLaunch,
  viewProps: Record<string, unknown> = {},
) {
  return session.addView('TView', {
    displayName: loc,
    connectedViewId,
    ...viewProps,
    type: 'TView',
    init: { assembly, loc, tracks },
  })
}
