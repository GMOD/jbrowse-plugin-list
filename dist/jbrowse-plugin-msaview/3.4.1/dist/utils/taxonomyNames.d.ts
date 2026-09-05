export interface TaxonomyInfo {
    sciname: string;
    commonName?: string;
}
export declare function fetchTaxonomyInfo(taxidsWithRepeats: number[]): Promise<Map<number, TaxonomyInfo>>;
