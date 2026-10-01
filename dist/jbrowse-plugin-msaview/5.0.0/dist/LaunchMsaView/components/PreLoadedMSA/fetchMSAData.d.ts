import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { Feature } from '@jbrowse/core/util';
export declare function fetchMSAList({ config, pluginManager, }: {
    config: AnyConfigurationModel;
    pluginManager: PluginManager;
}): Promise<string[]>;
export declare function fetchMSA({ config, pluginManager, msaId, }: {
    config: AnyConfigurationModel;
    pluginManager: PluginManager;
    msaId: string;
}): Promise<Feature[]>;
