import { ConfigurationSchema } from '@jbrowse/core/configuration';
export default function configSchemaF(pluginManager) {
    const base = pluginManager.getAdapterType('BgzipFastaAdapter');
    return ConfigurationSchema('BgzipFastaMsaAdapter', {
        msaRegex: {
            type: 'string',
            defaultValue: '_',
        },
    }, {
        baseConfiguration: base?.configSchema,
    });
}
//# sourceMappingURL=configSchema.js.map