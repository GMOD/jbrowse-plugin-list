import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { createBaseTrackConfig } from '@jbrowse/core/pluggableElementTypes';
export default function configSchemaF(pluginManager) {
    return ConfigurationSchema('MafTrack', {}, {
        /**
         * #baseConfiguration
         */
        baseConfiguration: createBaseTrackConfig(pluginManager),
        /**
         * #identifier
         */
        explicitIdentifier: 'trackId',
    });
}
//# sourceMappingURL=configSchema.js.map