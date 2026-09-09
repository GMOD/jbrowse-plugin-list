import Plugin from '@jbrowse/core/Plugin';
import type PluginManager from '@jbrowse/core/PluginManager';
import { ConfigurationSchema } from '@jbrowse/core/configuration';
export default class ApolloPlugin extends Plugin {
    name: string;
    version: string;
    configurationSchema: ReturnType<typeof ConfigurationSchema>;
    install(pluginManager: PluginManager): void;
    configure(pluginManager: PluginManager): void;
}
//# sourceMappingURL=index.d.ts.map