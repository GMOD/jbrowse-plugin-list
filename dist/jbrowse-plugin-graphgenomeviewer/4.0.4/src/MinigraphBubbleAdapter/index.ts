import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema, { normalizeSnapshot } from './configSchema.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function MinigraphBubbleAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'MinigraphBubbleAdapter',
        displayName: 'Minigraph bubble BED adapter',
        normalizeSnapshot,
        configSchema,
        adapterMetadata: {
          category: 'Graph adapters',
        },
        getAdapterClass: () =>
          import('./MinigraphBubbleAdapter.ts').then(r => r.default),
      }),
  )
}
