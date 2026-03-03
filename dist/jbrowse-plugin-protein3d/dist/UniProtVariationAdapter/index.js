import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import configSchema from './configSchema';
export default function UniProtVariationAdapterF(pluginManager) {
    pluginManager.addAdapterType(() => new AdapterType({
        name: 'UniProtVariationAdapter',
        displayName: 'UniProtVariation adapter',
        configSchema,
        getAdapterClass: () => import('./UniProtVariationAdapter').then(r => r.default),
    }));
}
//# sourceMappingURL=index.js.map