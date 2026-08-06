import { getProteinSequenceFromFeature } from './calculateProteinSequence';
import { useSWRFeatureSequence } from './useSWRFeatureSequence';
export function useFeatureSequence({ view, feature, }) {
    const { sequence, error } = useSWRFeatureSequence({
        view,
        feature,
    });
    const proteinSequence = sequence && feature
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
