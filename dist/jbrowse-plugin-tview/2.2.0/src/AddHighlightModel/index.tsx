import React from 'react'

import { getSession } from '@jbrowse/core/util'

import HighlightComponents from './HighlightComponents'
import { isTView } from '../TViewPanel/model'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export default function AddHighlightComponentsModelF(
  pluginManager: PluginManager,
) {
  pluginManager.addToExtensionPoint(
    'LinearGenomeView-TracksContainerComponent',
    // @ts-expect-error
    (rest: React.ReactNode[], { model }: { model: LinearGenomeViewModel }) => {
      // skip entirely unless a TView is connected to this genome view
      const { views } = getSession(model)
      return views.some(v => isTView(v) && v.connectedViewId === model.id)
        ? [
            ...rest,
            <HighlightComponents key="tview_highlights" model={model} />,
          ]
        : rest
    },
  )
}
