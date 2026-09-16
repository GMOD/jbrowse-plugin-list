import Plugin from '@jbrowse/core/Plugin';
import type PluginManager from '@jbrowse/core/PluginManager';
export default class ReactomePlugin extends Plugin {
    name: string;
    version: string;
    install(pluginManager: PluginManager): void;
    configure(pluginManager: PluginManager): void;
}
