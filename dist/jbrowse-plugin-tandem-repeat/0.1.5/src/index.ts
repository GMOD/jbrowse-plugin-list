import Plugin from '@jbrowse/core/Plugin'

import LaunchTandemRepeatViewF from './LaunchTandemRepeatView/index'
import TandemRepeatViewF from './TandemRepeatView/index'
import { PLUGIN_NAME } from './pluginName'
import { version } from './version'

import type PluginManager from '@jbrowse/core/PluginManager'

export default class TandemRepeatPlugin extends Plugin {
  name = PLUGIN_NAME
  version = version

  install(pluginManager: PluginManager) {
    TandemRepeatViewF(pluginManager)
    LaunchTandemRepeatViewF(pluginManager)
  }

  configure() {}
}
