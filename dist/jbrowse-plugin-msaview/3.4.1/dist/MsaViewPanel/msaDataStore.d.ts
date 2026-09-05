/** the documents a view keeps in IndexedDB rather than in its session snapshot */
export interface MsaDataPayload {
    msa?: string;
    tree?: string;
    treeMetadata?: string;
}
export declare function generateDataStoreId(): string;
export declare function storeMsaData(id: string, data: MsaDataPayload): Promise<boolean>;
export declare function retrieveMsaData(id: string): Promise<{
    msa: string | undefined;
    tree: string | undefined;
    treeMetadata: string | undefined;
} | undefined>;
export declare function cleanupOldData(maxAgeMs?: number): Promise<number>;
