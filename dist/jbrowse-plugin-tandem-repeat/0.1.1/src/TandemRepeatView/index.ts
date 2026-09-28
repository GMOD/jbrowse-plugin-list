import { lazy } from 'react'

import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'

import stateModelFactory from './model'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function TandemRepeatViewF(pluginManager: PluginManager) {
  pluginManager.addViewType(
    () =>
      new ViewType({
        name: 'TandemRepeatView',
        displayName: 'Tandem repeat view',
        stateModel: stateModelFactory(),
        ReactComponent: lazy(() => import('./components/TandemRepeatView')),
      }),
  )
}
