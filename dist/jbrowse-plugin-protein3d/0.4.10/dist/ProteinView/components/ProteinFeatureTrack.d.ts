import React from 'react';
import type { FeatureTrackData } from '../hooks/useProteinFeatureTrackData';
import type { JBrowsePluginProteinStructureModel } from '../model';
export declare const ProteinFeatureTrackLabels: ({ data, labelWidth, model, }: {
    data: FeatureTrackData;
    labelWidth: number;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
export declare const ProteinFeatureTrackContent: ({ data, model, }: {
    data: FeatureTrackData;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
