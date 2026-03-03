import useSWR from 'swr';
import { fetchProteinSeq } from '../utils/calculateProteinSequence';
import { getTranscriptFeatures } from '../utils/util';
export default function useIsoformProteinSequences({ feature, view, }) {
    const { data, error, isLoading } = useSWR(['isoform-sequences', feature.id(), view?.assemblyNames?.[0]], async () => {
        const ret = [];
        const transcripts = getTranscriptFeatures(feature);
        for (const f of transcripts) {
            try {
                const seq = await fetchProteinSeq({
                    view,
                    feature: f,
                });
                if (seq) {
                    ret.push([f.id(), { feature: f, seq }]);
                }
            }
            catch (e) {
                console.error('[useIsoformProteinSequences] error for', f.id(), e);
            }
        }
        return Object.fromEntries(ret);
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
    });
    return { isLoading, isoformSequences: data, error };
}
//# sourceMappingURL=useIsoformProteinSequences.js.map