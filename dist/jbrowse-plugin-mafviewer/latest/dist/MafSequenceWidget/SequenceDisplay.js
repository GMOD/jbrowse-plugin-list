import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import LabelsCanvas from './LabelsCanvas';
import SequenceCanvas from './SequenceCanvas';
import SequenceTooltip from './SequenceTooltip';
import { buildColToGenomePos, findRefSampleIndex } from './colToGenomePos';
import { CHAR_WIDTH, ROW_HEIGHT } from './constants';
const DEFAULT_LABEL_WIDTH = 150;
const MIN_LABEL_WIDTH = 50;
const MAX_LABEL_WIDTH = 400;
const useStyles = makeStyles()(theme => ({
    container: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        maxHeight: 400,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        overflow: 'hidden',
    },
    labelsWrapper: {
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
    },
    resizeHandle: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 4,
        height: '100%',
        cursor: 'col-resize',
        backgroundColor: theme.palette.divider,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
    },
    sequenceWrapper: {
        flexGrow: 1,
        minWidth: 0,
        overflow: 'auto',
    },
    sequenceInner: {
        position: 'relative',
    },
}));
const SequenceDisplay = observer(function SequenceDisplay({ model, sequences, colorBackground, showSampleNames, }) {
    const { classes } = useStyles();
    const seqWrapperRef = useRef(null);
    const { samples, regions } = model;
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [containerHeight, setContainerHeight] = useState(400);
    const [containerWidth, setContainerWidth] = useState(800);
    const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL_WIDTH);
    const [hoveredCol, setHoveredCol] = useState();
    const [hoveredRow, setHoveredRow] = useState();
    const [tooltipPos, setTooltipPos] = useState();
    const seqLength = sequences[0]?.length || 0;
    const totalSeqWidth = seqLength * CHAR_WIDTH;
    const totalHeight = samples ? samples.length * ROW_HEIGHT : 0;
    const colToGenomePos = useMemo(() => {
        if (!regions) {
            return [];
        }
        const region = regions[0];
        if (!region) {
            return [];
        }
        const refIdx = findRefSampleIndex(samples, region.assemblyName);
        const refSequence = sequences[refIdx] || '';
        return buildColToGenomePos(refSequence, region.start);
    }, [sequences, regions, samples]);
    useEffect(() => {
        const seqWrapper = seqWrapperRef.current;
        if (!seqWrapper) {
            return;
        }
        const handleScroll = () => {
            setScrollTop(seqWrapper.scrollTop);
            setScrollLeft(seqWrapper.scrollLeft);
        };
        seqWrapper.addEventListener('scroll', handleScroll);
        return () => {
            seqWrapper.removeEventListener('scroll', handleScroll);
        };
    }, []);
    useEffect(() => {
        const seqWrapper = seqWrapperRef.current;
        if (!seqWrapper) {
            return;
        }
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { height, width } = entry.contentRect;
                if (height > 0) {
                    setContainerHeight(height);
                }
                if (width > 0) {
                    setContainerWidth(width);
                }
            }
        });
        resizeObserver.observe(seqWrapper);
        setContainerHeight(seqWrapper.clientHeight || 400);
        setContainerWidth(seqWrapper.clientWidth || 800);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);
    // Handle resize drag
    const handleResizeMouseDown = useCallback((e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = labelWidth;
        const handleMouseMove = (moveEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.min(MAX_LABEL_WIDTH, Math.max(MIN_LABEL_WIDTH, startWidth + delta));
            setLabelWidth(newWidth);
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [labelWidth]);
    const handleHover = useCallback((col, row, clientX, clientY) => {
        if (!regions) {
            return;
        }
        setHoveredCol(col);
        setHoveredRow(row);
        setTooltipPos({ x: clientX, y: clientY });
        if (col !== undefined) {
            const genomicPos = colToGenomePos[col];
            const region = regions[0];
            if (genomicPos !== undefined && region) {
                model.setHoverHighlight({
                    refName: region.refName,
                    start: genomicPos,
                    end: genomicPos + 1,
                    assemblyName: region.assemblyName,
                });
            }
            else {
                model.setHoverHighlight(undefined);
            }
        }
        else {
            model.setHoverHighlight(undefined);
        }
    }, [colToGenomePos, model, regions]);
    const handleLeave = useCallback(() => {
        setHoveredCol(undefined);
        setHoveredRow(undefined);
        setTooltipPos(undefined);
        model.setHoverHighlight(undefined);
    }, [model]);
    if (!samples || !regions || sequences.length === 0) {
        return React.createElement("div", null, "No sequence data");
    }
    const hoveredSample = hoveredRow !== undefined ? samples[hoveredRow] : undefined;
    const hoveredChar = hoveredRow !== undefined && hoveredCol !== undefined
        ? sequences[hoveredRow]?.[hoveredCol]
        : undefined;
    const genomicPos = hoveredCol !== undefined ? colToGenomePos[hoveredCol] : undefined;
    return (React.createElement("div", { className: classes.container },
        showSampleNames && (React.createElement("div", { className: classes.labelsWrapper, style: { width: labelWidth, height: containerHeight } },
            React.createElement(LabelsCanvas, { samples: samples, labelWidth: labelWidth, scrollTop: scrollTop, containerHeight: containerHeight }),
            React.createElement("div", { className: classes.resizeHandle, onMouseDown: handleResizeMouseDown }))),
        React.createElement("div", { ref: seqWrapperRef, className: classes.sequenceWrapper },
            React.createElement("div", { className: classes.sequenceInner, style: { width: totalSeqWidth, height: totalHeight } },
                React.createElement(SequenceCanvas, { samples: samples, sequences: sequences, colorBackground: colorBackground, hoveredCol: hoveredCol, scrollTop: scrollTop, scrollLeft: scrollLeft, containerHeight: containerHeight, containerWidth: containerWidth, onHover: handleHover, onLeave: handleLeave }))),
        tooltipPos && hoveredSample && (React.createElement(SequenceTooltip, { x: tooltipPos.x, y: tooltipPos.y, sample: hoveredSample, base: hoveredChar, genomicPos: genomicPos }))));
});
export default SequenceDisplay;
//# sourceMappingURL=SequenceDisplay.js.map