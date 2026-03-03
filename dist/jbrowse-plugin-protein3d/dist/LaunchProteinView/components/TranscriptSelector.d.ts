import React from 'react';
import { Feature } from '@jbrowse/core/util';
export default function TranscriptSelector({ val, setVal, isoforms, isoformSequences, structureSequence, feature, disabled, }: {
    isoforms: Feature[];
    feature: Feature;
    val: string;
    setVal: (str: string) => void;
    structureSequence?: string;
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }>;
    disabled?: boolean;
}): React.JSX.Element;
