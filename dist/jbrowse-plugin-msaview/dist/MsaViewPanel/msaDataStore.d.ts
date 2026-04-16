export declare function generateDataStoreId(): string;
export declare function storeMsaData(id: string, data: {
    msa?: string;
    tree?: string;
    treeMetadata?: string;
}): Promise<boolean>;
export declare function retrieveMsaData(id: string): Promise<{
    msa: string | undefined;
    tree: string | undefined;
    treeMetadata: string | undefined;
} | undefined>;
export declare function deleteMsaData(id: string): Promise<void>;
export declare function cleanupOldData(maxAgeMs?: number): Promise<number>;
