import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function AlphaFoldConfidenceAdapterF(
  pluginManager: PluginManager,
) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'AlphaFoldConfidenceAdapter',
        displayName: 'AlphaFoldConfidence adapter',
        configSchema,
        getAdapterClass: () =>
          import('./AlphaFoldConfidenceAdapter').then(r => r.default),
      }),
  )
}
