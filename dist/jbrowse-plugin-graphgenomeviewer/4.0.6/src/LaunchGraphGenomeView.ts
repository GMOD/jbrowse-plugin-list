import type modelFactory from './GraphGenomeView/model'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'
import type { SnapshotIn } from '@jbrowse/mobx-state-tree'

// GraphGenomeView has no assembly/track resolution — every field is a plain
// persisted view prop, so the launch spec forwards straight onto the view
// snapshot. `afterAttach` loads `gfaLocation`, or refetches the
// `loadedTrackId`/`loadedRegion` pair, once the view is created.
//
// **Taken off the model rather than listed by hand**, which is the whole point.
// This named four props (`gfaLocation`, `colorScheme`, `linearLayout`,
// `drawPaths`) while the extension point spreads whatever it is handed — so the
// runtime accepted every prop and the DECLARED contract accepted a third of
// them. The docs' own figure specs launch with thirteen: `loadedTrackId`,
// `loadedRegion`, `layoutMode`, `colorDomain`, `paneHeight`, `referencePath`,
// `layoutQuality`, `maxRegionBp` and `bubbleSpread` among them, none of which
// this said were allowed. It carries a `#extensionPoint` tag, so the published
// API docs said so too.
//
// Derived, so adding a view prop widens the launch with it. `type` is the
// dispatch key rather than a setting — loadSessionSpec strips it before calling
// this — and is the one field a caller may not supply.
export type LaunchGraphGenomeViewArgs = Partial<
  Omit<SnapshotIn<ReturnType<typeof modelFactory>>, 'type'>
> & {
  session: AbstractSessionModel
}

declare module '@jbrowse/core/PluginManager' {
  interface ExtensionPointRegistry {
    'LaunchView-GraphGenomeView': {
      args: LaunchGraphGenomeViewArgs
      result: LaunchGraphGenomeViewArgs
    }
  }
}

export default function LaunchGraphGenomeViewF(pluginManager: PluginManager) {
  /** #extensionPoint LaunchView-GraphGenomeView | async | Programmatically launch a graph genome view */
  pluginManager.addToExtensionPoint('LaunchView-GraphGenomeView', args => {
    const { session, ...spec } = args
    session.addView('GraphGenomeView', spec)
    return args
  })
}
