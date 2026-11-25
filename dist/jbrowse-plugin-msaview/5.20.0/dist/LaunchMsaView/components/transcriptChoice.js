import React, { createContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { featureMatchesId, getId, getSortedTranscriptFeatures } from '../util';
import { useFeatureSequence } from './useFeatureSequence';
export const TranscriptChoiceContext = createContext(undefined);
export function defaultTranscriptId(options, preferredTranscriptId) {
    return getId(options.find(opt => featureMatchesId(opt, preferredTranscriptId ?? '')) ??
        options[0]);
}
export const TranscriptChoiceProvider = observer(function TranscriptChoiceProvider({ feature, view, preferredTranscriptId, children, }) {
    const options = useMemo(() => getSortedTranscriptFeatures(feature), [feature]);
    const pick = useState();
    const sequenceFor = pick[0] ?? defaultTranscriptId(options, preferredTranscriptId);
    const sequence = useFeatureSequence({
        view,
        feature: options.find(opt => getId(opt) === sequenceFor),
    });
    return (React.createElement(TranscriptChoiceContext.Provider, { value: { pick, sequenceFor, sequence } }, children));
});
