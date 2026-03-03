declare const configSchema: import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
    /**
     * #slot
     */
    samples: {
        type: string;
        description: string;
        defaultValue: never[];
    };
    /**
     * #slot
     */
    bigBedLocation: {
        type: string;
        defaultValue: {
            uri: string;
            locationType: string;
        };
    };
    /**
     * #slot
     */
    nhLocation: {
        type: string;
        description: string;
        defaultValue: {
            uri: string;
            locationType: string;
        };
    };
}, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
export default configSchema;
