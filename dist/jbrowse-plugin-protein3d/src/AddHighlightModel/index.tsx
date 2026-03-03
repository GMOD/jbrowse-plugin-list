import React from 'react'

import PluginManager from '@jbrowse/core/PluginManager'

import HighlightComponents from './HighlightComponents'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export default function AddHighlightModelF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'LinearGenomeView-TracksContainerComponent',
    // @ts-expect-error
    (rest: React.ReactNode[], { model }: { model: LinearGenomeViewModel }) => {
      return [
        ...rest,
        <HighlightComponents
          key="highlight_protein_viewer_protein3d"
          model={model}
        />,
      ]
    },
  )
}
