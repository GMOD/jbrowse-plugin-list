import { lazy } from 'react'

import { ViewType } from '@jbrowse/core/pluggableElementTypes'

import type PluginManager from '@jbrowse/core/PluginManager'

const ReactComponent = lazy(() => import('./components/ProteinView'))

export default function ProteinViewF(pluginManager: PluginManager) {
  pluginManager.addViewType(() => {
    return new ViewType({
      name: 'ProteinView',
      displayName: 'Protein view',
      stateModel: () => import('./model').then(m => m.default()),
      ReactComponent,
    })
  })
}
