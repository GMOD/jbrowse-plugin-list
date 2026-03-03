import React from 'react';
import HighlightComponents from './HighlightComponents';
export default function AddHighlightModelF(pluginManager) {
    pluginManager.addToExtensionPoint('LinearGenomeView-TracksContainerComponent', 
    // @ts-expect-error
    (rest, { model }) => {
        return [
            ...rest,
            React.createElement(HighlightComponents, { key: "highlight_protein_viewer_protein3d", model: model }),
        ];
    });
}
//# sourceMappingURL=index.js.map