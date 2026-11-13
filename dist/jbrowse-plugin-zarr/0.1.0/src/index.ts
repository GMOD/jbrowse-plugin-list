import Plugin from '@jbrowse/core/Plugin'

import MultiWiggleZarrAdapterF from './MultiWiggleZarrAdapter'
import { version } from '../package.json'

import type PluginManager from '@jbrowse/core/PluginManager'

export default class ZarrPlugin extends Plugin {
  name = 'ZarrPlugin'
  version = version

  install(pluginManager: PluginManager) {
    MultiWiggleZarrAdapterF(pluginManager)
  }
}
