import useSWR from 'swr';
import { searchUniProtEntries } from '../services/lookupMethods';
import { isRecognizedDatabaseId } from '../utils/util';
export default function useUniProtSearch({ recognizedIds = [], geneId, geneName, selectedQueryId = 'auto', enabled = true, }) {
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
        ? ['uniprotSearch', selectedQueryId, idsToSearch.join(','), geneNameToSearch]
        : null, async () => searchUniProtEntries({
        recognizedIds: idsToSearch,
        geneId,
        geneName: geneNameToSearch,
    }), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
    });
    return {
        entries: data ?? [],
        isLoading,
        error,
        hasValidId,
    };
}
