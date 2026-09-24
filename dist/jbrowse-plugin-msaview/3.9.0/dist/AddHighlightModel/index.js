import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { isMsaView } from '../MsaViewPanel/model';
import HighlightComponents from './HighlightComponents';
export default function AddHighlightComponentsModelF(pluginManager) {
    pluginManager.addToExtensionPoint(
    // @ts-expect-error v4 hosts have no contributeToExtensionPoint
    'LinearGenomeView-TracksContainerComponent', (rest, { model }) => {
        const { views } = getSession(model);
        const hasMsaView = views.some(v => isMsaView(v) && v.connectedViewId === model.id);
        if (!hasMsaView) {
            return rest;
        }
        return [
            ...rest,
            React.createElement(HighlightComponents, { key: "highlight_protein_viewer_msaview", model: model }),
        ];
    });
}
