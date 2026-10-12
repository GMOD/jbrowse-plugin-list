import { lazy } from 'react'

import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

import { configSchemaFactory } from './configSchema'
import { stateModelFactory } from './model'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function LinearGraphDisplayF(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory()
    return Object.assign(
      new DisplayType({
        name: 'LinearGraphDisplay',
        displayName: 'Graph',
        configSchema,
        stateModel: stateModelFactory(configSchema),
        // FeatureTrack and SyntenyTrack for the configs and share links that
        // name the graph display on one, which 4.0.7 and before required
        trackType: ['GraphTrack', 'FeatureTrack', 'SyntenyTrack'],
        viewType: 'LinearGenomeView',
        ReactComponent: lazy(() => import('./components/LinearGraphDisplay')),
      }),
      { adapterCapabilities: ['getSubgraph'] },
    )
  })
}
