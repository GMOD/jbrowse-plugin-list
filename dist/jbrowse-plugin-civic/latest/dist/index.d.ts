import Plugin from "@jbrowse/core/Plugin";
import PluginManager from "@jbrowse/core/PluginManager";
export default class CIVICPlugin extends Plugin {
    name: string;
    version: any;
    install(pluginManager: any): void;
    configure(pluginManager: PluginManager): void;
}
