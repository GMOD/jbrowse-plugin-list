import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { version } from '../package.json'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import { AdapterClass, configSchema } from './QuantitativeSequenceAdapter'

import rendererFactory, {
  configSchemaFactory as QuantitativeSequenceRendererConfigSchemaFactory,
} from './QuantitativeSequenceRenderer'
import {
  configSchemaFactory as QuantitativeSequenceDisplayConfigSchemaFactory,
  stateModelFactory as QuantitativeSequenceDisplayModelFactory,
} from './QuantitativeSequenceDisplay'

export default class QuantseqPlugin extends Plugin {
  name = 'Quantseq'
  version = version

  install(pluginManager: PluginManager) {
    const WigglePlugin = pluginManager.getPlugin(
      'WigglePlugin',
    ) as import('@jbrowse/plugin-wiggle').default
    const DisplayType =
      pluginManager.lib['@jbrowse/core/pluggableElementTypes/DisplayType']

    const {
      LinearWiggleDisplayReactComponent,
      XYPlotRendererReactComponent,
      //@ts-ignore
    } = WigglePlugin.exports

    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'QuantitativeSequenceAdapter',
          AdapterClass,
          configSchema,
        }),
    )

    pluginManager.addDisplayType(() => {
      const configSchema = QuantitativeSequenceDisplayConfigSchemaFactory(
        pluginManager,
      )
      return new DisplayType({
        name: 'QuantitativeSequenceDisplay',
        configSchema,
        stateModel: QuantitativeSequenceDisplayModelFactory(
          pluginManager,
          configSchema,
        ),
        trackType: 'FeatureTrack',
        viewType: 'LinearGenomeView',
        ReactComponent: LinearWiggleDisplayReactComponent,
      })
    })

    pluginManager.addRendererType(() => {
      //@ts-ignore
      const QuantitativeSequenceRenderer = new rendererFactory(pluginManager)
      const configSchema = QuantitativeSequenceRendererConfigSchemaFactory(
        pluginManager,
      )
      return new QuantitativeSequenceRenderer({
        name: 'QuantitativeSequenceRenderer',
        ReactComponent: XYPlotRendererReactComponent,
        configSchema,
        pluginManager,
      })
    })
  }

  configure(pluginManager: PluginManager) {}
}
