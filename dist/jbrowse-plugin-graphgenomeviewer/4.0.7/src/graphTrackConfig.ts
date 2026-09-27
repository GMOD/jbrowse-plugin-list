import { readConfObject } from '@jbrowse/core/configuration'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
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
