import useSWR from 'swr';
import { clearAllCachedResults, deleteCachedResult, getAllCachedResults, } from '../../../utils/blastCache';
const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    shouldRetryOnError: false,
};
export function useCachedBlastResults(geneIds) {
    const { data: results, error, mutate, } = useSWR(`cached-blast-${geneIds.join(',')}`, async () => {
        const cached = await getAllCachedResults();
        return cached.filter(r => r.geneId && geneIds.includes(r.geneId));
    }, swrConfig);
    const handleDelete = async (id) => {
        await deleteCachedResult(id);
        await mutate(results => results?.filter(result => result.id !== id) ?? [], false);
    };
    const handleClearAll = async () => {
        await clearAllCachedResults();
        await mutate([], false);
    };
    return {
        results: results ?? [],
        error,
        isLoading: !results && !error,
        handleDelete,
        handleClearAll,
    };
}
//# sourceMappingURL=useCachedBlastResults.js.map