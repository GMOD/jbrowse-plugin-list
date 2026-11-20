export default function configSchemaF(): import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    readonly resultsLocation: {
        type: "fileLocation";
    } & {
        defaultValue: unknown;
    };
    type: {
        type: "string";
    } & {
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined, true, import("@jbrowse/core/configuration").ConfigurationSchemaRequirement<Partial<Record<string, string[]>>, string>, any>>;
