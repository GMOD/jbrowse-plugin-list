import React from 'react';
import { AlignmentAlgorithm } from '../../ProteinView/types';
import { PairwiseAlignment } from '../../mappings';
interface AlignmentSettingsButtonProps {
    value: AlignmentAlgorithm;
    onChange: (algorithm: AlignmentAlgorithm) => void;
    onManualAlignment?: (alignment: PairwiseAlignment) => void;
}
export default function AlignmentSettingsButton({ value, onChange, onManualAlignment, }: AlignmentSettingsButtonProps): React.JSX.Element;
export {};
