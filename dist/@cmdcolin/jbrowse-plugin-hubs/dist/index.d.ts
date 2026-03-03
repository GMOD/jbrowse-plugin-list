import Plugin from '@jbrowse/core/Plugin';
import PluginManager from '@jbrowse/core/PluginManager';
export default class HubsViewerPlugin extends Plugin {
    name: string;
    version: any;
    install(pluginManager: PluginManager): void;
    configure(_pluginManager: PluginManager): void;
}
