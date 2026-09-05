import Plugin from '@jbrowse/core/Plugin'

import AddHighlightModelF from './AddHighlightModel'
import TrackMenuItemF from './LaunchTView'
import TviewGetPlanRpcF from './LaunchTView/TviewGetPlanRpc'
import LaunchTViewF from './LaunchTView/launchView'
import TViewF from './TViewPanel'
import { version } from './version'

import type PluginManager from '@jbrowse/core/PluginManager'

export default class TViewPlugin extends Plugin {
  name = 'TViewPlugin'
  version = version

  install(pluginManager: PluginManager) {
    TViewF(pluginManager)
    TrackMenuItemF(pluginManager)
    LaunchTViewF(pluginManager)
    TviewGetPlanRpcF(pluginManager)
    AddHighlightModelF(pluginManager)
  }

  configure(_pluginManager: PluginManager) {}
}
