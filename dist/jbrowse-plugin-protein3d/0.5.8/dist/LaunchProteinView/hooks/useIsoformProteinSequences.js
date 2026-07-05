import { getSession } from '@jbrowse/core/util';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
import { fetchProteinSeq } from '../utils/calculateProteinSequence';
import { getTranscriptFeatures } from '../utils/util';
export default function useIsoformProteinSequences({ feature, view, }) {
    const { data, error, isLoading } = useSWR(['isoform-sequences', feature.id(), view?.assemblyNames?.[0]], async () => {
        const transcripts = getTranscriptFeatures(feature);
        const errors = [];
        const results = await Promise.all(transcripts.map(async (f) => {
            try {
                const seq = await fetchProteinSeq({
                    session: getSession(view),
                    assemblyName: view?.assemblyNames?.[0],
                    feature: f,
                });
                return seq ? [f.id(), { feature: f, seq }] : undefined;
            }
            catch (e) {
                console.error('[useIsoformProteinSequences] error for', f.id(), e);
                errors.push(e);
                return undefined;
            }
        }));
        const entries = results.filter(r => r !== undefined);
        // If every transcript fetch failed, surface the underlying error rather
        // than silently returning {} — otherwise the UI shows the misleading
        // "feature may be missing CDS subfeatures" hint with no actual cause.
        if (entries.length === 0 &&
            errors.length === transcripts.length &&
            errors.length > 0) {
            throw errors[0];
        }
        return Object.fromEntries(entries);
    }, {
        ...STATIC_SWR_OPTIONS,
        keepPreviousData: true,
    });
    return { isLoading, isoformSequences: data, error };
}
