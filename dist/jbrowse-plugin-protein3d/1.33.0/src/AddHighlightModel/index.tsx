import { addExtensionElement } from '@jbrowse/core/ui'

import HighlightComponents from './HighlightComponents'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function AddHighlightModelF(pluginManager: PluginManager) {
  addExtensionElement(
    pluginManager,
    'LinearGenomeView-TracksContainerComponent',
    HighlightComponents,
  )
}
