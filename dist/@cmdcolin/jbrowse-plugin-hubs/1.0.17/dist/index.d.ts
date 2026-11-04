import Plugin from '@jbrowse/core/Plugin';
import type PluginManager from '@jbrowse/core/PluginManager';
export default class HubsViewerPlugin extends Plugin {
    name: string;
    version: any;
    install(pluginManager: PluginManager): void;
    configure(pluginManager: PluginManager): void;
}
