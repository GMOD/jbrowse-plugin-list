import React from 'react';
import type { SequenceStatus } from './SequenceStatus';
import type { Feature } from '@jbrowse/core/util';
declare const TranscriptSelector: ({ feature, options, selectedId, selectedTranscript, setSelectedId, proteinSequence, sequenceStatus, hasData, }: {
    feature: Feature;
    options: Feature[];
    selectedId: string;
    selectedTranscript: Feature | undefined;
    setSelectedId: (transcriptId: string) => void;
    proteinSequence: string | undefined;
    sequenceStatus?: SequenceStatus;
    hasData?: (transcript: Feature) => boolean;
}) => React.JSX.Element;
export default TranscriptSelector;
