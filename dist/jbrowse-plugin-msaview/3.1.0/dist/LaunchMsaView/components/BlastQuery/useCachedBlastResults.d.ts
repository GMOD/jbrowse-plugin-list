export declare function useCachedBlastResults(geneIds: string[]): {
    results: import("../../../utils/blastCache").CachedBlastResult[];
    error: unknown;
    isLoading: boolean;
    handleDelete: (id: string) => Promise<void>;
    handleClearAll: () => Promise<void>;
};
