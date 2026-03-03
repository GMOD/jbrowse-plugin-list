import React from 'react';
import type { SequenceSearchType } from '../hooks/useAlphaFoldSequenceSearch';
export type LookupMode = 'auto' | 'manual' | 'feature' | 'sequence';
interface UniProtIdInputProps {
    lookupMode: LookupMode;
    onLookupModeChange: (mode: LookupMode) => void;
    manualUniprotId: string;
    onManualUniprotIdChange: (id: string) => void;
    featureUniprotId?: string;
    hasProteinSequence?: boolean;
    sequenceSearchType?: SequenceSearchType;
    onSequenceSearchTypeChange?: (type: SequenceSearchType) => void;
    endContent?: React.ReactNode;
}
/**
 * Component to handle UniProt ID input mode selection
 */
export default function UniProtIdInput({ lookupMode, onLookupModeChange, manualUniprotId, onManualUniprotIdChange, featureUniprotId, hasProteinSequence, sequenceSearchType, onSequenceSearchTypeChange, endContent, }: UniProtIdInputProps): React.JSX.Element;
export {};
