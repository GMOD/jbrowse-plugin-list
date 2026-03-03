import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Feature, Region } from '@jbrowse/core/util';
export default class BigMafAdapter extends BaseFeatureDataAdapter {
    setupP?: Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setup(): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    setupPre(): Promise<{
        adapter: BaseFeatureDataAdapter;
    }>;
    getRefNames(): Promise<string[]>;
    getHeader(): Promise<unknown>;
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
