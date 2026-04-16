import React from 'react';
import type { AlignmentAlgorithm } from '../../ProteinView/types';
import type { PairwiseAlignment } from '../../mappings';
interface AlignmentSettingsButtonProps {
    value: AlignmentAlgorithm;
    onChange: (algorithm: AlignmentAlgorithm) => void;
    onManualAlignment?: (alignment: PairwiseAlignment) => void;
}
export default function AlignmentSettingsButton({ value, onChange, onManualAlignment, }: AlignmentSettingsButtonProps): React.JSX.Element;
export {};
