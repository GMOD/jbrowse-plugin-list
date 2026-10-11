import { useMemo } from 'react';
import { fetchAlphaFoldModels, pickAlphaFoldModel } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
import useIsoformProteinSequences from './useIsoformProteinSequences';
/** The AlphaFold DB model a launch opens for this gene's accession. */
export default function useAlphaFoldData({ uniprotId, feature, view, }) {
    const { data, isLoading, isValidating, error } = useSWR(uniprotId ? ['alphafold-models', uniprotId] : null, ([, id]) => fetchAlphaFoldModels(id), { ...STATIC_SWR_OPTIONS, keepPreviousData: true });
    const { isoformSequences } = useIsoformProteinSequences({ feature, view });
    // keepPreviousData hands back the last accession's models after an error
    // and after the accession is cleared, when the key is null
    const model = useMemo(() => uniprotId && data && !error
        ? pickAlphaFoldModel(data, isoformSequences)
        : undefined, [uniprotId, data, error, isoformSequences]);
    return {
        isLoading,
        isValidating,
        error,
        model,
        noModel: !!uniprotId && !isLoading && !error && data?.length === 0,
    };
}
