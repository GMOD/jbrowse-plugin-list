import type PluginManager from '@jbrowse/core/PluginManager';
export default function configSchemaF(pluginManager: PluginManager): import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    msaRegex: {
        type: "string";
    } & {
        defaultValue: string;
    };
    msaIndexLocation: {
        type: "fileLocation";
    } & {
        defaultValue: unknown;
    };
} | {
    readonly msaRegex: {
        type: "string";
    } & {
        defaultValue: string;
    };
    readonly msaIndexLocation: {
        type: "fileLocation";
    } & {
        defaultValue: unknown;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<any, undefined, undefined, import("@jbrowse/core/configuration").ConfigurationSchemaRequirement<Partial<Record<string, string[]>>, string>, any>>;
