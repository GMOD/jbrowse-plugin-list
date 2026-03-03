import { BaseAdapter, BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
export default class BgzipFastaMsaAdapter extends BaseAdapter {
    configureP: Promise<BaseFeatureDataAdapter> | undefined;
    refNamesP: Promise<string[]> | undefined;
    configurePre(): Promise<BaseFeatureDataAdapter>;
    configure(): Promise<BaseFeatureDataAdapter>;
    getMSARefs(): Promise<string[]>;
    getMSAList(): Promise<string[]>;
    getMSA(id: string): Promise<import("@jbrowse/core/util").Feature[]>;
}
