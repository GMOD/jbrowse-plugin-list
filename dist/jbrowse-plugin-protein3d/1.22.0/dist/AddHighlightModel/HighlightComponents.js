import React from 'react';
import { observer } from 'mobx-react';
import GenomeMouseoverHighlight from './GenomeMouseoverHighlight';
import GenomeTo1DProteinHoverHighlight from './GenomeTo1DProteinHoverHighlight';
import Protein1DToGenomeHoverHighlight from './Protein1DToGenomeHoverHighlight';
import ProteinToGenomeHighlight from './ProteinToGenomeHighlight';
const HighlightComponents = observer(function Highlight({ model, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement(ProteinToGenomeHighlight, { model: model, field: "clickGenomeHighlights" }),
        React.createElement(ProteinToGenomeHighlight, { model: model, field: "hoverGenomeHighlights" }),
        React.createElement(Protein1DToGenomeHoverHighlight, { model: model }),
        React.createElement(GenomeTo1DProteinHoverHighlight, { model: model }),
        React.createElement(GenomeMouseoverHighlight, { model: model })));
});
export default HighlightComponents;
