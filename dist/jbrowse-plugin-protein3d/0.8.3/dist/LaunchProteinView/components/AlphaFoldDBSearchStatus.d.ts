import React from 'react';
import type { IsoformSequences } from '../utils/util';
import type { Feature } from '@jbrowse/core/util';
export default function AlphaFoldDBSearchStatus({ uniprotId, selectedTranscript, structureSequence, isoformSequences, url, }: {
    uniprotId?: string;
    selectedTranscript?: Feature;
    structureSequence?: string;
    isoformSequences: IsoformSequences;
    url?: string;
}): React.JSX.Element;
