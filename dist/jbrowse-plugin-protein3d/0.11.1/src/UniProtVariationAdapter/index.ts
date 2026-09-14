import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function UniProtVariationAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'UniProtVariationAdapter',
        displayName: 'UniProtVariation adapter',
        configSchema,
        getAdapterClass: () =>
          import('./UniProtVariationAdapter').then(r => r.default),
      }),
  )
}
