import type { UniProtEntry } from '../services/lookupMethods';
export default function useUniProtSearch({ recognizedIds, geneId, geneName, organismId, selectedQueryId, enabled, }: {
    recognizedIds?: string[];
    geneId?: string;
    geneName?: string;
    organismId?: number;
    selectedQueryId?: string;
    enabled?: boolean;
}): {
    entries: UniProtEntry[];
    isLoading: boolean;
    error: any;
    hasValidId: boolean;
};
