import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const NCBIBlastManualPanel: ({ handleClose, feature, model, children, baseUrl, }: {
    children: React.ReactNode;
    model: AbstractTrackModel;
    feature: Feature;
    baseUrl: string;
    handleClose: () => void;
}) => React.JSX.Element;
export default NCBIBlastManualPanel;
