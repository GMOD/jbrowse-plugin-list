import { AdapterType } from '@jbrowse/core/pluggableElementTypes';
import MafTabixAdapter from './MafTabixAdapter';
import configSchema from './configSchema';
export default function MafTabixAdapterF(pluginManager) {
    return pluginManager.addAdapterType(() => new AdapterType({
        name: 'MafTabixAdapter',
        AdapterClass: MafTabixAdapter,
        configSchema,
    }));
}
//# sourceMappingURL=index.js.map