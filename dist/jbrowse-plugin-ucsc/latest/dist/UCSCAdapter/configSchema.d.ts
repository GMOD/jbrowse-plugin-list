declare const _default: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    readonly base: {
        type: "fileLocation";
    } & {
        defaultValue: unknown;
    };
    readonly track: {
        type: "string";
    } & {
        defaultValue: string;
    };
    readonly genome: {
        type: "string";
    } & {
        defaultValue: string;
    };
    readonly maxItems: {
        type: "number";
    } & {
        defaultValue: number;
    };
    type: {
        type: "string";
    } & {
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined, true, import("@jbrowse/core/configuration").ConfigurationSchemaRequirement<Partial<Record<string, string[]>>, string>, any>>;
export default _default;
