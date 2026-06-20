import React from 'react';
import type { Feature } from '@jbrowse/core/util';
export default function IsoformSequencesToggle({ structureSequence, structureName, isoformSequences, }: {
    structureSequence: string;
    structureName: string;
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }>;
}): React.JSX.Element;
