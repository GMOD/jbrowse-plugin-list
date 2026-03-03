import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Region } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
/**
 * Splice Junction Quantification Adapter
 */
export default class SjqAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private setupP?;
    private readSjq;
    private decodeFileContents;
    private parseLine;
    private getLines;
    private setup;
    getRefNames(_?: BaseOptions): Promise<string[]>;
    getFeatures(region: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
