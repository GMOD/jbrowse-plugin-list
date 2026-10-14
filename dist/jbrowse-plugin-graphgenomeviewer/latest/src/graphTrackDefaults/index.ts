import { buildAdapterConfig } from '../GraphAddTrackWorkflow/buildTrackConfig'
import { isSegmentsLocation } from '../GraphAddTrackWorkflow/graphManifest'
import { locationName } from '../locationName'
import { LANE_ADAPTERS } from '../panSNAliases/trackAdapterConfig'

import type { GraphFileChoice } from '../GraphAddTrackWorkflow/buildTrackConfig'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util'
import type {
  AdapterGuesser,
  TrackTypeGuesser,
} from '@jbrowse/core/util/tracks'

type TrackConfigSnapshot = Record<string, unknown>

const GRAPH_ADAPTERS = new Set(['RgfaTabixAdapter', 'GbzBaseSyntenyAdapter'])

export function isGbzLocation(loc: FileLocation) {
  return locationName(loc).toLowerCase().endsWith('.gbz.db')
}

// A lanes adapter cuts on the first assembly it names. A track added through
// Add track names that assembly on the track alone.
export function withLaneAnchor(snap: TrackConfigSnapshot) {
  const adapter = snap.adapter as
    { type?: string; assemblyNames?: unknown[] } | undefined
  return adapter?.type !== undefined &&
    LANE_ADAPTERS.has(adapter.type) &&
    !adapter.assemblyNames?.length &&
    Array.isArray(snap.assemblyNames) &&
    snap.assemblyNames.length > 0
    ? { ...snap, adapter: { ...adapter, assemblyNames: snap.assemblyNames } }
    : snap
}

export function guessGraphAdapter(
  file: FileLocation,
  index?: FileLocation,
  adapterHint?: string,
) {
  const guess = (choice: GraphFileChoice) =>
    buildAdapterConfig({
      choice,
      loc: file,
      indexLoc: index,
      assembly: '',
      sample: '',
    })
  if (
    (!adapterHint || adapterHint === 'GbzBaseSyntenyAdapter') &&
    isGbzLocation(file)
  ) {
    return guess('GbzBaseSyntenyAdapter')
  }
  if (
    (!adapterHint || adapterHint === 'RgfaTabixAdapter') &&
    isSegmentsLocation(file)
  ) {
    return guess('RgfaTabixAdapter')
  }
  return undefined
}

export default function GraphTrackDefaultsF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-preProcessTrackConfig',
    withLaneAnchor,
  )
  pluginManager.addToExtensionPoint(
    'Core-guessAdapterForLocation',
    (next: AdapterGuesser): AdapterGuesser =>
      (file, index, adapterHint) =>
        guessGraphAdapter(file, index, adapterHint) ??
        next(file, index, adapterHint),
  )
  pluginManager.addToExtensionPoint(
    'Core-guessTrackTypeForLocation',
    (next: TrackTypeGuesser): TrackTypeGuesser =>
      (adapterName, file) =>
        GRAPH_ADAPTERS.has(adapterName)
          ? 'GraphTrack'
          : next(adapterName, file),
  )
}
