import Plugin from '@jbrowse/core/Plugin';
import type PluginManager from '@jbrowse/core/PluginManager';
export default class GWASPlugin extends Plugin {
    name: string;
    version: string;
    install(pluginManager: PluginManager): void;
}
