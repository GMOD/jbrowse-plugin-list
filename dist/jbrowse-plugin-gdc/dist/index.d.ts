import PluginManager from '@jbrowse/core/PluginManager';
import Plugin from '@jbrowse/core/Plugin';
export default class GDCPlugin extends Plugin {
    name: string;
    version: string;
    install(pluginManager: PluginManager): void;
    configure(pluginManager: PluginManager): void;
}
