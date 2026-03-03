import { ConfigurationSchema } from '@jbrowse/core/configuration'
import PluginManager from '@jbrowse/core/PluginManager'
export { default } from './QuantitativeSequenceRenderer'

export function configSchemaFactory(pluginManager: PluginManager) {
  const WigglePlugin = pluginManager.getPlugin(
    'WigglePlugin',
  ) as import('@jbrowse/plugin-wiggle').default
  //@ts-ignore
  const { xyPlotRendererConfigSchema } = WigglePlugin.exports

  return ConfigurationSchema(
    'QuantitativeSequenceRenderer',
    {},
    { baseConfiguration: xyPlotRendererConfigSchema, explicitlyTyped: true },
  )
}
