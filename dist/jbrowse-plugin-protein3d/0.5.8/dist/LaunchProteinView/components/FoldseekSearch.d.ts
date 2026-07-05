import React from 'react';
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
declare const FoldseekSearch: ({ feature, session, view, handleClose, }: {
    feature: Feature;
    session: AbstractSessionModel;
    view: LinearGenomeViewModel;
    handleClose: () => void;
}) => React.JSX.Element;
export default FoldseekSearch;
