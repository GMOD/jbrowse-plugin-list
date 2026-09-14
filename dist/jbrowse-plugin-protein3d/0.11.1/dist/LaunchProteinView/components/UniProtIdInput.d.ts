import React from 'react';
export type LookupMode = 'auto' | 'manual' | 'feature';
interface UniProtIdInputProps {
    lookupMode: LookupMode;
    onLookupModeChange: (mode: LookupMode) => void;
    manualUniprotId: string;
    onManualUniprotIdChange: (id: string) => void;
    featureUniprotId?: string;
    endContent?: React.ReactNode;
}
export default function UniProtIdInput({ lookupMode, onLookupModeChange, manualUniprotId, onManualUniprotIdChange, featureUniprotId, endContent, }: UniProtIdInputProps): React.JSX.Element;
export {};
