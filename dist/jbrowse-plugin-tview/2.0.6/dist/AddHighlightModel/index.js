import React from 'react';
import { getSession } from '@jbrowse/core/util';
import HighlightComponents from './HighlightComponents';
import { isTView } from '../TViewPanel/model';
export default function AddHighlightComponentsModelF(pluginManager) {
    pluginManager.addToExtensionPoint('LinearGenomeView-TracksContainerComponent', 
    // @ts-expect-error
    (rest, { model }) => {
        // skip entirely unless a TView is connected to this genome view
        const { views } = getSession(model);
        return views.some(v => isTView(v) && v.connectedViewId === model.id)
            ? [
                ...rest,
                React.createElement(HighlightComponents, { key: "tview_highlights", model: model }),
            ]
            : rest;
    });
}
//# sourceMappingURL=index.js.map