import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function MultiWiggleZarrAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'MultiWiggleZarrAdapter',
        displayName: 'Zarr signal matrix adapter',
        configSchema,
        adapterCapabilities: ['hasResolution'],
        getAdapterClass: () =>
          import('./MultiWiggleZarrAdapter').then(r => r.default),
      }),
  )
}
