import React from 'react'

import HighlightComponents from './HighlightComponents'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export default function AddHighlightModelF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    // @ts-expect-error v4 hosts have no contributeToExtensionPoint
    'LinearGenomeView-TracksContainerComponent',
    // v4 hosts seed this point with undefined rather than []
    (
      rest: React.ReactNode[] | undefined,
      { model }: { model: LinearGenomeViewModel },
    ) => {
      return [
        ...(rest ?? []),
        <HighlightComponents
          key="highlight_protein_viewer_protein3d"
          model={model}
        />,
      ]
    },
  )
}
