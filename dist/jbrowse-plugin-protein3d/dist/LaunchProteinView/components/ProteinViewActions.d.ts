import React from 'react';
import { AlignmentAlgorithm } from '../../ProteinView/types';
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
interface ProteinViewActionsProps {
    handleClose: () => void;
    uniprotId?: string;
    userSelectedProteinSequence?: {
        seq: string;
    };
    selectedTranscript?: Feature;
    url?: string;
    confidenceUrl?: string;
    feature: Feature;
    view: LinearGenomeViewModel;
    session: AbstractSessionModel;
    alignmentAlgorithm: AlignmentAlgorithm;
    onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void;
    sequencesMatch?: boolean;
    isLoading?: boolean;
}
export default function ProteinViewActions({ handleClose, uniprotId, userSelectedProteinSequence, selectedTranscript, url, confidenceUrl, feature, view, session, alignmentAlgorithm, onAlignmentAlgorithmChange, sequencesMatch, isLoading, }: ProteinViewActionsProps): React.JSX.Element;
export {};
