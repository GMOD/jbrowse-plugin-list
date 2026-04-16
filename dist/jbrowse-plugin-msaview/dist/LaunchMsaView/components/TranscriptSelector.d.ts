import React from 'react';
import type { Feature } from '@jbrowse/core/util';
export default function TranscriptSelector({ feature, options, selectedId, selectedTranscript, onTranscriptChange, proteinSequence, validIds, }: {
    feature: Feature;
    options: Feature[];
    selectedId: string;
    selectedTranscript: Feature | undefined;
    onTranscriptChange: (transcriptId: string) => void;
    proteinSequence: string | undefined;
    validIds?: string[];
}): React.JSX.Element;
