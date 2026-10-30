import { lazy } from 'react'

import { AddTrackWorkflowType } from '@jbrowse/core/pluggableElementTypes'
import { types } from '@jbrowse/mobx-state-tree'

import type PluginManager from '@jbrowse/core/PluginManager'

const GraphAddTrackWidget = lazy(() => import('./AddTrackWorkflow'))

export default function GraphAddTrackWorkflowF(pluginManager: PluginManager) {
  pluginManager.addAddTrackWorkflowType(
    () =>
      new AddTrackWorkflowType({
        name: 'Pangenome graph track',
        displayName: 'Add pangenome graph track',
        ReactComponent: GraphAddTrackWidget,
        stateModel: types.model({}),
      }),
  )
}
