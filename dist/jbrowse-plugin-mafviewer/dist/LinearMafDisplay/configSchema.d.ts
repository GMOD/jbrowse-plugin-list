import PluginManager from '@jbrowse/core/PluginManager';
export default function configSchemaF(pluginManager: PluginManager): import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    /**
     * #slot
     */
    renderer: import("@jbrowse/mobx-state-tree").IAnyModelType;
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
