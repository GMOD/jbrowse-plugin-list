/** the documents a view keeps in IndexedDB rather than in its session snapshot */
export interface MsaDataPayload {
    msa?: string;
    tree?: string;
    treeMetadata?: string;
    gff?: string;
}
export declare function generateDataStoreId(): string;
export declare function storeMsaData(id: string, data: MsaDataPayload): Promise<boolean>;
/** undefined only when no row has the id; a failed read throws */
export declare function retrieveMsaData(id: string): Promise<{
    msa?: string;
    tree?: string;
    treeMetadata?: string;
    gff?: string;
} | undefined>;
export declare function cleanupOldData(maxAgeMs?: number): Promise<number>;
