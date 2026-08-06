import React, { useEffect, useRef } from 'react';
import { Tooltip, Typography } from '@mui/material';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import HoverMarker from './HoverMarker';
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton';
import { ProteinFeatureTrackContent, ProteinFeatureTrackLabels, } from './ProteinFeatureTrack';
import ResidueValueTrack from './ResidueValueTrack';
import SplitString, { AlignmentHighlights } from './SplitString';
import { uniprotEntryUrl } from '../../LaunchProteinView/utils/structureUrls';
import ExternalLink from '../../components/ExternalLink';
import { structureAlignedSeq, transcriptAlignedSeq } from '../../mappings';
import { largeJumpScrollTarget, offScreenCenterTarget } from '../autoScroll';
import { CHAR_WIDTH, LABEL_WIDTH, ROW_HEIGHT } from '../constants';
import useProteinFeatureTrackData from '../hooks/useProteinFeatureTrackData';
import useStructureUniProt from '../hooks/useStructureUniProt';
import { hydrophobicityColor, plddtColor } from '../residueTracks';
// The alignment is drawn on its own panel rather than the page background, so
// it needs the theme's paper color explicitly — hardcoding white left the
// residue letters (theme text color) invisible under the dark theme.
const useStyles = makeStyles()(theme => ({
    scroll: {
        overflow: 'auto',
        whiteSpace: 'nowrap',
        flex: 1,
        paddingBottom: 10,
        backgroundColor: theme.palette.background.paper,
    },
    gutterStatus: {
        height: ROW_HEIGHT,
        fontSize: 8,
        color: theme.palette.text.secondary,
    },
    gutterError: {
        height: ROW_HEIGHT,
        fontSize: 8,
        color: theme.palette.error.main,
    },
}));
// Which UniProt entry the feature tracks came from. For an AlphaFold model that
// is in the filename, but for a PDB entry it is resolved via SIFTS and is
// otherwise invisible — leaving no way to tell which protein got annotated.
function UniProtProvenance({ uniprotId, uniprotName, }) {
    return uniprotId ? (React.createElement(Typography, { variant: "caption", color: "textSecondary", component: "div" },
        "Feature tracks from UniProt",
        ' ',
        React.createElement(ExternalLink, { href: uniprotEntryUrl(uniprotId) }, uniprotName ? `${uniprotId} (${uniprotName})` : uniprotId))) : null;
}
function GutterLabel({ label, title, height, }) {
    return (React.createElement(Tooltip, { title: title, placement: "left" },
        React.createElement("div", { style: {
                height,
                fontSize: 9,
                fontFamily: 'monospace',
                textAlign: 'right',
                paddingRight: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
            } }, label)));
}
const ProteinAlignment = observer(function ProteinAlignment({ model, }) {
    const { pairwiseAlignment, showHighlight, showProteinTracks, url, mappedEntityId, confidenceCells, hydrophobicityCells, } = model;
    const { classes } = useStyles();
    const containerRef = useRef(null);
    const lastScrolledSelectionRef = useRef(undefined);
    // AlphaFold models carry their accession in the URL; PDB entries need a SIFTS
    // lookup, which also supplies the UniProt->structure residue offset.
    const { uniprotId, uniprotName, mapUniProtPosition, isLoading: uniprotLoading, error: uniprotError, } = useStructureUniProt({ url, mappedEntityId });
    const { data: featureData, isLoading: trackLoading, error: trackError, } = useProteinFeatureTrackData(model, uniprotId, mapUniProtPosition);
    const featureLoading = uniprotLoading || trackLoading;
    const featureError = uniprotError ?? trackError;
    // Recenter only on a large jump — when the hovered column lands well outside
    // the viewport (e.g. hovering a distant residue in the 3D structure). A column
    // that has merely edged just off-screen during a continuous hover sweep is
    // left alone, so the panel doesn't feel like it's constantly re-centering.
    useEffect(() => autorun(() => {
        const container = containerRef.current;
        if (model.autoScrollAlignment &&
            !model.isMouseInAlignment &&
            model.alignmentHoverPos !== undefined &&
            container) {
            const target = largeJumpScrollTarget({
                x: model.alignmentHoverPos * CHAR_WIDTH,
                scrollLeft: container.scrollLeft,
                clientWidth: container.clientWidth,
            });
            if (target !== undefined) {
                container.scrollTo({ left: target, behavior: 'smooth' });
            }
        }
    }), [model]);
    // Scroll a selection into view when it changes to an off-screen range — both
    // the declarative `initialSelection` on open and a later click on a distant
    // feature bar, which would otherwise select something the user can't see.
    // Keyed on the range so it fires once per distinct selection and doesn't fight
    // the user's own scrolling afterward.
    useEffect(() => autorun(() => {
        const container = containerRef.current;
        const range = model.clickAlignmentRange;
        if (container) {
            if (range) {
                const key = `${range.start}-${range.end}`;
                if (key !== lastScrolledSelectionRef.current) {
                    lastScrolledSelectionRef.current = key;
                    const target = offScreenCenterTarget({
                        start: range.start * CHAR_WIDTH,
                        end: (range.end + 1) * CHAR_WIDTH,
                        scrollLeft: container.scrollLeft,
                        clientWidth: container.clientWidth,
                    });
                    if (target !== undefined) {
                        container.scrollTo({ left: target, behavior: 'smooth' });
                    }
                }
            }
            else {
                lastScrolledSelectionRef.current = undefined;
            }
        }
    }), [model]);
    if (!pairwiseAlignment) {
        return React.createElement("div", null, "No pairwiseAlignment");
    }
    const a0 = transcriptAlignedSeq(pairwiseAlignment);
    const a1 = structureAlignedSeq(pairwiseAlignment);
    const con = pairwiseAlignment.consensus;
    return (React.createElement("div", null,
        React.createElement(ProteinAlignmentHelpButton, { model: model }),
        React.createElement(Typography, null,
            "Alignment of the protein structure file's sequence with the selected transcript's sequence.",
            ' ',
            showHighlight ? 'Green is the aligned portion' : null),
        showProteinTracks ? (React.createElement(UniProtProvenance, { uniprotId: uniprotId, uniprotName: uniprotName })) : null,
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
                showProteinTracks ? (featureLoading ? (React.createElement("div", { className: classes.gutterStatus }, "Loading...")) : featureError ? (React.createElement(Tooltip, { title: featureError instanceof Error
                        ? featureError.message
                        : 'Error loading features' },
                    React.createElement("div", { className: classes.gutterError }, "Error"))) : featureData ? (React.createElement(ProteinFeatureTrackLabels, { data: featureData, labelWidth: LABEL_WIDTH, model: model })) : null) : null,
                showProteinTracks && confidenceCells.length > 0 ? (React.createElement(GutterLabel, { label: "pLDDT", title: "AlphaFold per-residue confidence (pLDDT)", height: model.trackHeight + model.trackGap })) : null,
                showProteinTracks && hydrophobicityCells.length > 0 ? (React.createElement(GutterLabel, { label: "hydro", title: "Kyte-Doolittle hydrophobicity (orange hydrophobic, blue hydrophilic)", height: model.trackHeight + model.trackGap })) : null),
            React.createElement("div", { ref: containerRef, className: classes.scroll },
                React.createElement("div", { style: { position: 'relative' } },
                    React.createElement(AlignmentHighlights, { model: model, strLength: a0.length, height: ROW_HEIGHT * 3 }),
                    React.createElement("div", { style: { height: ROW_HEIGHT } },
                        React.createElement(SplitString, { model: model, str: a0 })),
                    React.createElement("div", { style: { height: ROW_HEIGHT } },
                        React.createElement(SplitString, { model: model, str: con })),
                    React.createElement("div", { style: { height: ROW_HEIGHT } },
                        React.createElement(SplitString, { model: model, str: a1 }))),
                showProteinTracks ? (React.createElement("div", { style: { position: 'relative' } },
                    featureData ? (React.createElement(ProteinFeatureTrackContent, { data: featureData, model: model })) : null,
                    confidenceCells.length > 0 ? (React.createElement(ResidueValueTrack, { cells: confidenceCells, colorFor: plddtColor, formatValue: v => `pLDDT ${v.toFixed(0)}`, sequenceLength: a0.length, model: model })) : null,
                    hydrophobicityCells.length > 0 ? (React.createElement(ResidueValueTrack, { cells: hydrophobicityCells, colorFor: hydrophobicityColor, formatValue: v => `Kyte-Doolittle ${v.toFixed(1)}`, sequenceLength: a0.length, model: model })) : null,
                    React.createElement(HoverMarker, { model: model }))) : null))));
});
export default ProteinAlignment;
