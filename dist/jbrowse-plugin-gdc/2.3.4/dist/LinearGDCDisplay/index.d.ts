import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration';
import type { IAnyModelType } from '@jbrowse/mobx-state-tree';
declare const linearGDCDisplayPlugin: (pluginManager: PluginManager) => {
    configSchema: AnyConfigurationSchemaType;
    stateModel: IAnyModelType;
};
export default linearGDCDisplayPlugin;
