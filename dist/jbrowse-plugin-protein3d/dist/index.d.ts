import Plugin from '@jbrowse/core/Plugin';
import PluginManager from '@jbrowse/core/PluginManager';
export default class ProteinViewer extends Plugin {
    name: string;
    version: string;
    install(pluginManager: PluginManager): void;
    configure(_pluginManager: PluginManager): void;
}
