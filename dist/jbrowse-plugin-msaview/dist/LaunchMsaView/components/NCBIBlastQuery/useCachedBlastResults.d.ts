export declare function useCachedBlastResults(geneIds: string[]): {
    results: any[];
    error: any;
    isLoading: boolean;
    handleDelete: (id: string) => Promise<void>;
    handleClearAll: () => Promise<void>;
};
