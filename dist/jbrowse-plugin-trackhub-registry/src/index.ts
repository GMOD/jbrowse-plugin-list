import ConnectionType from '@jbrowse/core/pluggableElementTypes/ConnectionType'
import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'

// locals
import { configSchema, modelFactory } from './trackhub-registry'
import configEditorComponent from './trackhub-registry/TrackHubRegistrySelect'

export default class TrackHubRegistryPlugin extends Plugin {
  name = 'TrackHubRegistryPlugin'

  install(pluginManager: PluginManager) {
    pluginManager.addConnectionType(
      () =>
        new ConnectionType({
          name: 'TheTrackHubRegistryConnection',
          configSchema,
          configEditorComponent,
          stateModel: modelFactory(pluginManager),
          displayName: 'The Track Hub Registry',
          description: 'A hub from The Track Hub Registry',
          url: '//trackhubregistry.org/',
        }),
    )
  }
}
