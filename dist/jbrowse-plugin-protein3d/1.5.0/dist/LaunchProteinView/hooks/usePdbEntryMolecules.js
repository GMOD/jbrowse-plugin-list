import { jsonfetch, parseEntryMolecules, pdbeEntryMoleculesUrl, } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
export default function usePdbEntryMolecules(pdbId) {
    const { data, error, isLoading, isValidating } = useSWR(pdbId ? pdbeEntryMoleculesUrl(pdbId) : null, async (url) => parseEntryMolecules(await jsonfetch(url)), STATIC_SWR_OPTIONS);
    return { sequences: data, error, isLoading, isValidating };
}
