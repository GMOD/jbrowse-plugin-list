import React from 'react';
import { getSession } from '@jbrowse/core/util';
import Highlight from './Highlight';
export default function ProteinToGenomeHighlightInner({ model, field, }) {
    const { assemblyManager, views } = getSession(model);
    const { assemblyNames } = model;
    const proteinView = views.find(f => f.type === 'ProteinView');
    const assemblyName = assemblyNames[0];
    const assembly = assemblyManager.get(assemblyName);
    return assembly ? (React.createElement(React.Fragment, null, proteinView?.structures.map((structure, idx) => structure[field].map((r, idx2) => (React.createElement(Highlight, { key: `${r.refName}-${r.start}-${r.end}-${idx}-${idx2}`, start: r.start, end: r.end, refName: r.refName, assemblyName: assemblyName, model: model })))))) : null;
}
//# sourceMappingURL=ProteinToGenomeHighlightInner.js.map