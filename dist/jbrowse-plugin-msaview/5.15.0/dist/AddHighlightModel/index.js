import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { isMsaView } from '../MsaViewPanel/isMsaView';
import HighlightComponents from './HighlightComponents';
// eslint-disable-next-line no-restricted-syntax -- a plugin install step, not a component; the element it returns renders inside the genome view's observer
export default function AddHighlightComponentsModelF(pluginManager) {
    pluginManager.contributeToExtensionPoint('LinearGenomeView-TracksContainerComponent', ({ model }) => {
        const { views } = getSession(model);
        return views.some(v => isMsaView(v) && v.connectedViewId === model.id) ? (React.createElement(HighlightComponents, { key: "highlight_protein_viewer_msaview", model: model })) : undefined;
    });
}
