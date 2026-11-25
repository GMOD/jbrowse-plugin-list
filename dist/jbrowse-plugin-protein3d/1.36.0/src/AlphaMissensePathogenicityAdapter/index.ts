import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function AlphaMissensePathogenicityAdapterF(
  pluginManager: PluginManager,
) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'AlphaMissensePathogenicityAdapter',
        displayName: 'AlphaMissensePathogenicity adapter',
        configSchema,
        getAdapterClass: () =>
          import('./AlphaMissensePathogenicityAdapter').then(r => r.default),
      }),
  )
}
