import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Feature, Region } from '@jbrowse/core/util';
import type { MafAdapterOptions } from '../types';
export default class MafTabixAdapter extends BaseFeatureDataAdapter {
    setupP?: Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setup(): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setupPre(opts?: BaseOptions): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    getRefNames(opts?: BaseOptions): Promise<string[]>;
    getHeader(opts?: BaseOptions): Promise<unknown>;
    getFeatures(query: Region, opts?: MafAdapterOptions): import("rxjs").Observable<Feature>;
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
