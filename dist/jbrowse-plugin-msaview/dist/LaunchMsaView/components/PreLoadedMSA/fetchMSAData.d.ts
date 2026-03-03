import { AnyConfigurationModel } from '@jbrowse/core/configuration';
import { Feature } from '@jbrowse/core/util';
import type PluginManager from '@jbrowse/core/PluginManager';
export declare function fetchMSAList({ config, pluginManager, }: {
    config: AnyConfigurationModel;
    pluginManager: PluginManager;
}): Promise<string[]>;
export declare function fetchMSA({ config, pluginManager, msaId, }: {
    config: AnyConfigurationModel;
    pluginManager: PluginManager;
    msaId: string;
}): Promise<Feature[]>;
