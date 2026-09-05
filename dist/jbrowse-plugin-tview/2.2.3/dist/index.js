import Plugin from '@jbrowse/core/Plugin';
import AddHighlightModelF from './AddHighlightModel';
import TrackMenuItemF from './LaunchTView';
import TviewGetPlanRpcF from './LaunchTView/TviewGetPlanRpc';
import LaunchTViewF from './LaunchTView/launchView';
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
        TrackMenuItemF(pluginManager);
        LaunchTViewF(pluginManager);
        TviewGetPlanRpcF(pluginManager);
        AddHighlightModelF(pluginManager);
    }
    configure(_pluginManager) { }
}
//# sourceMappingURL=index.js.map