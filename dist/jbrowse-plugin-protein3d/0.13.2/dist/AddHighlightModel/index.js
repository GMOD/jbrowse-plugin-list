import React from 'react';
import HighlightComponents from './HighlightComponents';
export default function AddHighlightModelF(pluginManager) {
    pluginManager.addToExtensionPoint(
    // @ts-expect-error v4 hosts have no contributeToExtensionPoint
    'LinearGenomeView-TracksContainerComponent', (rest, { model }) => {
        return [
            ...rest,
            React.createElement(HighlightComponents, { key: "highlight_protein_viewer_protein3d", model: model }),
        ];
    });
}
