import React from 'react';
import { Feature } from '@jbrowse/core/util';
export default function MSATable({ structureName, structureSequence, isoformSequences, }: {
    structureName: string;
    structureSequence: string;
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }>;
}): React.JSX.Element;
