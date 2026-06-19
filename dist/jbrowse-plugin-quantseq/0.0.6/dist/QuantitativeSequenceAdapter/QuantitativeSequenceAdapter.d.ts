import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { NoAssemblyRegion } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
interface WiggleOptions extends BaseOptions {
    resolution?: number;
}
export default class QuantitativeSequenceAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private sequenceAdapter;
    private wiggleAdapter;
    private setup;
    getRefNames(opts?: BaseOptions): Promise<any>;
    getGlobalStats(opts?: BaseOptions): Promise<any>;
    getFeatures(region: NoAssemblyRegion & {
        originalRefName?: string;
    }, opts?: WiggleOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
export {};
