import React from 'react';
import type { AlignmentAlgorithm } from '../../ProteinView/types';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const UserProvidedStructure: ({ feature, model, handleClose, alignmentAlgorithm, onAlignmentAlgorithmChange, }: {
    feature: Feature;
    model: AbstractTrackModel;
    handleClose: () => void;
    alignmentAlgorithm: AlignmentAlgorithm;
    onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void;
}) => React.JSX.Element;
export default UserProvidedStructure;
