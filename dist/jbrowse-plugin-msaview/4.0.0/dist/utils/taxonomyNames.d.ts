export interface TaxonomyInfo {
    sciname: string;
    commonName?: string;
}
export declare function fetchTaxonomyInfo(taxidsWithRepeats: number[], signal?: AbortSignal): Promise<Map<number, TaxonomyInfo>>;
