import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import configSchema from './configSchema';
export default function MultiWiggleZarrAdapterF(pluginManager) {
    pluginManager.addAdapterType(() => new AdapterType({
        name: 'MultiWiggleZarrAdapter',
        displayName: 'Zarr signal matrix adapter',
        configSchema,
        adapterCapabilities: ['hasResolution'],
        getAdapterClass: () => import('./MultiWiggleZarrAdapter').then(r => r.default),
    }));
}
//# sourceMappingURL=index.js.map