import { useMemo, useState } from 'react';
import { featureMatchesId, getId, getSortedTranscriptFeatures } from '../util';
import { useFeatureSequence } from './useFeatureSequence';
function findValidSelection(currentId, options, validIds) {
    if (validIds && validIds.length > 0) {
        const currentFeature = options.find(opt => getId(opt) === currentId);
        const currentIsValid = currentFeature &&
            validIds.some(id => featureMatchesId(currentFeature, id));
        if (currentFeature && !currentIsValid) {
            const validOption = options.find(opt => validIds.some(id => featureMatchesId(opt, id)));
            return validOption ? getId(validOption) : undefined;
        }
    }
    return undefined;
}
export function useTranscriptSelection({ feature, view, validIds, }) {
    const options = useMemo(() => getSortedTranscriptFeatures(feature), [feature]);
    const [selectedId, setSelectedId] = useState(() => getId(options[0]));
    const validatedSelectedId = findValidSelection(selectedId, options, validIds) ?? selectedId;
    const selectedTranscript = options.find(val => getId(val) === validatedSelectedId);
    const { proteinSequence, error } = useFeatureSequence({
        view,
        feature: selectedTranscript,
    });
    return {
        options,
        selectedId: validatedSelectedId,
        setSelectedId,
        selectedTranscript,
        proteinSequence,
        error,
        validIds,
    };
}
