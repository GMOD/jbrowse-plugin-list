export interface TaxonomyInfo {
    sciname: string;
    commonName?: string;
}
/**
 * Names are a nicety, so a batch NCBI refuses leaves its taxa out of the
 * result rather than failing the caller. `onFailure` hears about each one, for
 * a caller that wants to say the names are missing.
 */
export declare function fetchTaxonomyInfo(taxidsWithRepeats: number[], signal?: AbortSignal, onFailure?: (error: unknown) => void): Promise<Map<number, TaxonomyInfo>>;
