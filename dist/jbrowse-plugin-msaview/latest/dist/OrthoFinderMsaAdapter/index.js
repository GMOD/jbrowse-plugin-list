import { AdapterType } from '@jbrowse/core/pluggableElementTypes';
import configSchemaF from './configSchema';
export default function OrthoFinderMsaAdapterF(pluginManager) {
    return pluginManager.addAdapterType(() => {
        return new AdapterType({
            name: 'OrthoFinderMsaAdapter',
            configSchema: configSchemaF(),
            adapterMetadata: {
                hiddenFromGUI: true,
            },
            getAdapterClass: () => import('./OrthoFinderMsaAdapter').then(t => t.default),
        });
    });
}
