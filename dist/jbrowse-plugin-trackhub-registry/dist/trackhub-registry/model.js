import { ConfigurationReference, getConf, readConfObject, } from '@jbrowse/core/configuration';
import { BaseConnectionModelFactory } from '@jbrowse/core/pluggableElementTypes/models';
import { getSession } from '@jbrowse/core/util';
import { types } from '@jbrowse/mobx-state-tree';
// locals
import configSchema from './configSchema';
import { generateTracks } from './tracks';
import { mfetch } from './util';
export default function stateModelFactory(pluginManager) {
    return BaseConnectionModelFactory(pluginManager)
        .named('TheTrackHubRegistryConnection')
        .props({
        type: types.literal('TheTrackHubRegistryConnection'),
        configuration: ConfigurationReference(configSchema),
    })
        .volatile(() => ({
        error: undefined,
    }))
        .actions((self) => ({
        async connect(connectionConf) {
            self.clear();
            const trackDbId = readConfObject(connectionConf, 'trackDbId');
            try {
                const trackDb = await mfetch(`https://www.trackhubregistry.org/api/search/trackdb/${trackDbId}`);
                const assemblyName = trackDb.assembly.name;
                const session = getSession(self);
                const assembly = session.assemblyManager.get(assemblyName);
                if (!assembly) {
                    throw new Error(`unknown assembly ${assemblyName}`);
                }
                const sequenceAdapter = getConf(assembly, ['sequence', 'adapter']);
                const tracks = generateTracks(trackDb, assemblyName, sequenceAdapter);
                self.setTrackConfs(tracks);
            }
            catch (e) {
                console.error(e);
                this.setError(e);
            }
        },
        setError(e) {
            self.error = e;
        },
    }));
}
//# sourceMappingURL=model.js.map