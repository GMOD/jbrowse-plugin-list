import { lazy } from 'react'

import { AddTrackWorkflowType } from '@jbrowse/core/pluggableElementTypes'
import { types } from '@jbrowse/mobx-state-tree'

import type PluginManager from '@jbrowse/core/PluginManager'

const GraphAddTrackWidget = lazy(() => import('./AddTrackWorkflow'))

// Open track cannot replace this form: only the form reads
// `<prefix>.graph.json`, the coarse tier and the reference's PanSN sample, and
// gfa-to-tabix build's config.json writes bare relative uris a hosted session
// cannot load (9316630 restored the form 777e7c0 deleted)
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
