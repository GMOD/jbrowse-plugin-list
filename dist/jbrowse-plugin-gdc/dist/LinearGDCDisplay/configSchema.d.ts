import PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (pluginManager: PluginManager) => import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    renderer: import("mobx-state-tree").IAnyModelType;
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
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "displayId">>, undefined>>;
export default _default;
