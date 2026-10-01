import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { isMsaView } from '../MsaViewPanel/isMsaView';
import HighlightComponents from './HighlightComponents';
export default function AddHighlightComponentsModelF(pluginManager) {
    pluginManager.contributeToExtensionPoint('LinearGenomeView-TracksContainerComponent', ({ model }) => {
        const { views } = getSession(model);
        return views.some(v => isMsaView(v) && v.connectedViewId === model.id) ? (React.createElement(HighlightComponents, { key: "highlight_protein_viewer_msaview", model: model })) : undefined;
    });
}
