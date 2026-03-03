import React from 'react';
import { FeatureTrackData } from '../hooks/useProteinFeatureTrackData';
import { JBrowsePluginProteinStructureModel } from '../model';
export declare const ProteinFeatureTrackLabels: ({ data, labelWidth, model, }: {
    data: FeatureTrackData;
    labelWidth: number;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
export declare const ProteinFeatureTrackContent: ({ data, model, }: {
    data: FeatureTrackData;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
