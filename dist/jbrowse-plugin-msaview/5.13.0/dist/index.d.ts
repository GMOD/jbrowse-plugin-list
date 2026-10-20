import Plugin from '@jbrowse/core/Plugin';
import type PluginManager from '@jbrowse/core/PluginManager';
export default class MsaViewPlugin extends Plugin {
    name: string;
    version: string;
    install(pluginManager: PluginManager): void;
    configure(pluginManager: PluginManager): void;
    rootConfigurationSchema: (pluginManager: PluginManager) => {
        msa: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
            readonly datasets: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                readonly datasetId: {
                    type: "string";
                } & {
                    defaultValue: string;
                };
                readonly description: {
                    type: "string";
                } & {
                    defaultValue: string;
                };
                readonly name: {
                    type: "string";
                } & {
                    defaultValue: string;
                };
                readonly adapter: import("@jbrowse/mobx-state-tree").IAnyType;
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined, undefined, import("@jbrowse/core/configuration").ConfigurationSchemaRequirement<Partial<Record<string, string[]>>, string>>>>>;
        }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined, undefined, import("@jbrowse/core/configuration").ConfigurationSchemaRequirement<Partial<Record<string, string[]>>, string>>>;
    };
}
