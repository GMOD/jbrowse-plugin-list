import React from 'react';
import { observer } from 'mobx-react';
import { useStyles } from './util';
/** a band over one genome interval, positioned in the tracks container */
const Highlight = observer(function Highlight2({ model, refName, start, end, }) {
    const { classes } = useStyles();
    const s = model.bpToPx({ refName, coord: start });
    const e = model.bpToPx({ refName, coord: end });
    return s && e ? (React.createElement("div", { className: classes.highlight, style: {
            left: Math.min(s.offsetPx, e.offsetPx) - model.offsetPx,
            width: Math.max(Math.abs(e.offsetPx - s.offsetPx), 4),
        } })) : null;
});
export default Highlight;
//# sourceMappingURL=Highlight.js.map