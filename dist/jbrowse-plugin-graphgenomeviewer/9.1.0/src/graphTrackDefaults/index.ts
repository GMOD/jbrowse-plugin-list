import { guessGraphAdapter } from './guessAdapter'
import { walkIndexed } from '../graphTrackConfig'
import { isRecord } from '../isRecord'
import { WALKS_SUFFIX, splitUri, walkFileSample } from '../locationName'
import { LANE_ADAPTERS } from '../panSNAliases/trackAdapterConfig'

import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  AdapterGuesser,
  TrackTypeGuesser,
} from '@jbrowse/core/util/tracks'

type TrackConfigSnapshot = Record<string, unknown>

const GRAPH_ADAPTERS = new Set([
  'RgfaTabixAdapter',
  'GbzBaseSyntenyAdapter',
  'WalkTabixSyntenyAdapter',
])

// A lanes adapter cuts on the first assembly it names. A track added through
// Open track names that assembly on the track alone.
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

// The walk file a config snapshot names, by the `walksUri` shorthand or the
// location it expands to
function walkFileName({ walksUri, walksLocation }: Record<string, unknown>) {
  const { uri, localPath, name } = isRecord(walksLocation) ? walksLocation : {}
  return typeof walksUri === 'string' && walksUri !== ''
    ? `${walksUri}${WALKS_SUFFIX}`
    : typeof uri === 'string'
      ? splitUri(uri).name
      : typeof localPath === 'string'
        ? localPath
        : typeof name === 'string'
          ? name
          : undefined
}

// A walk file opened with no PanSN map reads as the sample its name gives, on
// the track's assembly; a guessed adapter had no assembly to key that by
export function withWalkReference(snap: TrackConfigSnapshot) {
  const adapter = isRecord(snap.adapter) ? snap.adapter : undefined
  const [assembly] = Array.isArray(snap.assemblyNames)
    ? (snap.assemblyNames as string[])
    : []
  const file =
    adapter && walkIndexed(adapter) ? walkFileName(adapter) : undefined
  const sample = file ? walkFileSample(file) : undefined
  return adapter &&
    assembly &&
    sample &&
    sample !== assembly &&
    adapter.assemblyNameToPanSN === undefined
    ? {
        ...snap,
        adapter: { ...adapter, assemblyNameToPanSN: { [assembly]: sample } },
      }
    : snap
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
          : adapterName === 'MinigraphBubbleAdapter'
            ? 'FeatureTrack'
            : next(adapterName, file),
  )
}
