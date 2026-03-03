import React from 'react';
import { observer } from 'mobx-react';
import GenomeMouseoverHighlight from './GenomeMouseoverHighlight';
import MsaToGenomeHighlight from './MsaToGenomeHighlight';
const HighlightComponents = observer(function HighlightComponents2({ model, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement(MsaToGenomeHighlight, { model: model }),
        React.createElement(GenomeMouseoverHighlight, { model: model })));
});
export default HighlightComponents;
//# sourceMappingURL=HighlightComponents.js.map