import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
export interface DatasetMsa {
    msa: string;
    tree?: string;
    /** the row the dataset names as the protein's own, preferred over a row that matches it equally */
    queryRowName?: string;
}
export declare function fetchMSAList({ config, pluginManager, assemblyName, }: {
    config: AnyConfigurationModel;
    pluginManager: PluginManager;
    assemblyName?: string;
}): Promise<string[]>;
export declare function fetchMSA({ config, pluginManager, msaId, assemblyName, }: {
    config: AnyConfigurationModel;
    pluginManager: PluginManager;
    msaId: string;
    assemblyName?: string;
}): Promise<DatasetMsa>;
