import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Feature, Region } from '@jbrowse/core/util';
export default class MafTabixAdapter extends BaseFeatureDataAdapter {
    setupP?: Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setupPre(): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setupPre2(): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setup(opts?: BaseOptions): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    getRefNames(opts?: BaseOptions): Promise<string[]>;
    getHeader(opts?: BaseOptions): Promise<unknown>;
    getFeatures(query: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    getSamples(_query: Region): Promise<{
        samples: {
            id: string;
            label?: string;
            color?: string;
        }[];
        tree: Record<string, any> | undefined;
    }>;
    freeResources(): void;
}
