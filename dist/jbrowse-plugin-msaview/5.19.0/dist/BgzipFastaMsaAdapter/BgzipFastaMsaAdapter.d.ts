import { BaseAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { MsaIndexEntry } from '../utils/msaIndex';
import type { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { FileLocation } from '@jbrowse/core/util';
export default class BgzipFastaMsaAdapter extends BaseAdapter {
    configureP: Promise<BaseFeatureDataAdapter> | undefined;
    msaRowsP: Promise<Map<string, string[]>> | undefined;
    msaIndexP: Promise<Map<string, MsaIndexEntry> | undefined> | undefined;
    configurePre(): Promise<BaseFeatureDataAdapter<import("@jbrowse/core/configuration").AnyConfigurationModel>>;
    configure(): Promise<BaseFeatureDataAdapter<import("@jbrowse/core/configuration").AnyConfigurationModel>>;
    readMsaIndex(location: FileLocation): Promise<Map<string, {
        name: string;
        offset: number;
        length: number;
    }>>;
    loadMsaIndex(): Promise<Map<string, {
        name: string;
        offset: number;
        length: number;
    }> | undefined>;
    getMsaIndex(): Promise<Map<string, MsaIndexEntry> | undefined>;
    groupRows(): Promise<Map<string, string[]>>;
    getMSARows(): Promise<Map<string, string[]>>;
    getMSAList(): Promise<string[]>;
    readIndexedMSA(index: Map<string, MsaIndexEntry>, id: string): Promise<string>;
    readRowsMSA(id: string): Promise<string>;
    getMSA(id: string): Promise<{
        msa: string;
    }>;
}
