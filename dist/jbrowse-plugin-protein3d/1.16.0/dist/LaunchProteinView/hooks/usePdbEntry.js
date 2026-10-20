import { fetchPdbEntry } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
// The entry's protein sequences rank the isoforms and label the picker: a few
// kB of JSON from RCSB, where reading them out of the structure file meant
// downloading and parsing the whole mmCIF, minutes for a ribosome.
export default function usePdbEntry(pdbId) {
    const { data, error, isLoading, isValidating } = useSWR(pdbId ? ['pdb-entry', pdbId] : null, ([, id]) => fetchPdbEntry(id), STATIC_SWR_OPTIONS);
    return { entry: data, error, isLoading, isValidating };
}
