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
    bedGzLocation: {
        type: string;
        defaultValue: {
            uri: string;
            locationType: string;
        };
    };
    /**
     * #slot
     */
    refAssemblyName: {
        type: string;
        defaultValue: string;
    };
    index: import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
        /**
         * #slot index.location
         */
        location: {
            type: string;
            defaultValue: {
                uri: string;
            };
        };
        /**
         * #slot index.indexType
         */
        indexType: {
            type: string;
            defaultValue: string;
        };
    }, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
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
