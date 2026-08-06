import React from 'react';
import type { AlignmentAlgorithm } from '../../ProteinView/types';
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
declare const AlphaFoldDBSearch: ({ feature, session, view, handleClose, alignmentAlgorithm, onAlignmentAlgorithmChange, }: {
    feature: Feature;
    session: AbstractSessionModel;
    view: LinearGenomeViewModel;
    handleClose: () => void;
    alignmentAlgorithm: AlignmentAlgorithm;
    onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void;
}) => React.JSX.Element;
export default AlphaFoldDBSearch;
