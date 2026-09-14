import React from 'react';
import { observer } from 'mobx-react';
import { getHighlightCoords, useStyles } from './util';
const Highlight = observer(function Highlight({ region, model, }) {
    const { cx, classes } = useStyles();
    const coords = getHighlightCoords(model, region);
    return coords ? (React.createElement("div", { className: cx(classes.highlight, coords.width <= 3 ? classes.thinborder : undefined), style: { left: coords.left, width: coords.width } })) : null;
});
export default Highlight;
