import { BaseAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
export default class BgzipFastaMsaAdapter extends BaseAdapter {
    configureP: Promise<BaseFeatureDataAdapter> | undefined;
    msaRowsP: Promise<Map<string, string[]>> | undefined;
    configurePre(): Promise<BaseFeatureDataAdapter<import("@jbrowse/core/configuration").AnyConfigurationModel>>;
    configure(): Promise<BaseFeatureDataAdapter<import("@jbrowse/core/configuration").AnyConfigurationModel>>;
    groupRows(): Promise<Map<string, string[]>>;
    getMSARows(): Promise<Map<string, string[]>>;
    getMSAList(): Promise<string[]>;
    getMSA(id: string): Promise<import("@jbrowse/core/util").Feature[]>;
}
