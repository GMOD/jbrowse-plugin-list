import React from 'react';
import type { IsoformSequences } from '../utils/util';
export default function MSATable({ structureName, structureSequence, isoformSequences, }: {
    structureName: string;
    structureSequence: string;
    isoformSequences: IsoformSequences;
}): React.JSX.Element;
