import React, { useMemo } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
const Cells = observer(function Cells({ cells, colorFor, model, }) {
    const { columnWidth, trackHeight } = model;
    return (React.createElement("div", { style: { position: 'relative', height: trackHeight } }, cells.map(cell => (React.createElement("div", { key: cell.col, style: {
            position: 'absolute',
            left: cell.col * columnWidth,
            width: columnWidth,
            height: trackHeight,
            backgroundColor: colorFor(cell.value),
        } })))));
});
/**
 * A per-residue scalar track (e.g. pLDDT, hydrophobicity) drawn as one colored
 * cell per alignment column. The panel's own pointer handler drives the hover,
 * so the tooltip reads the hovered column off the model; the cells sit in
 * their own observer so a hover elsewhere doesn't redraw them.
 */
const ResidueValueTrack = observer(function ResidueValueTrack({ cells, colorFor, formatValue, model, }) {
    const valueByCol = useMemo(() => new Map(cells.map(cell => [cell.col, cell.value])), [cells]);
    const { alignmentHoverPos } = model;
    const hoveredValue = alignmentHoverPos === undefined
        ? undefined
        : valueByCol.get(alignmentHoverPos);
    return (React.createElement(Tooltip, { title: hoveredValue === undefined ? '' : formatValue(hoveredValue), followCursor: true },
        React.createElement("div", null,
            React.createElement(Cells, { cells: cells, colorFor: colorFor, model: model }))));
});
export default ResidueValueTrack;
