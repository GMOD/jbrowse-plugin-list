import { useContext, useMemo, useState } from 'react';
import { getId, getSortedTranscriptFeatures } from '../util';
import { TranscriptChoiceContext, defaultTranscriptId, } from './transcriptChoice';
import { useFeatureSequence } from './useFeatureSequence';
// Keep the current selection if it has data, otherwise fall back to the first
// option that does (or the current id if none do). With no hasData constraint
// the current selection always stands.
export function pickSelectedId(currentId, options, hasData) {
    if (!hasData) {
        return currentId;
    }
    const current = options.find(opt => getId(opt) === currentId);
    if (current && hasData(current)) {
        return currentId;
    }
    const firstValid = options.find(hasData);
    return firstValid ? getId(firstValid) : currentId;
}
/**
 * Submit is disabled until the query sequence is in hand, and a grey button
 * reads the same whether the translation is on its way or was never going to
 * arrive. `missing` is the second case: the feature has no CDS to translate,
 * which the dialog never said.
 */
function sequenceStatus({ error, isLoading, proteinSequence, }) {
    if (error) {
        return 'error';
    }
    if (isLoading) {
        return 'loading';
    }
    return proteinSequence ? 'ready' : 'missing';
}
export function useTranscriptSelection({ feature, view, hasData, preferredTranscriptId, }) {
    const options = useMemo(() => getSortedTranscriptFeatures(feature), [feature]);
    const choice = useContext(TranscriptChoiceContext);
    const ownPick = useState();
    const [pickedId, setSelectedId] = choice?.pick ?? ownPick;
    const validatedSelectedId = pickSelectedId(pickedId ?? defaultTranscriptId(options, preferredTranscriptId), options, hasData);
    const selectedTranscript = options.find(val => getId(val) === validatedSelectedId);
    const sharedSequence = choice?.sequenceFor === validatedSelectedId ? choice.sequence : undefined;
    const ownSequence = useFeatureSequence({
        view,
        feature: sharedSequence ? undefined : selectedTranscript,
    });
    const { proteinSequence, error, isLoading } = sharedSequence ?? ownSequence;
    return {
        options,
        selectedId: validatedSelectedId,
        setSelectedId,
        selectedTranscript,
        proteinSequence,
        error,
        isLoading,
        sequenceStatus: sequenceStatus({ error, isLoading, proteinSequence }),
        hasData,
    };
}
