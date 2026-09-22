import type PluginManager from '@jbrowse/core/PluginManager';
export default function configSchemaF(pluginManager: PluginManager): import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    readonly msaRegex: {
        readonly type: "string";
        readonly defaultValue: "_";
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration").AnyConfigurationSchemaType, undefined>>;
