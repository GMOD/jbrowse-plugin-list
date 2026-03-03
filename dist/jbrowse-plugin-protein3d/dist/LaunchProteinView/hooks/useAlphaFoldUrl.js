import useSWR from 'swr';
import { jsonfetch } from '../../fetchUtils';
export default function useAlphaFoldUrl({ uniprotId }) {
    const { data, error, isLoading } = useSWR(uniprotId
        ? `https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}`
        : null, jsonfetch, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
    });
    return {
        isLoading,
        predictions: data,
        error,
    };
}
//# sourceMappingURL=useAlphaFoldUrl.js.map