import React from 'react';
import { Feature } from '@jbrowse/core/util';
export default function TranscriptSelector({ feature, options, selectedId, selectedTranscript, onTranscriptChange, proteinSequence, validSet, }: {
    feature: Feature;
    options: Feature[];
    selectedId: string;
    selectedTranscript: Feature | undefined;
    onTranscriptChange: (transcriptId: string) => void;
    proteinSequence: string | undefined;
    validSet?: Set<string>;
}): React.JSX.Element;
