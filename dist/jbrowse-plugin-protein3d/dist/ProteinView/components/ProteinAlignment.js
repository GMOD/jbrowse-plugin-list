import React, { useEffect, useRef } from 'react';
import { Tooltip, Typography } from '@mui/material';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { CHAR_WIDTH, LABEL_WIDTH, ROW_HEIGHT } from '../constants';
import useProteinFeatureTrackData from '../hooks/useProteinFeatureTrackData';
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton';
import { ProteinFeatureTrackContent, ProteinFeatureTrackLabels, } from './ProteinFeatureTrack';
import SplitString, { AlignmentHighlights } from './SplitString';
const ProteinAlignment = observer(function ProteinAlignment({ model, }) {
    const { pairwiseAlignment, showHighlight, showProteinTracks, autoScrollAlignment, uniprotId, } = model;
    const containerRef = useRef(null);
    const { data: featureData, isLoading: featureLoading, error: featureError, } = useProteinFeatureTrackData(model, uniprotId);
    useEffect(() => reaction(() => model.alignmentHoverPos, alignmentHoverPos => {
        const container = containerRef.current;
        if (!autoScrollAlignment ||
            model.isMouseInAlignment ||
            alignmentHoverPos === undefined ||
            !container) {
            return;
        }
        const scrollPosition = alignmentHoverPos * CHAR_WIDTH;
        container.scrollTo({
            left: scrollPosition - container.clientWidth / 2,
            behavior: 'smooth',
        });
    }), [model, autoScrollAlignment]);
    if (!pairwiseAlignment) {
        return React.createElement("div", null, "No pairwiseAlignment");
    }
    const a0 = pairwiseAlignment.alns[0].seq;
    const a1 = pairwiseAlignment.alns[1].seq;
    const con = pairwiseAlignment.consensus;
    return (React.createElement("div", null,
        React.createElement(ProteinAlignmentHelpButton, { model: model }),
        React.createElement(Typography, null,
            "Alignment of the protein structure file's sequence with the selected transcript's sequence.",
            ' ',
            showHighlight ? 'Green is the aligned portion' : null),
        React.createElement("div", { style: {
                display: 'flex',
                fontSize: 9,
                fontFamily: 'monospace',
                cursor: 'pointer',
                margin: 8,
                paddingBottom: 8,
            }, onMouseEnter: () => {
                model.setIsMouseInAlignment(true);
            }, onMouseLeave: () => {
                model.setIsMouseInAlignment(false);
                model.setHoveredPosition(undefined);
                model.clearHoverGenomeHighlights();
                model.clearHighlightFromExternal();
            } },
            React.createElement("div", { style: {
                    flexShrink: 0,
                    width: LABEL_WIDTH,
                    textAlign: 'right',
                    paddingRight: 4,
                } },
                React.createElement("div", { style: { height: ROW_HEIGHT } },
                    React.createElement(Tooltip, { title: "This is the sequence of the protein from the reference genome transcript" },
                        React.createElement("span", null, "GENOME"))),
                React.createElement("div", { style: { height: ROW_HEIGHT } }, "\u00A0"),
                React.createElement("div", { style: { height: ROW_HEIGHT } },
                    React.createElement(Tooltip, { title: "This is the sequence of the protein from the structure file" },
                        React.createElement("span", null, "STRUCT"))),
                showProteinTracks ? (featureLoading ? (React.createElement("div", { style: { height: ROW_HEIGHT, fontSize: 8, color: '#666' } }, "Loading...")) : featureError ? (React.createElement(Tooltip, { title: featureError instanceof Error
                        ? featureError.message
                        : 'Error loading features' },
                    React.createElement("div", { style: { height: ROW_HEIGHT, fontSize: 8, color: 'red' } }, "Error"))) : featureData ? (React.createElement(ProteinFeatureTrackLabels, { data: featureData, labelWidth: LABEL_WIDTH, model: model })) : null) : null),
            React.createElement("div", { ref: containerRef, style: {
                    overflow: 'auto',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    paddingBottom: 10,
                    backgroundColor: 'white',
                } },
                React.createElement("div", { style: { position: 'relative' } },
                    React.createElement(AlignmentHighlights, { model: model, strLength: a0.length, height: ROW_HEIGHT * 3 }),
                    React.createElement("div", { style: { height: ROW_HEIGHT } },
                        React.createElement(SplitString, { model: model, str: a0 })),
                    React.createElement("div", { style: { height: ROW_HEIGHT } },
                        React.createElement(SplitString, { model: model, str: con })),
                    React.createElement("div", { style: { height: ROW_HEIGHT } },
                        React.createElement(SplitString, { model: model, str: a1 }))),
                showProteinTracks && featureData ? (React.createElement(ProteinFeatureTrackContent, { data: featureData, model: model })) : null))));
});
export default ProteinAlignment;
//# sourceMappingURL=ProteinAlignment.js.map