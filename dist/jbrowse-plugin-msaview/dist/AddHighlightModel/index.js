import React from 'react';
import { getSession } from '@jbrowse/core/util';
import HighlightComponents from './HighlightComponents';
export default function AddHighlightComponentsModelF(pluginManager) {
    pluginManager.addToExtensionPoint('LinearGenomeView-TracksContainerComponent', 
    // @ts-expect-error
    (rest, { model }) => {
        // Quick check: don't add any components if no MSA view exists
        const { views } = getSession(model);
        const hasMsaView = views.some(v => v.type === 'MsaView');
        if (!hasMsaView) {
            return rest;
        }
        return [
            ...rest,
            React.createElement(HighlightComponents, { key: "highlight_protein_viewer_msaview", model: model }),
        ];
    });
}
//# sourceMappingURL=index.js.map