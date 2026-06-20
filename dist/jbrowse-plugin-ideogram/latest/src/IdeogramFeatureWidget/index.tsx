import { ConfigurationSchema } from '@jbrowse/core/configuration'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { types } from 'mobx-state-tree'
import ReactComponent from './IdeogramFeatureWidget'

export default (pluginManager: PluginManager) => {
  const configSchema = ConfigurationSchema('IdeogramFeatureWidget', {})
  const stateModel = types
    .model('IdeogramFeatureWidget', {
      id: ElementId,
      type: types.literal('IdeogramFeatureWidget'),
      featureData: types.frozen({}),
      view: types.safeReference(
        pluginManager.pluggableMstType('view', 'stateModel'),
      ),
    })
    .actions(self => ({
      setFeatureData(data: any) {
        self.featureData = data
      },
      clearFeatureData() {
        self.featureData = {}
      },
      hasPlugin(name: string) {
        return pluginManager.hasPlugin(name)
      },
    }))

  return { configSchema, stateModel, ReactComponent }
}
