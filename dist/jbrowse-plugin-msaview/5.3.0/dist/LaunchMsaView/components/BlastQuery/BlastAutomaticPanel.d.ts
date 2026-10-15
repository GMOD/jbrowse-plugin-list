import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const BlastAutomaticPanel: ({ handleClose, feature, model, children, preferredTranscriptId, }: {
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
    children: React.ReactNode;
    /** the isoform the user right-clicked, preselected in the picker */
    preferredTranscriptId?: string;
}) => React.JSX.Element;
export default BlastAutomaticPanel;
