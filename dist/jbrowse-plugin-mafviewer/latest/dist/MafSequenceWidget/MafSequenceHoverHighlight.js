import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { colord } from '@jbrowse/core/util/colord';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()(theme => ({
    highlight: {
        height: '100%',
        position: 'absolute',
        background: colord(theme.palette.primary.main).alpha(0.4).toRgbString(),
        borderLeft: `2px solid ${theme.palette.primary.main}`,
        borderRight: `2px solid ${theme.palette.primary.main}`,
        pointerEvents: 'none',
        zIndex: 10,
    },
}));
const MafSequenceHoverHighlight = observer(function MafSequenceHoverHighlight({ model, }) {
    const { classes } = useStyles();
    const session = getSession(model);
    const { assemblyManager } = session;
    // Find MafSequenceWidget instances that are connected to this view
    const widgets = 'widgets' in session ? session.widgets : undefined;
    if (!widgets) {
        return null;
    }
    const highlights = [];
    for (const [, widget] of widgets) {
        const w = widget;
        if (w.type === 'MafSequenceWidget' && w.connectedViewId === model.id) {
            const mafWidget = widget;
            const { hoverHighlight } = mafWidget;
            if (hoverHighlight) {
                const { refName, start, end, assemblyName } = hoverHighlight;
                const assembly = assemblyManager.get(assemblyName);
                const canonicalRefName = assembly?.getCanonicalRefName(refName) ?? refName;
                const startPx = model.bpToPx({
                    refName: canonicalRefName,
                    coord: start,
                });
                const endPx = model.bpToPx({ refName: canonicalRefName, coord: end });
                if (startPx && endPx) {
                    const left = Math.min(startPx.offsetPx, endPx.offsetPx) - model.offsetPx;
                    const width = Math.max(Math.abs(endPx.offsetPx - startPx.offsetPx), 3);
                    highlights.push(React.createElement("div", { key: `maf-hover-${mafWidget.id}`, className: classes.highlight, style: { left, width } }));
                }
            }
        }
    }
    return React.createElement(React.Fragment, null, highlights);
});
export default MafSequenceHoverHighlight;
//# sourceMappingURL=MafSequenceHoverHighlight.js.map