import Plugin from '@jbrowse/core/Plugin'

import AddHighlightModelF from './AddHighlightModel'
import LaunchTViewF from './LaunchTView'
import TViewF from './TViewPanel'
import { version } from './version'

import type PluginManager from '@jbrowse/core/PluginManager'

export default class TViewPlugin extends Plugin {
  name = 'TViewPlugin'
  version = version

  install(pluginManager: PluginManager) {
    TViewF(pluginManager)
    LaunchTViewF(pluginManager)
    AddHighlightModelF(pluginManager)
  }

  configure(_pluginManager: PluginManager) {}
}
