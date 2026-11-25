import type { Feature } from '@jbrowse/core/util';
export declare function useCachedBlastResults(feature: Feature): {
    results: import("../../../utils/blastCache").CachedBlastResult[];
    error: unknown;
    isLoading: boolean;
    handleDelete: (id: string) => Promise<void>;
    handleClearAll: () => Promise<void>;
};
