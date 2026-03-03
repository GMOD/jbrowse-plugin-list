import React from 'react';
import { observer } from 'mobx-react';
import GenomeMouseoverHighlight from './GenomeMouseoverHighlight';
import GenomeTo1DProteinHoverHighlight from './GenomeTo1DProteinHoverHighlight';
import Protein1DToGenomeHoverHighlight from './Protein1DToGenomeHoverHighlight';
import ProteinToGenomeClickHighlight from './ProteinToGenomeClickHighlight';
import ProteinToGenomeHoverHighlight from './ProteinToGenomeHoverHighlight';
import ProteinToMsaHoverSync from './ProteinToMsaHoverSync';
const HighlightComponents = observer(function Highlight({ model, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement(ProteinToGenomeClickHighlight, { model: model }),
        React.createElement(ProteinToGenomeHoverHighlight, { model: model }),
        React.createElement(Protein1DToGenomeHoverHighlight, { model: model }),
        React.createElement(GenomeTo1DProteinHoverHighlight, { model: model }),
        React.createElement(GenomeMouseoverHighlight, { model: model }),
        React.createElement(ProteinToMsaHoverSync, { model: model })));
});
export default HighlightComponents;
//# sourceMappingURL=HighlightComponents.js.map