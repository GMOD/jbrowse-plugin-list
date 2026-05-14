import useSWR from 'swr';
import { fetchProteinSeq } from '../utils/calculateProteinSequence';
import { getTranscriptFeatures } from '../utils/util';
export default function useIsoformProteinSequences({ feature, view, }) {
    const { data, error, isLoading } = useSWR(['isoform-sequences', feature.id(), view?.assemblyNames?.[0]], async () => {
        const transcripts = getTranscriptFeatures(feature);
        const results = await Promise.all(transcripts.map(async (f) => {
            try {
                const seq = await fetchProteinSeq({ view, feature: f });
                return seq ? [f.id(), { feature: f, seq }] : undefined;
            }
            catch (e) {
                console.error('[useIsoformProteinSequences] error for', f.id(), e);
                return undefined;
            }
        }));
        return Object.fromEntries(results.filter(r => r !== undefined));
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
    });
    return { isLoading, isoformSequences: data, error };
}
//# sourceMappingURL=useIsoformProteinSequences.js.map