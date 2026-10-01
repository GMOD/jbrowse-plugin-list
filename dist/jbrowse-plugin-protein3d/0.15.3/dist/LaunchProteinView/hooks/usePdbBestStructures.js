import { httpError, parseBestStructures, pdbeBestStructuresUrl, rawfetch, } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
// PDBe answers 404 for an accession with no experimental structure, which is
// the ordinary case for most genes rather than a failure.
async function fetchBestStructures(url) {
    const response = await rawfetch(url);
    if (response.status === 404) {
        return [];
    }
    if (!response.ok) {
        throw await httpError(response, url);
    }
    return parseBestStructures(await response.json());
}
export default function usePdbBestStructures(uniprotId) {
    const { data, error, isLoading } = useSWR(uniprotId ? pdbeBestStructuresUrl(uniprotId) : null, fetchBestStructures, STATIC_SWR_OPTIONS);
    return { entries: data, error, isLoading };
}
