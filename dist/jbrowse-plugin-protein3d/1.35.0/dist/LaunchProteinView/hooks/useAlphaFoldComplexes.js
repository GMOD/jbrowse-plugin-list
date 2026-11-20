import { useMemo } from 'react';
import { fetchAlphaFoldComplexModel, fetchAlphaFoldComplexes } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
/** Homomers first, as the protein's own assembly, then the partners AlphaFold
 * is surest of how they sit together */
export function rankAlphaFoldComplexes(complexes) {
    return [...complexes].sort((a, b) => Number(b.homomer) - Number(a.homomer) || (b.iptm ?? 0) - (a.iptm ?? 0));
}
/** Every complex AlphaFold DB predicted with an accession's protein in it.
 * An isoform's complexes are its entry's. */
export function useAlphaFoldComplexes(uniprotId) {
    const entry = uniprotId?.replace(/-\d+$/, '');
    const { data, error, isLoading } = useSWR(entry ? ['alphafold-complexes', entry] : null, ([, id]) => fetchAlphaFoldComplexes(id), STATIC_SWR_OPTIONS);
    const complexes = useMemo(() => (data ? rankAlphaFoldComplexes(data) : undefined), [data]);
    const complexesError = error;
    return { complexes, error: complexesError, isLoading };
}
/** One complex's file and the protein of each of its chains, asked for once
 * the complex is chosen */
export function useAlphaFoldComplexModel(entity) {
    const { data, error, isLoading } = useSWR(entity ? ['alphafold-complex-model', entity] : null, async ([, id]) => {
        const model = await fetchAlphaFoldComplexModel(id);
        if (!model) {
            throw new Error(`AlphaFold DB has no files for complex ${id}`);
        }
        return model;
    }, STATIC_SWR_OPTIONS);
    const modelError = error;
    return { model: data, error: modelError, isLoading };
}
