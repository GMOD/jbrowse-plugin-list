declare const _default: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    filters: {
        type: string;
        defaultValue: string;
        description: string;
    };
    colourBy: {
        type: string;
        defaultValue: string;
        description: string;
    };
    featureType: {
        type: string;
        model: import("mobx-state-tree").ISimpleType<string>;
        defaultValue: string;
        description: string;
    };
    cases: {
        type: string;
        defaultValue: never[];
        description: string;
    };
    size: {
        type: string;
        defaultValue: number;
        description: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "GDCAdapterId">>;
export default _default;
