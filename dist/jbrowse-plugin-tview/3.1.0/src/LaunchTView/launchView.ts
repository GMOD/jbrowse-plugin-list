import { launchTView } from './launch'

import type { TviewTrackInit } from '../TViewPanel/init'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

/**
 * `LaunchView-TView`, so a session spec URL can open one.
 *
 * A spec view is flat arguments to this launcher, while a config or
 * defaultSession view is MST state with the locus under `init`, so the spec
 *
 *     { type: 'TView', assembly: 'hg19', loc: 'chrX:1..2', tracks: ['HG002'] }
 *
 * and the config
 *
 *     { type: 'TView', init: { assembly: 'hg19', loc: '…', tracks: […] } }
 *
 * are the same view. Every other key is passed through as a view prop.
 */
export type LaunchTViewArgs = { session: AbstractSessionModel } & Record<
  string,
  unknown
>

function isTrackInit(entry: unknown): entry is TviewTrackInit {
  return (
    typeof entry === 'string' ||
    (typeof entry === 'object' &&
      entry !== null &&
      'trackId' in entry &&
      typeof entry.trackId === 'string' &&
      (!('sample' in entry) || typeof entry.sample === 'string'))
  )
}

export default function LaunchTViewF(pluginManager: PluginManager) {
  /** #extensionPoint LaunchView-TView | async | Programmatically launch a tview */
  pluginManager.addToExtensionPoint(
    'LaunchView-TView',
    (args: LaunchTViewArgs) => {
      const { session, assembly, loc, tracks, ...viewProps } = args
      if (
        typeof assembly === 'string' &&
        typeof loc === 'string' &&
        Array.isArray(tracks) &&
        tracks.every(isTrackInit)
      ) {
        launchTView(session, { assembly, loc, tracks }, viewProps)
      } else {
        throw new Error(
          'A TView spec needs an assembly name, a loc string and a tracks array of trackIds',
        )
      }
      return args
    },
  )
}
