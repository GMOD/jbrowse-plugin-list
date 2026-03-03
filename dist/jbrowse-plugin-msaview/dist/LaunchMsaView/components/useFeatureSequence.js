import { getProteinSequenceFromFeature } from './calculateProteinSequence';
import { useSWRFeatureSequence } from './useSWRFeatureSequence';
export function useFeatureSequence({ view, feature, upDownBp = 0, forceLoad = true, }) {
    const { sequence, error } = useSWRFeatureSequence({
        view,
        feature,
        upDownBp,
        forceLoad,
    });
    const proteinSequence = sequence && !('error' in sequence) && feature
        ? getProteinSequenceFromFeature({
            seq: sequence.seq,
            feature,
        })
        : '';
    return {
        proteinSequence,
        sequence,
        error,
    };
}
//# sourceMappingURL=useFeatureSequence.js.map