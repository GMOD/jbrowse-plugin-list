import { lazy } from 'react'

import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { defineLaunchKeys } from '@jbrowse/core/util/withLaunchInput'

import modelFactory from './viewModel'

import type PluginManager from '@jbrowse/core/PluginManager'

// No launch keys, declared so `loadSessionSpec` reports a spec's unknown keys
// instead of dropping them silently.
const graphLaunchKeys = defineLaunchKeys<object>()({})

export default function GraphGenomeViewF(pluginManager: PluginManager) {
  pluginManager.addViewType(() => {
    return new ViewType({
      name: 'GraphGenomeView',
      displayName: 'Graph genome view',
      stateModel: modelFactory(),
      launchKeys: graphLaunchKeys,
      ReactComponent: lazy(() => import('./components/GraphGenomeView')),
    })
  })
}
