import React from 'react';
import type { AlignmentAlgorithm } from '../../ProteinView/types';
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
    /**
     * Real error from the lookup/data pipeline. When present, "No UniProt ID
     * found" is suppressed so it doesn't compete with the actual error message
     * shown above by <ErrorMessage>.
     */
    error?: unknown;
}
export default function ProteinViewActions({ handleClose, uniprotId, userSelectedProteinSequence, selectedTranscript, url, confidenceUrl, feature, view, session, alignmentAlgorithm, onAlignmentAlgorithmChange, sequencesMatch, isLoading, error, }: ProteinViewActionsProps): React.JSX.Element;
export {};
