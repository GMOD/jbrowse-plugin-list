import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function WalkFormsAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'WalkFormsAdapter',
        displayName: 'Walk-file structural forms adapter',
        configSchema,
        adapterMetadata: {
          category: 'Variant adapters',
        },
        getAdapterClass: () =>
          import('./WalkFormsAdapter.ts').then(r => r.default),
      }),
  )
}
