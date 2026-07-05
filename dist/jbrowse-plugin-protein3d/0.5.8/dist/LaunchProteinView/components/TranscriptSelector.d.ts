import React from 'react';
import type { IsoformSequences } from '../utils/util';
import type { Feature } from '@jbrowse/core/util';
export default function TranscriptSelector({ val, setVal, isoforms, isoformSequences, structureSequence, feature, disabled, }: {
    isoforms: Feature[];
    feature: Feature;
    val: string | undefined;
    setVal: (str: string) => void;
    structureSequence?: string;
    isoformSequences: IsoformSequences;
    disabled?: boolean;
}): React.JSX.Element;
