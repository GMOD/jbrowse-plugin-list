import PluginManager from '@jbrowse/core/PluginManager';
import Plugin from '@jbrowse/core/Plugin';
export default class extends Plugin {
    name: string;
    version: any;
    install(pluginManager: PluginManager): void;
}
