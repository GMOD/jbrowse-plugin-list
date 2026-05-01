import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { BaseInternetAccountConfig } from '@jbrowse/core/pluggableElementTypes/models';
const GDCConfigSchema = ConfigurationSchema('GDCInternetAccount', {
    authHeader: {
        description: 'custom auth header for authorization',
        type: 'string',
        defaultValue: 'X-Auth-Token',
    },
    customEndpoint: {
        description: 'custom endpoint for the external token resource',
        type: 'string',
        defaultValue: '',
    },
}, {
    baseConfiguration: BaseInternetAccountConfig,
    explicitlyTyped: true,
});
export default GDCConfigSchema;
//# sourceMappingURL=configSchema.js.map