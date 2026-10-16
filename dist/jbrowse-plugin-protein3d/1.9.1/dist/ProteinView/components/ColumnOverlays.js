import React from 'react';
import { observer } from 'mobx-react';
import { HOVER_COLOR, HOVER_RANGE_COLOR, MATCH_COLOR, SELECTION_COLOR, SELECTION_OUTLINE, } from '../constants';
import { positionRuns } from '../residueRanges';
function Band({ start, end, columnWidth, background, border, }) {
    return (React.createElement("div", { style: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: start * columnWidth,
            width: (end - start + 1) * columnWidth,
            background,
            border,
            boxSizing: 'border-box',
            pointerEvents: 'none',
        } }));
}
function Layer({ zIndex, children, }) {
    return (React.createElement("div", { style: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex } }, children));
}
/**
 * The persistent state, drawn beneath every row: a band on top would tint the
 * pLDDT cells and feature bars inside it, and those colours are data. The
 * aligned portion (`showHighlight`) lights the sequence rows, `matchHeight`
 * tall, and the selection's fill goes over it; ColumnOverlays draws the
 * selection's outline over the rows.
 */
export const SelectionBackdrop = observer(function SelectionBackdrop({ model, matchHeight, }) {
    const { clickAlignmentRanges, columnWidth, showHighlight, alignmentMatchSet, } = model;
    return (React.createElement(Layer, { zIndex: 0 },
        showHighlight && alignmentMatchSet ? (React.createElement("div", { style: { position: 'relative', height: matchHeight } }, positionRuns(alignmentMatchSet).map(run => (React.createElement(Band, { key: run.start, start: run.start, end: run.end - 1, columnWidth: columnWidth, background: MATCH_COLOR }))))) : null,
        clickAlignmentRanges.map(range => (React.createElement(Band, { key: range.start, start: range.start, end: range.end, columnWidth: columnWidth, background: SELECTION_COLOR })))));
});
/**
 * The interaction state, drawn once over every row of the panel so the
 * sequence, the ruler and the tracks all agree on which columns are hovered
 * and selected. Columns are inclusive.
 */
const ColumnOverlays = observer(function ColumnOverlays({ model, }) {
    const { clickAlignmentRanges, alignmentHoverRange, alignmentHoverPos, columnWidth, } = model;
    return (React.createElement(Layer, { zIndex: 1 },
        clickAlignmentRanges.map(range => (React.createElement(Band, { key: range.start, start: range.start, end: range.end, columnWidth: columnWidth, background: "transparent", border: SELECTION_OUTLINE }))),
        alignmentHoverRange ? (React.createElement(Band, { start: alignmentHoverRange.start, end: alignmentHoverRange.end, columnWidth: columnWidth, background: HOVER_RANGE_COLOR })) : null,
        alignmentHoverPos === undefined ? null : (React.createElement(Band, { start: alignmentHoverPos, end: alignmentHoverPos, columnWidth: columnWidth, background: HOVER_COLOR }))));
});
export default ColumnOverlays;
