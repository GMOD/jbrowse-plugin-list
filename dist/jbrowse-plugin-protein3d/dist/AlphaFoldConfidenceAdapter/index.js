import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import configSchema from './configSchema';
export default function AlphaFoldConfidenceAdapterF(pluginManager) {
    pluginManager.addAdapterType(() => new AdapterType({
        name: 'AlphaFoldConfidenceAdapter',
        displayName: 'AlphaFoldConfidence adapter',
        configSchema,
        getAdapterClass: () => import('./AlphaFoldConfidenceAdapter').then(r => r.default),
    }));
}
//# sourceMappingURL=index.js.map