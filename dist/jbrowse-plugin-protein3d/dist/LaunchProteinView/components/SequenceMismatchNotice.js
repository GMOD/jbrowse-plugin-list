import React from 'react';
import { Typography } from '@mui/material';
import AlignmentSettingsButton from './AlignmentSettingsButton';
import { ALIGNMENT_ALGORITHM_LABELS, } from '../../ProteinView/types';
export default function SequenceMismatchNotice({ alignmentAlgorithm, onAlignmentAlgorithmChange, }) {
    return (React.createElement(Typography, { variant: "body2", sx: { mr: 2, display: 'flex', alignItems: 'center' } },
        "Transcript and structure sequences differ, will run",
        ' ',
        ALIGNMENT_ALGORITHM_LABELS[alignmentAlgorithm] ?? alignmentAlgorithm,
        ' ',
        "alignment",
        React.createElement(AlignmentSettingsButton, { value: alignmentAlgorithm, onChange: onAlignmentAlgorithmChange })));
}
//# sourceMappingURL=SequenceMismatchNotice.js.map