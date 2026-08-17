import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { observer } from 'mobx-react';
import Highlight from './Highlight';
import { getProteinViews, getStructuresConnectedTo } from './proteinViewLookup';
const ProteinToGenomeHighlightInner = observer(function ProteinToGenomeHighlightInner({ model, field, }) {
    const session = getSession(model);
    const { assemblyManager } = session;
    const { assemblyNames, id: viewId } = model;
    const assemblyName = assemblyNames[0];
    const assembly = assemblyName
        ? assemblyManager.get(assemblyName)
        : undefined;
    // Only structures that declare this genome view as their connection: the
    // regions are transcript coordinates on that view's assembly, so painting
    // them into any other genome view would place a highlight at coordinates
    // that mean nothing there.
    const structures = getStructuresConnectedTo(getProteinViews(session), viewId);
    return assembly && assemblyName ? (React.createElement(React.Fragment, null, structures.flatMap((structure, idx) => structure[field].map((r, idx2) => (React.createElement(Highlight, { key: `${r.refName}-${r.start}-${r.end}-${idx}-${idx2}`, model: model, region: {
            start: r.start,
            end: r.end,
            refName: r.refName,
            assemblyName,
        } })))))) : null;
});
export default ProteinToGenomeHighlightInner;
