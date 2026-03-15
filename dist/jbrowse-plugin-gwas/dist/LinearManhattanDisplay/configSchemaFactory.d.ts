import type PluginManager from '@jbrowse/core/PluginManager';
export declare function configSchemaFactory(pluginManager: PluginManager): import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    mouseover: {
        type: string;
        defaultValue: string;
        contextVariable: string[];
    };
    autoscale: {
        type: string;
        defaultValue: string;
        model: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        description: string;
    };
    minScore: {
        type: string;
        defaultValue: number;
        description: string;
    };
    maxScore: {
        type: string;
        description: string;
        defaultValue: number;
    };
    numStdDev: {
        type: string;
        description: string;
        defaultValue: number;
    };
    scaleType: {
        type: string;
        model: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        description: string;
        defaultValue: string;
    };
    inverted: {
        type: string;
        description: string;
        defaultValue: boolean;
    };
    renderers: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
        LinearManhattanRenderer: import("@jbrowse/core/configuration").AnyConfigurationSchemaType;
    }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    maxFeatureScreenDensity: {
        type: string;
        description: string;
        defaultValue: number;
    };
    fetchSizeLimit: {
        type: string;
        defaultValue: number;
        description: string;
    };
    height: {
        type: string;
        defaultValue: number;
        description: string;
    };
    mouseover: {
        type: string;
        description: string;
        defaultValue: string;
        contextVariable: string[];
    };
    jexlFilters: {
        type: string;
        description: string;
        defaultValue: never[];
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "displayId">>, undefined>>;
