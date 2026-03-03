import PluginManager from '@jbrowse/core/PluginManager'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema'

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
