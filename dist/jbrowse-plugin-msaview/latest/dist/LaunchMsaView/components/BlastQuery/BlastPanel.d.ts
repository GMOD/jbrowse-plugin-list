import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
export type BlastLookupMethod = 'automatic' | 'manual';
declare const BlastPanel: ({ handleClose, model, feature, preferredTranscriptId, }: {
    handleClose: () => void;
    model: AbstractTrackModel;
    feature: Feature;
    /** the isoform the user right-clicked, preselected in the picker */
    preferredTranscriptId?: string;
}) => React.JSX.Element;
export default BlastPanel;
