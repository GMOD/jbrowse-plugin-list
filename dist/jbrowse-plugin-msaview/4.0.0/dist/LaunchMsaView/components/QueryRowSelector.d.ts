import React from 'react';
import type { QueryRowMatch } from '../detectQueryRow';
/**
 * Which MSA row corresponds to the selected transcript. Clicking and hovering in
 * the alignment reach the genome only through this name, and a wrong one fails
 * silently -- the view opens, renders, and never navigates -- so the field fills
 * itself in from the pasted alignment and offers that alignment's own row names
 * rather than a free text box the user can typo.
 */
export default function QueryRowSelector({ names, detected, querySeqName, setQuerySeqName, isAutoDetected, }: {
    names: string[];
    detected?: QueryRowMatch;
    querySeqName: string;
    setQuerySeqName: (arg: string) => void;
    isAutoDetected: boolean;
}): React.JSX.Element;
