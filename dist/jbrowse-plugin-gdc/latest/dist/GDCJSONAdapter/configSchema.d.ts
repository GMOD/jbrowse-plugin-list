declare const _default: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    featureType: {
        type: string;
        model: import("@jbrowse/mobx-state-tree").ISimpleType<"mutation" | "gene">;
        defaultValue: string;
        description: string;
    };
    data: {
        type: string;
        defaultValue: string;
        description: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
export default _default;
