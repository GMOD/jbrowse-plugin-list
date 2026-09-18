import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
export default function LaunchMsaViewDialog({ handleClose, feature, model, preferredTranscriptId, }: {
    handleClose: () => void;
    feature: Feature;
    model: AbstractTrackModel;
    /** the isoform the right-click landed on, when this opened on its gene */
    preferredTranscriptId?: string;
}): React.JSX.Element;
