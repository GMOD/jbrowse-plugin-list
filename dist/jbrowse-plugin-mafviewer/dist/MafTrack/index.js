import { TrackType, createBaseTrackModel, } from '@jbrowse/core/pluggableElementTypes';
import configSchemaF from './configSchema';
export default function MafTrackF(pluginManager) {
    return pluginManager.addTrackType(() => {
        const configSchema = configSchemaF(pluginManager);
        return new TrackType({
            name: 'MafTrack',
            configSchema,
            displayName: 'MAF track',
            stateModel: createBaseTrackModel(pluginManager, 'MafTrack', configSchema),
        });
    });
}
//# sourceMappingURL=index.js.map