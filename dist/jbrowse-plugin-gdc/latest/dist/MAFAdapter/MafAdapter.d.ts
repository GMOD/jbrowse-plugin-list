import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Region } from '@jbrowse/core/util/types';
import type { Feature } from '@jbrowse/core/util/simpleFeature';
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
