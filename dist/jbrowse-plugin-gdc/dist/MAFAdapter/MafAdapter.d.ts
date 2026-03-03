import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Region } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
export default class MafAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private setupP?;
    private readMaf;
    private parseLine;
    private decodeFileContents;
    private getLines;
    private setup;
    getRefNames(_?: BaseOptions): Promise<string[]>;
    getFeatures(region: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
