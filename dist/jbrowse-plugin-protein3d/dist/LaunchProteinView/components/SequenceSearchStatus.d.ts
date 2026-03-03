import React from 'react';
import type { SequenceSearchType } from '../hooks/useAlphaFoldSequenceSearch';
interface SequenceSearchStatusProps {
    isLoading: boolean;
    uniprotId?: string;
    url?: string;
    hasProteinSequence: boolean;
    sequenceSearchType: SequenceSearchType;
}
export default function SequenceSearchStatus({ isLoading, uniprotId, url, hasProteinSequence, sequenceSearchType, }: SequenceSearchStatusProps): React.JSX.Element | null;
export {};
