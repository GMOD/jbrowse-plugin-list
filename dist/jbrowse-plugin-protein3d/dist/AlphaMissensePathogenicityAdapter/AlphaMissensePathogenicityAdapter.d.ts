import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Feature, Region } from '@jbrowse/core/util';
export default class AlphaMissensePathogenicityAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    feats: Promise<{
        uniqueId: string;
        start: number;
        end: number;
        score: number;
        ref: string;
        variant: string;
        am_class: string;
    }[]> | undefined;
    private loadDataP;
    private loadData;
    getGlobalStats(_opts?: BaseOptions): Promise<{
        scoreMin: number;
        scoreMax: number;
    }>;
    getMultiRegionFeatureDensityStats(_regions: Region[]): Promise<{
        featureDensity: number;
    }>;
    getRefNames(_opts?: BaseOptions): Promise<never[]>;
    getFeatures(query: Region, _opts?: BaseOptions): import("rxjs").Observable<Feature>;
    getSources(): Promise<{
        name: string;
        __name: string;
    }[]>;
    freeResources(): void;
}
