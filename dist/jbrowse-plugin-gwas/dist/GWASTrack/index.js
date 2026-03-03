import { TrackType, createBaseTrackModel, } from '@jbrowse/core/pluggableElementTypes';
import configSchemaF from './configSchema';
export default function GWASTrackF(pm) {
    pm.addTrackType(() => {
        const configSchema = configSchemaF(pm);
        return new TrackType({
            name: 'GWASTrack',
            displayName: 'GWAS track',
            configSchema,
            stateModel: createBaseTrackModel(pm, 'GWASTrack', configSchema),
        });
    });
}
//# sourceMappingURL=index.js.map