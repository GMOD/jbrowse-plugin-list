import React from 'react';
import { observer } from 'mobx-react';
import { CHAR_WIDTH } from '../constants';
const CharacterSpans = observer(function CharacterSpans({ str, }) {
    return str.split('').map((char, i) => (React.createElement("span", { key: i, style: {
            position: 'absolute',
            left: i * CHAR_WIDTH,
            width: CHAR_WIDTH,
        } }, char === ' ' ? '\u00A0' : char)));
});
/**
 * Collapse a set of matching columns into contiguous [start, end) runs. A
 * well-matched alignment is nearly all one run, so this turns one DOM node per
 * residue into a handful for the whole overlay.
 */
export function matchRuns(columns) {
    const sorted = [...columns].sort((a, b) => a - b);
    const runs = [];
    for (const col of sorted) {
        const last = runs.at(-1);
        if (last?.end === col) {
            last.end = col + 1;
        }
        else {
            runs.push({ start: col, end: col + 1 });
        }
    }
    return runs;
}
const MatchOverlays = observer(function MatchOverlays({ model, height, }) {
    const { showHighlight, alignmentMatchSet } = model;
    return !showHighlight || !alignmentMatchSet
        ? null
        : matchRuns(alignmentMatchSet).map(run => (React.createElement("span", { key: run.start, style: {
                position: 'absolute',
                left: run.start * CHAR_WIDTH,
                top: 0,
                width: (run.end - run.start) * CHAR_WIDTH,
                height,
                background: '#33ff19a0',
                pointerEvents: 'none',
            } })));
});
const HoverHighlight = observer(function HoverHighlight({ model, strLength, height, }) {
    const { alignmentHoverPos } = model;
    const showHoverHighlight = alignmentHoverPos !== undefined &&
        alignmentHoverPos >= 0 &&
        alignmentHoverPos < strLength;
    return !showHoverHighlight ? null : (React.createElement("span", { style: {
            position: 'absolute',
            left: alignmentHoverPos * CHAR_WIDTH,
            top: 0,
            width: CHAR_WIDTH,
            height,
            background: '#f698',
            pointerEvents: 'none',
        } }));
});
const RangeHighlight = observer(function RangeHighlight({ range, strLength, background, border, height, }) {
    if (!range) {
        return null;
    }
    const { start, end } = range;
    const clampedStart = Math.max(0, start);
    const clampedEnd = Math.min(strLength - 1, end);
    if (clampedStart > clampedEnd) {
        return null;
    }
    const width = (clampedEnd - clampedStart + 1) * CHAR_WIDTH;
    return (React.createElement("span", { style: {
            position: 'absolute',
            left: clampedStart * CHAR_WIDTH,
            top: 0,
            width,
            height,
            background,
            border,
            boxSizing: 'border-box',
            pointerEvents: 'none',
        } }));
});
export const AlignmentHighlights = observer(function AlignmentHighlights({ model, strLength, height, }) {
    return (React.createElement("div", { style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: strLength * CHAR_WIDTH,
            height,
            pointerEvents: 'none',
        } },
        React.createElement(MatchOverlays, { model: model, height: height }),
        React.createElement(RangeHighlight, { range: model.clickAlignmentRange, strLength: strLength, background: "rgba(0, 120, 255, 0.3)", border: "1px solid rgba(0, 120, 255, 0.6)", height: height }),
        React.createElement(RangeHighlight, { range: model.alignmentHoverRange, strLength: strLength, background: "rgba(255, 165, 0, 0.4)", height: height }),
        React.createElement(HoverHighlight, { model: model, strLength: strLength, height: height })));
});
const SplitString = observer(function SplitString({ model, str, }) {
    return (React.createElement("span", { style: {
            position: 'relative',
            display: 'inline-block',
            width: str.length * CHAR_WIDTH,
            height: '1em',
        }, onMouseMove: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const index = Math.floor(x / CHAR_WIDTH);
            if (index >= 0 && index < str.length) {
                model.hoverAlignmentPosition(index);
            }
        }, onClick: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const index = Math.floor(x / CHAR_WIDTH);
            if (index >= 0 && index < str.length) {
                model.clickAlignmentPosition(index);
            }
        } },
        React.createElement(CharacterSpans, { str: str })));
});
export default SplitString;
