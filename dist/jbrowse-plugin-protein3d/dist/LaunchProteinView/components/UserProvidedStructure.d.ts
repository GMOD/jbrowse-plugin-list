import React from 'react';
import { AbstractTrackModel, Feature } from '@jbrowse/core/util';
import { AlignmentAlgorithm } from '../../ProteinView/types';
declare const UserProvidedStructure: ({ feature, model, handleClose, alignmentAlgorithm, onAlignmentAlgorithmChange, }: {
    feature: Feature;
    model: AbstractTrackModel;
    handleClose: () => void;
    alignmentAlgorithm: AlignmentAlgorithm;
    onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void;
}) => React.JSX.Element;
export default UserProvidedStructure;
