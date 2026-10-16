import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function RgfaTabixAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'RgfaTabixAdapter',
        displayName: 'Indexed rGFA adapter',
        configSchema,
        // what a graph display needs of its track's adapter
        adapterCapabilities: ['getSubgraph'],
        adapterMetadata: {
          category: 'Graph adapters',
        },
        getAdapterClass: () =>
          import('./RgfaTabixAdapter.ts').then(r => r.default),
      }),
  )
}
