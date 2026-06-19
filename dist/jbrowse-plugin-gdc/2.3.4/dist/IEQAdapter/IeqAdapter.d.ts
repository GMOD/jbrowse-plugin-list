import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Region } from '@jbrowse/core/util/types';
import type { Feature } from '@jbrowse/core/util';
/**
 * Isoform Expression Quantification Adapter
 */
export default class IeqAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private setupP?;
    private readIeq;
    private parseCoords;
    private parseLine;
    private getLines;
    private setup;
    getRefNames(_?: BaseOptions): Promise<string[]>;
    getFeatures(region: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
