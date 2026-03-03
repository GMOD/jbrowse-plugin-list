import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
export default function NCBIBlastPanel({ handleClose, model, feature, }: {
    handleClose: () => void;
    model: AbstractTrackModel;
    feature: Feature;
}): React.JSX.Element;
