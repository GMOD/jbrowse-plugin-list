import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { baseConnectionConfig } from '@jbrowse/core/pluggableElementTypes/models';
export default ConfigurationSchema('TheTrackHubRegistryConnection', {
    /**
     * #slot
     */
    trackDbId: {
        type: 'string',
        defaultValue: '',
        description: 'id of the trackDb in The Track Hub Registry',
    },
}, {
    /**
     * #baseConfiguration
     */
    baseConfiguration: baseConnectionConfig,
});
//# sourceMappingURL=configSchema.js.map