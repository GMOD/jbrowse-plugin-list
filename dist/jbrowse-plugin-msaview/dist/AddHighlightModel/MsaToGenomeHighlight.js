import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { observer } from 'mobx-react';
import { hasHoverPosition, useStyles } from './util';
const MsaToGenomeHighlight = observer(function MsaToGenomeHighlight2({ model, }) {
    const { views, hovered } = getSession(model);
    const msaView = views.find(f => f.type === 'MsaView');
    const highlights = msaView?.connectedHighlights;
    // Suppress codon highlight while hovering the LGV — GenomeMouseoverHighlight
    // handles the single-bp display in that case
    return !hasHoverPosition(hovered) && highlights?.length ? (React.createElement(MsaToGenomeHighlightRenderer, { model: model, highlights: Array.from(highlights) })) : null;
});
// Inner component: handles the scroll-dependent rendering
const MsaToGenomeHighlightRenderer = observer(function ({ model, highlights, }) {
    const { classes } = useStyles();
    const { assemblyManager } = getSession(model);
    const assembly = assemblyManager.get(model.assemblyNames[0]);
    const { offsetPx } = model;
    if (!assembly) {
        return null;
    }
    return (React.createElement(React.Fragment, null, highlights.map((r, idx) => {
        const refName = assembly.getCanonicalRefName(r.refName) ?? r.refName;
        const s = model.bpToPx({ refName, coord: r.start });
        const e = model.bpToPx({ refName, coord: r.end });
        if (s && e) {
            const width = Math.max(Math.abs(e.offsetPx - s.offsetPx), 4);
            const left = Math.min(s.offsetPx, e.offsetPx) - offsetPx;
            return (React.createElement("div", { key: `${r.refName}-${r.start}-${r.end}-${idx}`, className: classes.highlight, style: { left, width } }));
        }
        return null;
    })));
});
export default MsaToGenomeHighlight;
//# sourceMappingURL=MsaToGenomeHighlight.js.map