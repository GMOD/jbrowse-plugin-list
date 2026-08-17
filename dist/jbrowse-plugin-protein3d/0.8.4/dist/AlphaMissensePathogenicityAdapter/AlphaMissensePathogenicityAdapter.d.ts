import { BaseProteinAnnotationAdapter, type ProteinAnnotationRow } from '../BaseProteinAnnotationAdapter';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Region } from '@jbrowse/core/util';
export interface AlphaMissenseRow extends ProteinAnnotationRow {
    score: number;
    ref: string;
    variant: string;
    am_class: string;
}
export declare function parseAlphaMissense(text: string): AlphaMissenseRow[];
export default class AlphaMissensePathogenicityAdapter extends BaseProteinAnnotationAdapter<AlphaMissenseRow> {
    protected loadFeatures(): Promise<AlphaMissenseRow[]>;
    protected featureData(row: AlphaMissenseRow, refName: string): {
        refName: string;
        source: string;
        score: number;
        ref: string;
        variant: string;
        am_class: string;
        uniqueId: string;
        start: number;
        end: number;
    };
    getGlobalStats(_opts?: BaseOptions): Promise<{
        scoreMin: number;
        scoreMax: number;
    }>;
    getMultiRegionFeatureDensityStats(_regions: Region[]): Promise<{
        featureDensity: number;
    }>;
    getSources(): Promise<{
        name: string;
        __name: string;
    }[]>;
}
