import React, { useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { CHAR_WIDTH } from '../constants';
/**
 * A per-residue scalar track (e.g. pLDDT, hydrophobicity) rendered as colored
 * cells aligned to the pairwise-alignment columns, matching the UniProt feature
 * tracks. Hovering drives the same structure hover as the feature tracks.
 */
const ResidueValueTrack = observer(function ResidueValueTrack({ cells, colorFor, formatValue, sequenceLength, model, }) {
    const [hoveredCol, setHoveredCol] = useState(undefined);
    const valueByCol = useMemo(() => {
        const map = new Map();
        for (const cell of cells) {
            map.set(cell.col, cell.value);
        }
        return map;
    }, [cells]);
    const hoveredValue = hoveredCol === undefined ? undefined : valueByCol.get(hoveredCol);
    return (React.createElement(Tooltip, { title: hoveredValue === undefined ? '' : formatValue(hoveredValue), followCursor: true },
        React.createElement("div", { style: {
                position: 'relative',
                height: model.trackHeight,
                width: sequenceLength * CHAR_WIDTH,
                marginBottom: model.trackGap,
            }, onMouseMove: (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const alignmentPos = Math.floor((e.clientX - rect.left) / CHAR_WIDTH);
                setHoveredCol(alignmentPos);
                if (alignmentPos >= 0 && alignmentPos < sequenceLength) {
                    model.hoverAlignmentPosition(alignmentPos);
                }
            }, onMouseLeave: () => {
                setHoveredCol(undefined);
                model.setHoveredPosition(undefined);
            } }, cells.map(cell => (React.createElement("div", { key: cell.col, style: {
                position: 'absolute',
                left: cell.col * CHAR_WIDTH,
                top: 0,
                width: CHAR_WIDTH,
                height: model.trackHeight,
                backgroundColor: colorFor(cell.value),
            } }))))));
});
export default ResidueValueTrack;
