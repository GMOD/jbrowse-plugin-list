import React from 'react';
import { AbstractTrackModel, Feature } from '@jbrowse/core/util';
export default function LaunchMsaViewDialog({ handleClose, feature, model, }: {
    handleClose: () => void;
    feature: Feature;
    model: AbstractTrackModel;
}): React.JSX.Element;
