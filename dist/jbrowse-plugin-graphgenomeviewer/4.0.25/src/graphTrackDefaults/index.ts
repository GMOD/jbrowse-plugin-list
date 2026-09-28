import {
  buildAdapterConfig,
  isSegmentsLocation,
  splitUri,
} from '../GraphAddTrackWorkflow/buildTrackConfig'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util'
import type {
  AdapterGuesser,
  TrackTypeGuesser,
} from '@jbrowse/core/util/tracks'

interface TrackConfigSnapshot {
  displays?: { type?: string; [key: string]: unknown }[]
  [key: string]: unknown
}

const GRAPH_ADAPTERS = new Set(['RgfaTabixAdapter', 'GbzBaseSyntenyAdapter'])

function locationName(loc: FileLocation) {
  return 'uri' in loc
    ? splitUri(loc.uri).name
    : 'localPath' in loc
      ? loc.localPath
      : loc.name
}

export function isGbzLocation(loc: FileLocation) {
  return locationName(loc).toLowerCase().endsWith('.gbz.db')
}

// A gbz-base adapter cuts on the first assembly it names. A track added
// through Add track names that assembly on the track alone.
export function withGbzAnchor(snap: TrackConfigSnapshot) {
  const adapter = snap.adapter as
    { type?: string; assemblyNames?: unknown[] } | undefined
  return adapter?.type === 'GbzBaseSyntenyAdapter' &&
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
  if (
    (!adapterHint || adapterHint === 'GbzBaseSyntenyAdapter') &&
    isGbzLocation(file)
  ) {
    return {
      type: 'GbzBaseSyntenyAdapter',
      gbzDbLocation: file,
      ...(index ? { haplotypeIndexLocation: index } : {}),
    }
  }
  if (
    (!adapterHint || adapterHint === 'RgfaTabixAdapter') &&
    isSegmentsLocation(file)
  ) {
    return buildAdapterConfig({
      choice: 'RgfaTabixAdapter',
      loc: file,
      indexLoc: index,
      assembly: '',
      sample: '',
    })
  }
  return undefined
}

export default function GraphTrackDefaultsF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint('Core-preProcessTrackConfig', withGbzAnchor)
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
