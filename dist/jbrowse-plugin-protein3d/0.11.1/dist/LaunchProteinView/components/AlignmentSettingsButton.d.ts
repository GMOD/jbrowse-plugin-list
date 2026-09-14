import React from 'react';
import type { AlignmentAlgorithm } from '../../ProteinView/types';
export default function AlignmentSettingsButton({ value, onChange, }: {
    value: AlignmentAlgorithm;
    onChange: (algorithm: AlignmentAlgorithm) => void;
}): React.JSX.Element;
