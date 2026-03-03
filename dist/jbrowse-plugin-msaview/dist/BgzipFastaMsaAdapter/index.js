import { AdapterType } from '@jbrowse/core/pluggableElementTypes';
import configSchemaF from './configSchema';
export default function BgzipFastaMsaAdapterF(pluginManager) {
    return pluginManager.addAdapterType(() => {
        return new AdapterType({
            name: 'BgzipFastaMsaAdapter',
            configSchema: configSchemaF(pluginManager),
            adapterMetadata: {
                hiddenFromGUI: true,
            },
            getAdapterClass: () => import('./BgzipFastaMsaAdapter').then(t => t.default),
        });
    });
}
//# sourceMappingURL=index.js.map