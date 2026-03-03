import Plugin from '@jbrowse/core/Plugin';
import PluginManager from '@jbrowse/core/PluginManager';
export default class MsaViewPlugin extends Plugin {
    name: string;
    version: string;
    install(pluginManager: PluginManager): void;
    configure(pluginManager: PluginManager): void;
    rootConfigurationSchema(pluginManager: PluginManager): {
        msa: import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
            datasets: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
                datasetId: {
                    type: string;
                    defaultValue: string;
                };
                description: {
                    type: string;
                    defaultValue: string;
                };
                name: {
                    type: string;
                    defaultValue: string;
                };
                adapter: import("@jbrowse/mobx-state-tree").IAnyModelType;
            }, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>>>;
        }, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    };
}
