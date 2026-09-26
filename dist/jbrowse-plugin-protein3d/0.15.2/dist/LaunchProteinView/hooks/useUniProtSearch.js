import { isRecognizedDatabaseId, searchUniProtEntries } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
export function partialFailureNotice({ attemptedCount, failedCount, }) {
    return failedCount > 0 && failedCount < attemptedCount
        ? `UniProt lookup failed for ${failedCount} of ${attemptedCount} identifiers`
        : undefined;
}
export default function useUniProtSearch({ recognizedIds = [], geneId, geneName, organismId, selectedQueryId = 'auto', enabled = true, }) {
    // Determine what to search based on selectedQueryId
    let idsToSearch = [];
    let geneNameToSearch;
    if (selectedQueryId === 'auto') {
        idsToSearch = recognizedIds;
        geneNameToSearch = geneName;
    }
    else if (selectedQueryId.startsWith('gene:')) {
        geneNameToSearch = selectedQueryId.replace('gene:', '');
    }
    else if (isRecognizedDatabaseId(selectedQueryId)) {
        idsToSearch = [selectedQueryId];
    }
    const hasValidId = idsToSearch.some(id => isRecognizedDatabaseId(id)) ||
        Boolean(geneNameToSearch);
    const { data, error, isLoading } = useSWR(enabled && hasValidId
        ? [
            'uniprotSearch',
            selectedQueryId,
            idsToSearch.join(','),
            geneNameToSearch,
            geneId,
            organismId,
        ]
        : null, async () => searchUniProtEntries({
        recognizedIds: idsToSearch,
        geneId,
        geneName: geneNameToSearch,
        organismId,
    }), {
        ...STATIC_SWR_OPTIONS,
        keepPreviousData: true,
    });
    return {
        entries: data?.entries ?? [],
        isLoading,
        error,
        hasValidId,
        partialFailure: data ? partialFailureNotice(data) : undefined,
    };
}
