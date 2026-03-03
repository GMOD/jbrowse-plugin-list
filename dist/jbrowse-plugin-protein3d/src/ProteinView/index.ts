import { lazy } from 'react'

import PluginManager from '@jbrowse/core/PluginManager'
import { ViewType } from '@jbrowse/core/pluggableElementTypes'

import stateModelF from './model'

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
