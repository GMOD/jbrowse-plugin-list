import Plugin from '@jbrowse/core/Plugin';
import PluginManager from '@jbrowse/core/PluginManager';
export default class TrackHubRegistryPlugin extends Plugin {
    name: string;
    install(pluginManager: PluginManager): void;
}
