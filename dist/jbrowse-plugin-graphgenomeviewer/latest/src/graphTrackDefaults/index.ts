import {
  buildAdapterConfig,
  isSegmentsLocation,
} from '../GraphAddTrackWorkflow/buildTrackConfig'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AdapterGuesser } from '@jbrowse/core/util/tracks'

interface TrackConfigSnapshot {
  displays?: { type?: string; [key: string]: unknown }[]
  [key: string]: unknown
}

export function withGraphDisplayFirst(snap: TrackConfigSnapshot) {
  const adapter = snap.adapter as { type?: string } | undefined
  return adapter?.type === 'RgfaTabixAdapter' &&
    snap.type === 'FeatureTrack' &&
    !snap.displays?.length
    ? {
        ...snap,
        displays: [
          {
            type: 'LinearGraphDisplay',
            displayId: `${snap.trackId}-LinearGraphDisplay`,
          },
        ],
      }
    : snap
}

export default function GraphTrackDefaultsF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-preProcessTrackConfig',
    withGraphDisplayFirst,
  )
  pluginManager.addToExtensionPoint(
    'Core-guessAdapterForLocation',
    (next: AdapterGuesser): AdapterGuesser =>
      (file, index, adapterHint) =>
        (!adapterHint || adapterHint === 'RgfaTabixAdapter') &&
        isSegmentsLocation(file)
          ? buildAdapterConfig({
              choice: 'RgfaTabixAdapter',
              loc: file,
              indexLoc: index,
              assembly: '',
              sample: '',
            })
          : next(file, index, adapterHint),
  )
}
