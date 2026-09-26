import { lazy } from 'react'

import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

import { configSchemaFactory } from './configSchema'
import { stateModelFactory } from './model'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function LinearGraphDisplayF(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory()
    return new DisplayType({
      name: 'LinearGraphDisplay',
      displayName: 'Graph',
      configSchema,
      stateModel: stateModelFactory(configSchema),
      trackType: ['FeatureTrack', 'SyntenyTrack'],
      viewType: 'LinearGenomeView',
      ReactComponent: lazy(() => import('./components/LinearGraphDisplay')),
    })
  })
}
