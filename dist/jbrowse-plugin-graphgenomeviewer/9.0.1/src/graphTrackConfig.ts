import {
  getConfAssemblyNamesOrNone,
  toTrackConfigEntry,
} from '@jbrowse/core/util/tracks'

import { snapshotNamesFile } from './locationName.ts'

import type { AnyTrackConfig } from '@jbrowse/core/configuration'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

// The assemblies the track names after its reference, which is what core's
// MultiWaySyntenyDisplay opens a lane-declaring source on.
export function trackLanes(track: AnyTrackConfig) {
  const lanes = getConfAssemblyNamesOrNone(track).slice(1)
  return lanes.length > 0 ? lanes : undefined
}

// Whether a track names a walk file, by the `walksUri` shorthand as written
// or the location it expands to: an rGFA track may, and a
// WalkTabixSyntenyAdapter one does
export function walkIndexed(adapterConfig: Record<string, unknown>) {
  return (
    adapterConfig.type === 'WalkTabixSyntenyAdapter' ||
    (adapterConfig.type === 'RgfaTabixAdapter' &&
      ((typeof adapterConfig.walksUri === 'string' &&
        adapterConfig.walksUri !== '') ||
        snapshotNamesFile(adapterConfig.walksLocation)))
  )
}

// Whether a track's cut reads `haplotypes`: a GBZ cut does, and so does an
// rGFA one with a walk file
export function cutsByHaplotype(adapterConfig: Record<string, unknown>) {
  return (
    adapterConfig.type === 'GbzBaseSyntenyAdapter' || walkIndexed(adapterConfig)
  )
}

// The haplotypes a walk-indexed track's config names to cut for until the
// user picks others
export function configHaplotypes(adapterConfig: Record<string, unknown>) {
  const { defaultHaplotypes } = adapterConfig
  return walkIndexed(adapterConfig) &&
    isStringArray(defaultHaplotypes) &&
    defaultHaplotypes.length > 0
    ? defaultHaplotypes
    : undefined
}

// A graph is cut on the first assembly its track names, the rule
// GbzBaseSyntenyAdapter states for its anchor. Every other assembly the track
// names holds its sequence as rank>0 alleles off that reference's backbone, so
// a window on one has no reference coordinates to frame the cut by.
export function graphReferenceAssembly(track: AnyTrackConfig) {
  return getConfAssemblyNamesOrNone(track)[0]
}

// A track's adapter config, from a live node or a session's frozen entry
export function trackAdapterSnapshot(track: AnyTrackConfig) {
  return toTrackConfigEntry(track).adapter as Record<string, unknown>
}

export function offReferenceProblem(
  referenceAssembly: string | undefined,
  assemblyName: string,
) {
  return referenceAssembly === undefined || referenceAssembly === assemblyName
    ? undefined
    : `The graph is cut on its reference, ${referenceAssembly}: open it from a view of ${referenceAssembly}`
}
