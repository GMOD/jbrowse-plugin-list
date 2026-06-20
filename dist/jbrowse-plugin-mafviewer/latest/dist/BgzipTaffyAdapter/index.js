import { AdapterType } from '@jbrowse/core/pluggableElementTypes';
import BgzipTaffyAdapter from './BgzipTaffyAdapter';
import configSchema from './configSchema';
export default function BgzipTaffyAdapterF(pluginManager) {
    return pluginManager.addAdapterType(() => new AdapterType({
        name: 'BgzipTaffyAdapter',
        AdapterClass: BgzipTaffyAdapter,
        configSchema,
    }));
}
//# sourceMappingURL=index.js.map