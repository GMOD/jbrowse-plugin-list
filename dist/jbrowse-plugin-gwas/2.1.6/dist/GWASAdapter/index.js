import { ConfigurationSchema } from '@jbrowse/core/configuration';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
export default function GWASAdapterF(pluginManager) {
    pluginManager.addAdapterType(() => {
        const res = pluginManager.getAdapterType('BedTabixAdapter');
        const configSchema = ConfigurationSchema('GWASAdapter', {}, { baseConfiguration: res.configSchema, explicitlyTyped: true });
        return new AdapterType({
            name: 'GWASAdapter',
            displayName: 'GWAS adapter',
            configSchema,
            getAdapterClass: res.getAdapterClass,
        });
    });
}
//# sourceMappingURL=index.js.map