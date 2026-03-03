import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Region } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
import { Instance } from 'mobx-state-tree';
import { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import MyConfigSchema from './configSchema';
export default class GDCAdapter extends BaseFeatureDataAdapter {
    private filters;
    private cases;
    private size;
    private featureType;
    static capabilities: string[];
    private featureCache;
    fetchFeatures(query: any, signal?: AbortSignal): Promise<any>;
    constructor(config: Instance<typeof MyConfigSchema>);
    getRefNames(): Promise<string[]>;
    getFeatures(region: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
    /**
     * Create a GraphQL query for GDC mutations
     * @param ref - chromosome reference
     * @param start - start position
     * @param end - end position
     */
    private createMutationQuery;
    /**
     * Create a GraphQL query for GDC genes
     * @param ref - chromosome reference
     * @param start - start position
     * @param end - end position
     */
    private createGeneQuery;
    /**
     * Create the full filter based on the given filter, location and case(s)
     * @param chr - chromosome (ex. 1)
     * @param start - start position
     * @param end - end position
     */
    private getFilterQuery;
    /**
     * Create a filter for the current visible location and case(s)
     * @param chr - chromosome (ex. 1)
     * @param start - start position
     * @param end - end position
     */
    private addLocationAndCasesToFilter;
}
