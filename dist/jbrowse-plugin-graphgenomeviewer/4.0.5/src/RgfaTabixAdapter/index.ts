import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema, { normalizeSnapshot } from './configSchema.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function RgfaTabixAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'RgfaTabixAdapter',
        displayName: 'Indexed rGFA adapter',
        normalizeSnapshot,
        configSchema,
        // what the launch menus look for (launchSubgraph/subgraphTracks.ts)
        adapterCapabilities: ['getSubgraph'],
        adapterMetadata: {
          category: 'Graph adapters',
        },
        getAdapterClass: () =>
          import('./RgfaTabixAdapter.ts').then(r => r.default),
      }),
  )
}
