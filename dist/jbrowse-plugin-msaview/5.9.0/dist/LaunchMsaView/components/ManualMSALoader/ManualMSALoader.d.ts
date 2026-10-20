import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const ManualMSALoader: ({ model, feature, handleClose, preferredTranscriptId, }: {
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
    /** the isoform the user right-clicked, preselected in the picker */
    preferredTranscriptId?: string;
}) => React.JSX.Element;
export default ManualMSALoader;
