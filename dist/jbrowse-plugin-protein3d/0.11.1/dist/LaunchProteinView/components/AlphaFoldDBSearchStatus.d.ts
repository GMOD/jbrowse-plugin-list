import React from 'react';
import type { IsoformSequences } from '../utils/util';
export default function AlphaFoldDBSearchStatus({ uniprotId, structureSequence, isoformSequences, url, }: {
    uniprotId: string;
    structureSequence: string;
    isoformSequences: IsoformSequences;
    url?: string;
}): React.JSX.Element;
