import { initKeys } from '../TViewPanel/init'

import type { TviewInit } from '../TViewPanel/init'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

/**
 * `LaunchView-TView`, so a session spec URL can open one.
 *
 * The two ways of writing a view are not the same shape, and JBrowse's spec
 * loader says so out loud: a spec view is **flat arguments** to this launcher,
 * while a config or defaultSession view is MST state, where anything needing
 * resolution on load lives under the view's own `init`. So the spec
 *
 *     { type: 'TView', assembly: 'hg19', loc: 'chrX:1..2', tracks: ['HG002'] }
 *
 * and the config
 *
 *     { type: 'TView', init: { assembly: 'hg19', loc: '…', tracks: […] } }
 *
 * are the same view, and this is the one line between them. Splitting on
 * `initKeys` rather than listing the pass-through props means every react-msaview
 * view prop — colWidth, rowHeight, colorSchemeName, the ones added next — rides
 * along without being enumerated here.
 */
export type LaunchTViewArgs = { session: AbstractSessionModel } & Record<
  string,
  unknown
>

export default function LaunchTViewF(pluginManager: PluginManager) {
  /** #extensionPoint LaunchView-TView | async | Programmatically launch a tview */
  pluginManager.addToExtensionPoint(
    'LaunchView-TView',
    (args: LaunchTViewArgs) => {
      const { session, ...spec } = args
      const init: Record<string, unknown> = {}
      const viewProps: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(spec)) {
        ;(initKeys.has(key) ? init : viewProps)[key] = value
      }
      session.addView('TView', {
        type: 'TView',
        ...viewProps,
        init: init as unknown as TviewInit,
      })
      return args
    },
  )
}
