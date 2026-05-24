import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { observer } from 'mobx-react';
import Highlight from './Highlight';
import { getProteinView } from './util';
const ProteinToGenomeHighlightInner = observer(function ProteinToGenomeHighlightInner({ model, field, }) {
    const session = getSession(model);
    const { assemblyManager } = session;
    const { assemblyNames } = model;
    const proteinView = getProteinView(session);
    const assemblyName = assemblyNames[0];
    const assembly = assemblyName
        ? assemblyManager.get(assemblyName)
        : undefined;
    return assembly && assemblyName ? (React.createElement(React.Fragment, null, proteinView?.structures.map((structure, idx) => structure[field].map((r, idx2) => (React.createElement(Highlight, { key: `${r.refName}-${r.start}-${r.end}-${idx}-${idx2}`, start: r.start, end: r.end, refName: r.refName, assemblyName: assemblyName, model: model })))))) : null;
});
export default ProteinToGenomeHighlightInner;
