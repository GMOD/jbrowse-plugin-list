import { AdapterType } from '@jbrowse/core/pluggableElementTypes';
import BigMafAdapter from './BigMafAdapter';
import configSchema from './configSchema';
export default function BigMafAdapterF(pluginManager) {
    return pluginManager.addAdapterType(() => new AdapterType({
        name: 'BigMafAdapter',
        AdapterClass: BigMafAdapter,
        configSchema,
    }));
}
//# sourceMappingURL=index.js.map