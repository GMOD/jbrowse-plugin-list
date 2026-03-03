import React from 'react';
import { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const NCBIBlastAutomaticPanel: ({ handleClose, feature, model, children, baseUrl, }: {
    model: AbstractTrackModel;
    feature: Feature;
    baseUrl: string;
    handleClose: () => void;
    children: React.ReactNode;
}) => React.JSX.Element;
export default NCBIBlastAutomaticPanel;
