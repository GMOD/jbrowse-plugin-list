import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Feature, Region } from '@jbrowse/core/util';
import type { Observable } from 'rxjs';
export interface AlphaMissenseRow {
    uniqueId: string;
    start: number;
    end: number;
    score: number;
    ref: string;
    variant: string;
    am_class: string;
}
/**
 * Parses AlphaMissense CSV text (protein_variant,score,am_class). The
 * protein_variant column looks like "V123L": a ref AA, a 1-based residue
 * coordinate, and a variant AA. Rows that don't parse to a numeric coordinate
 * are skipped rather than emitted as bogus position-0 features.
 */
export declare function parseAlphaMissense(text: string): AlphaMissenseRow[];
export default class AlphaMissensePathogenicityAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    feats: Promise<AlphaMissenseRow[]> | undefined;
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
    getFeatures(query: Region, _opts?: BaseOptions): Observable<Feature>;
    getSources(): Promise<{
        name: string;
        __name: string;
    }[]>;
    freeResources(): void;
}
