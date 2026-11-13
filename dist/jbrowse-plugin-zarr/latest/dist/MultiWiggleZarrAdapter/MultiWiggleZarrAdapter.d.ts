import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { SignalMatrixMetadata } from './signalMatrixMetadata';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Feature, Region } from '@jbrowse/core/util';
import type { Observable } from 'rxjs';
import type { Array as ZarrArray, DataType, FetchStore, Group as ZarrGroup } from 'zarrita';
export interface RawFeatureArrays {
    starts: Int32Array;
    ends: Int32Array;
    scores: Float32Array;
    summary?: {
        minScores: Float32Array;
        maxScores: Float32Array;
    };
    count: number;
}
interface WiggleOptions extends BaseOptions {
    bpPerPx?: number;
    resolution?: number;
    sources?: {
        name: string;
    }[];
}
export default class MultiWiggleZarrAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private setupP?;
    private setupPre;
    setup(opts?: BaseOptions): Promise<{
        meta: SignalMatrixMetadata;
        group: ZarrGroup<FetchStore>;
        arrays: Map<string, Promise<ZarrArray<DataType, FetchStore>>>;
    }>;
    private openArray;
    getRefNames(opts?: BaseOptions): Promise<string[]>;
    private placeRegion;
    private planFetch;
    private fetchRegionSlabs;
    getMultiSourceFeatureArraysMulti(regions: Region[], opts?: WiggleOptions): Promise<{
        source: string;
        raws: RawFeatureArrays[];
    }[]>;
    getSources(_regions: Region[]): Promise<{
        source: string;
        name: string;
        group?: string;
        color?: string;
    }[]>;
    getFeatures(region: Region, opts?: WiggleOptions): Observable<Feature>;
}
export {};
