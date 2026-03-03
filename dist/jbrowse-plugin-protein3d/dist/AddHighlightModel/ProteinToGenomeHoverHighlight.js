import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { observer } from 'mobx-react';
import Highlight from './Highlight';
const ProteinToGenomeHoverHighlight = observer(function ProteinToGenomeHoverHighlight({ model, }) {
    const { assemblyManager, views } = getSession(model);
    const { assemblyNames } = model;
    const proteinView = views.find(f => f.type === 'ProteinView');
    const assemblyName = assemblyNames[0];
    const assembly = assemblyManager.get(assemblyName);
    return assembly ? (React.createElement(React.Fragment, null, proteinView?.structures.map((structure, idx) => structure.hoverGenomeHighlights.map((r, idx2) => (React.createElement(Highlight, { key: `${JSON.stringify(r)}-${idx}-${idx2}`, start: r.start, end: r.end, refName: r.refName, assemblyName: assemblyName, model: model })))))) : null;
});
export default ProteinToGenomeHoverHighlight;
//# sourceMappingURL=ProteinToGenomeHoverHighlight.js.map