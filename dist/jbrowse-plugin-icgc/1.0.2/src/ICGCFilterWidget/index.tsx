import React from 'react'
import PluginManager from '@jbrowse/core/PluginManager'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import stateModel from './model'
import ReactComponent from './components/ICGCFilterComponent'

export default (pluginManager: PluginManager) => {
  return {
    configSchema: ConfigurationSchema('ICGCFilterWidget', {}),
    ReactComponent,
    stateModel: pluginManager.load(stateModel),
    HeadingComponent: () => <>ICGC Filters</>,
  }
}
