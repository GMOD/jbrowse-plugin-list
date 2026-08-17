import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const BlastManualPanel: ({ handleClose, feature, model, children, }: {
    children: React.ReactNode;
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
}) => React.JSX.Element;
export default BlastManualPanel;
