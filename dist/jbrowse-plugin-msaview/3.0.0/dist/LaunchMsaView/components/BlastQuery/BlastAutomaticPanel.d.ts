import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const BlastAutomaticPanel: ({ handleClose, feature, model, children, }: {
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
    children: React.ReactNode;
}) => React.JSX.Element;
export default BlastAutomaticPanel;
