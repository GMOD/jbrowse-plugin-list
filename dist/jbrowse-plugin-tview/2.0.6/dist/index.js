import Plugin from '@jbrowse/core/Plugin';
import AddHighlightModelF from './AddHighlightModel';
import LaunchTViewF from './LaunchTView';
import TViewF from './TViewPanel';
import { version } from './version';
export default class TViewPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'TViewPlugin';
        this.version = version;
    }
    install(pluginManager) {
        TViewF(pluginManager);
        LaunchTViewF(pluginManager);
        AddHighlightModelF(pluginManager);
    }
    configure(_pluginManager) { }
}
//# sourceMappingURL=index.js.map