import PluginManager from '@jbrowse/core/PluginManager'
import Plugin from '@jbrowse/core/Plugin'

import { version } from '../package.json'
import MyGeneAdapterF from './MyGeneAdapter'
import MyVariantAdapterF from './MyVariantAdapter'

export default class extends Plugin {
  name = 'Biothings'
  version = version

  install(pluginManager: PluginManager) {
    MyGeneAdapterF(pluginManager)
    MyVariantAdapterF(pluginManager)
  }
}
