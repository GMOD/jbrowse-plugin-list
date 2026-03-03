import React from 'react';
import { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const ManualMSALoader: ({ model, feature, handleClose, }: {
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
}) => React.JSX.Element;
export default ManualMSALoader;
