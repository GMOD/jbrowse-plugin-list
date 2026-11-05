export declare const MAX_CACHED_SEARCHES = 20;
export declare const MAX_AGE_MS: number;
export interface CachedSearch {
    id: string;
    fasta: string;
    treeMetadata: Record<string, Record<string, string>>;
    rid?: string;
    timestamp: number;
}
export declare function searchKey({ searchProgram, database, maxHits, querySeqName, query, }: {
    searchProgram: string;
    database: string;
    maxHits?: number;
    querySeqName: string;
    query: string;
}): string;
export declare function getCachedSearch(id: string): Promise<CachedSearch | undefined>;
export declare function saveSearch(entry: Omit<CachedSearch, 'timestamp'>): Promise<void | undefined>;
