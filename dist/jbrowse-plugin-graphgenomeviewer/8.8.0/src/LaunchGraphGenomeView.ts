import type modelFactory from './GraphGenomeView/viewModel'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'
import type { SnapshotIn } from '@jbrowse/mobx-state-tree'

// Every view prop, taken off the model so a new prop widens the launch with
// it; `type` is the dispatch key, not a setting.
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
