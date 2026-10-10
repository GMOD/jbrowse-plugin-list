import { DisplayType } from '@jbrowse/core/pluggableElementTypes'

import { trackAdapterConfig } from './trackAdapterConfig'
import { SYNTENY_DISPLAYS } from '../GraphTrack/index'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

// Core's synteny displays send `adapterConfig` with every request, the lane
// listing's included, so overriding the getter reaches them all
function withTrackAdapterConfig(model: IAnyModelType) {
  return model.views(self => ({
    get adapterConfig(): Record<string, unknown> {
      return trackAdapterConfig(self, self.parentTrack.configuration)
    },
  }))
}

export default function PanSNAliasesF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint('Core-extendPluggableElement', element => {
    if (
      element instanceof DisplayType &&
      SYNTENY_DISPLAYS.includes(element.name)
    ) {
      element.extendStateModel(withTrackAdapterConfig)
    }
    return element
  })
}
