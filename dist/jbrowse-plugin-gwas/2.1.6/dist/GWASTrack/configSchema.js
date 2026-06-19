import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { createBaseTrackConfig } from '@jbrowse/core/pluggableElementTypes';
/**
 * #config GWASTrack
 * #category track
 * used for GWAS (Genome-Wide Association Study) tracks with Manhattan plot display
 */
export default function configSchemaFactory(pluginManager) {
    return ConfigurationSchema('GWASTrack', {}, {
        /**
         * #baseConfiguration
         */
        baseConfiguration: createBaseTrackConfig(pluginManager),
    });
}
//# sourceMappingURL=configSchema.js.map