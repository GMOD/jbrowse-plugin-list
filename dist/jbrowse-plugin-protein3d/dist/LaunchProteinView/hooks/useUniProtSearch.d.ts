import type { UniProtEntry } from '../services/lookupMethods';
export default function useUniProtSearch({ recognizedIds, geneId, geneName, selectedQueryId, enabled, }: {
    recognizedIds?: string[];
    geneId?: string;
    geneName?: string;
    selectedQueryId?: string;
    enabled?: boolean;
}): {
    entries: UniProtEntry[];
    isLoading: boolean;
    error: any;
    hasValidId: boolean;
};
