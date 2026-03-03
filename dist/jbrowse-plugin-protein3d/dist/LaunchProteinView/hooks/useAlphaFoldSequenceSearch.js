import { useMemo } from 'react';
import useSWR from 'swr';
import { jsonfetch } from '../../fetchUtils';
import { md5 } from '../utils/md5';
import { stripStopCodon } from '../utils/util';
export default function useAlphaFoldSequenceSearch({ sequence, searchType, enabled = true, }) {
    const searchValue = useMemo(() => {
        if (!sequence) {
            return undefined;
        }
        const cleanSeq = stripStopCodon(sequence.toUpperCase());
        return searchType === 'md5' ? md5(cleanSeq) : cleanSeq;
    }, [sequence, searchType]);
    const { data, error, isLoading } = useSWR(enabled && searchValue
        ? `https://alphafold.ebi.ac.uk/api/sequence/summary?id=${encodeURIComponent(searchValue)}&type=${searchType}`
        : null, jsonfetch, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
    });
    return {
        isLoading,
        result: data,
        uniprotId: data?.uniprotAccession,
        cifUrl: data?.cifUrl,
        plddtDocUrl: data?.plddtDocUrl,
        structureSequence: data?.sequence,
        error,
    };
}
//# sourceMappingURL=useAlphaFoldSequenceSearch.js.map