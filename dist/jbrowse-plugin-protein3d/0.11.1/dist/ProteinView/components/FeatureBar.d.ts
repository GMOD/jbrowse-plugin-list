import React from 'react';
import type { FeatureLayout } from '../hooks/useProteinFeatureTrackData';
import type { JBrowsePluginProteinStructureModel } from '../model';
declare const FeatureBar: ({ layout, top, model, }: {
    layout: FeatureLayout;
    top: number;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
export default FeatureBar;
