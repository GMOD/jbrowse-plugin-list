import Plugin from '@jbrowse/core/Plugin'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import { AdapterClass, configSchema } from './UCSCAdapter'
import { version } from '../package.json'

import type PluginManager from '@jbrowse/core/PluginManager'

export default class UCSCPlugin extends Plugin {
  name = 'UCSCPlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'UCSCAdapter',
          displayName: 'UCSC API',
          configSchema,
          AdapterClass,
        }),
    )
  }
}
