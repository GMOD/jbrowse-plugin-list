import type PluginManager from '@jbrowse/core/PluginManager';
export default function configSchemaF(pluginManager: PluginManager): import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    msaRegex: {
        type: string;
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration").AnyConfigurationSchemaType, undefined>>;
