import React from 'react';
import MafSequenceHoverHighlight from './MafSequenceHoverHighlight';
export default function MafSequenceHoverHighlightExtensionF(pluginManager) {
    pluginManager.addToExtensionPoint('LinearGenomeView-TracksContainerComponent', (rest, props) => {
        const model = props.model;
        return [
            ...rest,
            React.createElement(MafSequenceHoverHighlight, { key: "maf-sequence-hover-highlight", model: model }),
        ];
    });
}
//# sourceMappingURL=MafSequenceHoverHighlightExtension.js.map