import Plugin from '@jbrowse/core/Plugin';
import MultiWiggleZarrAdapterF from './MultiWiggleZarrAdapter';
import { version } from '../package.json';
export default class ZarrPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'ZarrPlugin';
        this.version = version;
    }
    install(pluginManager) {
        MultiWiggleZarrAdapterF(pluginManager);
    }
}
//# sourceMappingURL=index.js.map