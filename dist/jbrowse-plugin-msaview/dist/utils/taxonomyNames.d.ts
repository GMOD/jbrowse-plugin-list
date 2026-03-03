export interface TaxonomyInfo {
    sciname: string;
    commonName?: string;
}
export declare function fetchTaxonomyInfo(taxids: number[]): Promise<Map<number, TaxonomyInfo>>;
