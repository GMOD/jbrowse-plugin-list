import { buildAdapterConfig } from '../GraphAddTrackWorkflow/buildTrackConfig'
import { isGraphIndexLocation } from '../GraphAddTrackWorkflow/graphManifest'
import {
  WALKS_SUFFIX,
  locationName,
  readsSiblings,
  walkFileSample,
} from '../locationName'
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

// A walk file opened with no PanSN map reads as the sample its name gives, on
// the track's assembly; a guessed adapter had no assembly to key that by
export function withWalkReference(snap: TrackConfigSnapshot) {
  const adapter = snap.adapter as
    | {
        type?: string
        walksLocation?: FileLocation
        assemblyNameToPanSN?: unknown
      }
    | undefined
  const [assembly] = Array.isArray(snap.assemblyNames)
    ? (snap.assemblyNames as string[])
    : []
  const sample =
    adapter?.type === 'RgfaTabixAdapter' && adapter.walksLocation
      ? walkFileSample(adapter.walksLocation)
      : undefined
  return assembly &&
    sample &&
    sample !== assembly &&
    adapter?.assemblyNameToPanSN === undefined
    ? {
        ...snap,
        adapter: { ...adapter, assemblyNameToPanSN: { [assembly]: sample } },
      }
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
  if (!adapterHint || adapterHint === 'RgfaTabixAdapter') {
    if (isGraphIndexLocation(file)) {
      return guess('RgfaTabixAdapter')
    }
    // a file picked in the browser has no index beside it to assume
    if (
      locationName(file).endsWith(WALKS_SUFFIX) &&
      (index !== undefined || readsSiblings(file))
    ) {
      return guess('RgfaTabixWalks')
    }
  }
  return undefined
}

export default function GraphTrackDefaultsF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-preProcessTrackConfig',
    withLaneAnchor,
  )
  pluginManager.addToExtensionPoint(
    'Core-preProcessTrackConfig',
    withWalkReference,
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
