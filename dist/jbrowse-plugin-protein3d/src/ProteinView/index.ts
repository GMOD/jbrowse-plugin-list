import { lazy } from 'react'

import { ViewType } from '@jbrowse/core/pluggableElementTypes'

import stateModelF from './model'

import type PluginManager from '@jbrowse/core/PluginManager'

const ReactComponent = lazy(() => import('./components/ProteinView'))

export default function ProteinViewF(pluginManager: PluginManager) {
  pluginManager.addViewType(() => {
    return new ViewType({
      name: 'ProteinView',
      displayName: 'Protein view',
      stateModel: stateModelF(),
      ReactComponent,
    })
  })
}
