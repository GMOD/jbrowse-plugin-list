import { BaseSequenceAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { type Feature } from '@jbrowse/core/util/simpleFeature';
import type { NoAssemblyRegion, Region } from '@jbrowse/core/util/types';
export interface RefSeq {
    _id: string;
    name: string;
    description: string;
    length: number;
}
export declare class ApolloSequenceAdapter extends BaseSequenceAdapter {
    private regions;
    getRefNames(): Promise<string[]>;
    getRegions(): Promise<NoAssemblyRegion[]>;
    /**
     * Fetch features for a certain region
     * @param param -
     * @returns Observable of Feature objects in the region
     */
    getFeatures(region: Region): import("rxjs").Observable<Feature>;
    /**
     * called to provide a hint that data tied to a certain region
     * will not be needed for the foreseeable future and can be purged
     * from caches, etc
     */
    freeResources(): void;
}
//# sourceMappingURL=ApolloSequenceAdapter.d.ts.map