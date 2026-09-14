import React from 'react';
import { observer } from 'mobx-react';
import ProteinToGenomeHighlightInner from './ProteinToGenomeHighlightInner';
export const ProteinToGenomeClickHighlight = observer(function ProteinToGenomeClickHighlight({ model, }) {
    return (React.createElement(ProteinToGenomeHighlightInner, { model: model, field: "clickGenomeHighlights" }));
});
export const ProteinToGenomeHoverHighlight = observer(function ProteinToGenomeHoverHighlight({ model, }) {
    return (React.createElement(ProteinToGenomeHighlightInner, { model: model, field: "hoverGenomeHighlights" }));
});
