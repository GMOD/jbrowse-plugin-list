import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Region } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
import { AnyConfigurationModel } from '@jbrowse/core/configuration/configurationSchema';
export default class GDCJSONAdapter extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private featureType;
    private data;
    private totalData;
    private setupP?;
    private featureCache;
    fetchFeatures(query: any, signal?: AbortSignal): Promise<any>;
    constructor(config: AnyConfigurationModel);
    /**
     * converts each property of an object from snake case to camel case
     * @param src -- source object with properties
     * @returns property converted to camel case
     */
    private convertPropertyCaseToCamel;
    /**
     * constructs a mutation from a JSON object parsed from the given JSON file
     * @param obj the json object to be constructed according to how GDCFeature needs it
     * @returns a gdcObject that can be processed by GDCFeature
     */
    private constructMutation;
    /**
     * constructs a gene from a JSON object parsed from the given JSON file
     * @param obj the json object to be constructed according to how GDCFeature needs it
     * @param opts base options
     * @returns a gdcObject that can be processed by GDCFeature
     */
    private constructGene;
    /**
     * Create a GraphQL query for GDC genes
     * @param geneId -- the gene id to be queried and returned
     */
    private createGeneQueryById;
    /**
     * processed a list of features from the data parsed from the file
     * @param parsed -- the data parsed from the file, a JSON object
     * @param opts -- the base options
     * @returns a list of features created from the parsed data
     */
    private getConstructedFeatures;
    /**
     * sets up the features to be passed and processed by the observer
     * @param parsed -- the parsed data from the file, a JSON object
     * @param opts -- the base options
     * @returns a promise of the list of GDCFeatures
     */
    private setup;
    getRefNames(): Promise<string[]>;
    getFeatures(region: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
