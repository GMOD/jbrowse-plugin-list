import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Feature, Region } from '@jbrowse/core/util';
export default class AlphaFoldConfidenceAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    feats: Promise<{
        uniqueId: string;
        start: number;
        end: number;
        score: number;
    }[]> | undefined;
    private loadDataP;
    private loadData;
    getRefNames(_opts?: BaseOptions): Promise<never[]>;
    getFeatures(query: Region, _opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
