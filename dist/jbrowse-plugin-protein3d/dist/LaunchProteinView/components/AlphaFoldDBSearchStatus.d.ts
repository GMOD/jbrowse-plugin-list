import React from 'react';
import { Feature } from '@jbrowse/core/util';
export default function AlphaFoldDBSearchStatus({ uniprotId, selectedTranscript, structureSequence, isoformSequences, url, }: {
    uniprotId?: string;
    selectedTranscript?: Feature;
    structureSequence?: string;
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }>;
    url?: string;
}): React.JSX.Element;
