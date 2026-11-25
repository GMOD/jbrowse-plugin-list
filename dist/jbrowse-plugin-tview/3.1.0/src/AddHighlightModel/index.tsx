import React from 'react'

import { getSession } from '@jbrowse/core/util'

import MsaToGenomeHighlight from './MsaToGenomeHighlight'
import { isTView } from '../TViewPanel/model'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function AddHighlightComponentsModelF(
  pluginManager: PluginManager,
) {
  pluginManager.contributeToExtensionPoint(
    'LinearGenomeView-TracksContainerComponent',
    ({ model }) =>
      getSession(model).views.some(
        v => isTView(v) && v.connectedViewId === model.id,
      ) ? (
        <MsaToGenomeHighlight key="tview_highlights" model={model} />
      ) : undefined,
  )
}
