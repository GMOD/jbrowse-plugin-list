import PluginManager from '@jbrowse/core/PluginManager';
export declare const configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    baseUrl: {
        type: string;
        defaultValue: string;
    };
    query: {
        type: string;
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
export default function MyVariantAdapterF(pluginManager: PluginManager): void;
