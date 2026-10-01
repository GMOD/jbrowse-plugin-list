import { jsonfetch, parseEntryMolecules, pdbeEntryMoleculesUrl, } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
export default function usePdbEntryMolecules(pdbId) {
    const { data, error, isLoading, isValidating } = useSWR(pdbId ? pdbeEntryMoleculesUrl(pdbId) : null, async (url) => parseEntryMolecules(await jsonfetch(url)), { ...STATIC_SWR_OPTIONS, keepPreviousData: true });
    // keepPreviousData holds the last entry's sequences while another loads, so
    // a caller labelling rows with them has to know the answer is not this row's
    return { sequences: data, error, isLoading, isValidating };
}
