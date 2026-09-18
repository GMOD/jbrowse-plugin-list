import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const OrthologPanel: ({ handleClose, feature, model, preferredTranscriptId, }: {
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
    /** the isoform the user right-clicked, preselected in the picker */
    preferredTranscriptId?: string;
}) => React.JSX.Element;
export default OrthologPanel;
