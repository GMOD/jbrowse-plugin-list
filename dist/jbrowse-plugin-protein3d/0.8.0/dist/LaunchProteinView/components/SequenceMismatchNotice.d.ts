import React from 'react';
import { type AlignmentAlgorithm } from '../../ProteinView/types';
export default function SequenceMismatchNotice({ alignmentAlgorithm, onAlignmentAlgorithmChange, }: {
    alignmentAlgorithm: AlignmentAlgorithm;
    onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void;
}): React.JSX.Element;
