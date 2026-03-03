import type PluginManager from '@jbrowse/core/PluginManager';
/**
 * #config GWASTrack
 * #category track
 * used for GWAS (Genome-Wide Association Study) tracks with Manhattan plot display
 */
export default function configSchemaFactory(pluginManager: PluginManager): import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{}, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
    name: {
        description: string;
        type: string;
        defaultValue: string;
    };
    assemblyNames: {
        description: string;
        type: string;
        defaultValue: string[];
    };
    description: {
        description: string;
        type: string;
        defaultValue: string;
    };
    category: {
        description: string;
        type: string;
        defaultValue: never[];
    };
    metadata: {
        type: string;
        description: string;
        defaultValue: {};
    };
    rpcDriverName: {
        type: string;
        description: string;
        defaultValue: string;
    };
    adapter: import("@jbrowse/mobx-state-tree").IAnyModelType;
    textSearching: import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
        indexingAttributes: {
            type: string;
            description: string;
            defaultValue: string[];
        };
        indexingFeatureTypesToExclude: {
            type: string;
            description: string;
            defaultValue: string[];
        };
        textSearchAdapter: import("@jbrowse/mobx-state-tree").IAnyModelType;
    }, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    displays: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyModelType>;
    formatDetails: import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
        feature: {
            type: string;
            description: string;
            defaultValue: {};
            contextVariable: string[];
        };
        subfeatures: {
            type: string;
            description: string;
            defaultValue: {};
            contextVariable: string[];
        };
        depth: {
            type: string;
            defaultValue: number;
            description: string;
        };
        maxDepth: {
            type: string;
            defaultValue: number;
            description: string;
        };
    }, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    formatAbout: import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
        config: {
            type: string;
            description: string;
            defaultValue: {};
            contextVariable: string[];
        };
        hideUris: {
            type: string;
            defaultValue: boolean;
        };
    }, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
}, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "trackId">>, undefined>>;
