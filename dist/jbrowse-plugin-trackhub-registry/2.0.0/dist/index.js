import Plugin from '@jbrowse/core/Plugin';
import ConnectionType from '@jbrowse/core/pluggableElementTypes/ConnectionType';
// locals
import { configSchema, modelFactory } from './trackhub-registry';
import configEditorComponent from './trackhub-registry/TrackHubRegistrySelect';
export default class TrackHubRegistryPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'TrackHubRegistryPlugin';
    }
    install(pluginManager) {
        pluginManager.addConnectionType(() => new ConnectionType({
            name: 'TheTrackHubRegistryConnection',
            configSchema,
            configEditorComponent,
            stateModel: modelFactory(pluginManager),
            displayName: 'The Track Hub Registry',
            description: 'A hub from The Track Hub Registry',
            url: '//trackhubregistry.org/',
        }));
    }
}
//# sourceMappingURL=index.js.map