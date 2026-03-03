import type { UniProtEntry } from '../services/lookupMethods';
export default function useUniProtSearch({ recognizedIds, uniprotId, geneId, geneName, selectedQueryId, enabled, }: {
    recognizedIds?: string[];
    uniprotId?: string;
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
