import React from 'react';
import type { SequenceStatus } from './SequenceStatus';
import type { Feature } from '@jbrowse/core/util';
export default function TranscriptSelector({ feature, options, selectedId, selectedTranscript, setSelectedId, proteinSequence, sequenceStatus, validIds, }: {
    feature: Feature;
    options: Feature[];
    selectedId: string;
    selectedTranscript: Feature | undefined;
    setSelectedId: (transcriptId: string) => void;
    proteinSequence: string | undefined;
    sequenceStatus?: SequenceStatus;
    validIds?: string[];
}): React.JSX.Element;
