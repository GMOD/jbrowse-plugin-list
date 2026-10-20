import { myfetch, uniprotGffUrl } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from '../../LaunchProteinView/hooks/swrOptions';
function decodedNote(note) {
    try {
        return decodeURIComponent(note);
    }
    catch {
        return note;
    }
}
export function parseUniProtGff(text) {
    const features = [];
    for (const line of text.split('\n')) {
        if (line.startsWith('#') || !line.trim()) {
            continue;
        }
        const parts = line.split('\t');
        if (parts.length < 9) {
            continue;
        }
        const type = parts[2];
        const start = Number.parseInt(parts[3] ?? '', 10);
        const end = Number.parseInt(parts[4] ?? '', 10);
        const attributes = parts[8] ?? '';
        const note = attributes
            .split(';')
            .find(attr => attr.startsWith('Note='))
            ?.slice('Note='.length);
        if (type && start >= 1 && end >= start) {
            features.push({
                type,
                start,
                end,
                description: decodedNote(note ?? ''),
                uniqueId: `${type}-${start}-${end}-${features.length}`,
            });
        }
    }
    return features;
}
async function fetchUniProtFeatures(url) {
    return parseUniProtGff(await (await myfetch(url)).text());
}
export default function useUniProtFeatures(uniprotId) {
    const { data, error, isLoading } = useSWR(uniprotId ? uniprotGffUrl(uniprotId) : null, fetchUniProtFeatures, 
    // A UniProt entry's GFF is static reference data, so the default
    // refetch-on-focus/reconnect only re-downloads and re-lays out the tracks.
    STATIC_SWR_OPTIONS);
    return {
        features: data,
        error,
        isLoading,
    };
}
