import PluginManager from '@jbrowse/core/PluginManager';
export default function configSchemaF(pluginManager: PluginManager): import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaType<{
    /**
     * #slot
     */
    renderer: import("@jbrowse/mobx-state-tree").IAnyModelType;
}, import("@jbrowse/core/esm/configuration/configurationSchema").ConfigurationSchemaOptions<any, undefined>>;
