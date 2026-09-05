import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { observer } from 'mobx-react';
import Highlight from './Highlight';
import { isTView } from '../TViewPanel/model';
const MsaToGenomeHighlight = observer(function MsaToGenomeHighlight2({ model, }) {
    const { views } = getSession(model);
    const highlights = views
        .filter(isTView)
        .filter(v => v.connectedViewId === model.id)
        .flatMap(v => v.connectedHighlights);
    return (React.createElement(React.Fragment, null, highlights.map(r => (React.createElement(Highlight, { key: `${r.refName}:${r.start}`, model: model, ...r })))));
});
export default MsaToGenomeHighlight;
//# sourceMappingURL=MsaToGenomeHighlight.js.map