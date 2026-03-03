import React from 'react';
import type { LinearMafDisplayModel } from '../stateModel';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
declare const MsaHighlightOverlay: ({ model, view, height, }: {
    model: LinearMafDisplayModel;
    view: LinearGenomeViewModel;
    height: number;
}) => React.JSX.Element | null;
export default MsaHighlightOverlay;
