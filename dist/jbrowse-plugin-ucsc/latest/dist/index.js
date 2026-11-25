import Plugin from '@jbrowse/core/Plugin';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import { AdapterClass, configSchema } from './UCSCAdapter';
import { version } from '../package.json';
export default class UCSCPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'UCSCPlugin';
        this.version = version;
    }
    install(pluginManager) {
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'UCSCAdapter',
            displayName: 'UCSC API',
            configSchema,
            AdapterClass,
        }));
    }
}
//# sourceMappingURL=index.js.map