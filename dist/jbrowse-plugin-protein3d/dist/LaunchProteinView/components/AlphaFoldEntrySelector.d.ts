import React from 'react';
import type { AlphaFoldPrediction } from '../hooks/useAlphaFoldUrl';
interface AlphaFoldEntrySelectorProps {
    predictions: AlphaFoldPrediction[];
    selectedEntryIndex: number;
    onSelectionChange: (index: number) => void;
}
/**
 * Component to select between different AlphaFold structure entries
 */
export default function AlphaFoldEntrySelector({ predictions, selectedEntryIndex, onSelectionChange, }: AlphaFoldEntrySelectorProps): React.JSX.Element | null;
export {};
