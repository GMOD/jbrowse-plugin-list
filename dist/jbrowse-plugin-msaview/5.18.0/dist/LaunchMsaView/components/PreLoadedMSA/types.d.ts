import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { JBrowseConfigModel } from '@jbrowse/core/util';
export interface Dataset {
    datasetId: string;
    name: string;
    description?: string;
    adapter: AnyConfigurationModel;
}
export declare function readMsaDatasets(jbrowse: JBrowseConfigModel & {
    msa?: AnyConfigurationModel;
}): Dataset[] | undefined;
