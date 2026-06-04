import React from 'react';
import type { UniProtFeature } from '../hooks/useUniProtFeatures';
import type { JBrowsePluginProteinStructureModel } from '../model';
declare const FeatureBar: ({ feature, model, }: {
    feature: UniProtFeature;
    model: JBrowsePluginProteinStructureModel;
}) => React.JSX.Element;
export default FeatureBar;
