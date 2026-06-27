import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Feature, Region } from '@jbrowse/core/util';
import type { Observable } from 'rxjs';
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
    getFeatures(query: Region, _opts?: BaseOptions): Observable<Feature>;
    freeResources(): void;
}
