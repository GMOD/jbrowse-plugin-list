import React from 'react';
import { Feature } from '@jbrowse/core/util';
import type { AbstractTrackModel } from '@jbrowse/core/util';
declare const CachedBlastResults: ({ model, handleClose, feature, }: {
    model: AbstractTrackModel;
    handleClose: () => void;
    feature: Feature;
}) => React.JSX.Element;
export default CachedBlastResults;
