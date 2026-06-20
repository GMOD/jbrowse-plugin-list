declare const _default: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    /**
     * #slot
     */
    trackDbId: {
        type: string;
        defaultValue: string;
        description: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    name: {
        type: string;
        defaultValue: string;
        description: string;
    };
    assemblyNames: {
        type: string;
        defaultValue: never[];
        description: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "connectionId">>, undefined>>;
export default _default;
