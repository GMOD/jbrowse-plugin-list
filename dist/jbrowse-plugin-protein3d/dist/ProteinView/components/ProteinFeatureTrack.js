import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { CHAR_WIDTH, HIDE_BUTTON_COLOR, HOVERED_BORDER, HOVER_MARKER_COLOR, SELECTED_BORDER, TRACK_GAP, TRACK_HEIGHT, } from '../constants';
import { selectResidueRange } from '../highlightResidueRange';
import { getFeatureColor } from '../hooks/useUniProtFeatures';
import { clickProteinToGenome } from '../proteinToGenomeMapping';
function getFeatureAlignmentRange(feature, structurePositionToAlignmentMap) {
    const startAlignmentPos = structurePositionToAlignmentMap?.[feature.start - 1];
    const endAlignmentPos = structurePositionToAlignmentMap?.[feature.end - 1];
    return startAlignmentPos !== undefined && endAlignmentPos !== undefined
        ? { start: startAlignmentPos, end: endAlignmentPos }
        : undefined;
}
function getVisibleTypes(featureTypes, hiddenFeatureTypes) {
    return featureTypes.filter(type => !hiddenFeatureTypes.has(type));
}
function getFeatureGeometry(feature, structurePositionToAlignmentMap) {
    const startAlnPos = structurePositionToAlignmentMap?.[feature.start - 1] ?? feature.start - 1;
    const endAlnPos = structurePositionToAlignmentMap?.[feature.end - 1] ?? feature.end - 1;
    return {
        left: startAlnPos * CHAR_WIDTH,
        width: Math.max((endAlnPos - startAlnPos + 1) * CHAR_WIDTH, 3),
    };
}
function FeatureTooltipContent({ feature }) {
    return (React.createElement("div", null,
        React.createElement("div", null,
            React.createElement("strong", null, feature.type)),
        React.createElement("div", null,
            "Position: ",
            feature.start,
            "-",
            feature.end),
        feature.description ? React.createElement("div", null, feature.description) : null));
}
const FeatureBar = observer(function FeatureBar({ feature, model, }) {
    const [isHovered, setIsHovered] = useState(false);
    const { molstarPluginContext, selectedFeatureId, structurePositionToAlignmentMap, } = model;
    const isSelected = selectedFeatureId === feature.uniqueId;
    const handleMouseEnter = () => {
        setIsHovered(true);
        const range = getFeatureAlignmentRange(feature, structurePositionToAlignmentMap);
        if (range) {
            model.setAlignmentHoverRange(range);
        }
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
        model.setAlignmentHoverRange(undefined);
    };
    const handleClick = () => {
        const structure = model.molstarStructure;
        const newSelected = !isSelected;
        if (structure && molstarPluginContext) {
            if (newSelected) {
                selectResidueRange({
                    structure,
                    startResidue: feature.start,
                    endResidue: feature.end,
                    plugin: molstarPluginContext,
                }).catch((e) => {
                    console.error(e);
                    model.setError(e);
                });
            }
            else {
                molstarPluginContext.managers.interactivity.lociSelects.deselectAll();
            }
        }
        if (newSelected) {
            model.setSelectedFeatureId(feature.uniqueId);
            clickProteinToGenome({
                model,
                structureSeqPos: feature.start - 1,
                structureSeqEndPos: feature.end,
            }).catch((e) => {
                console.error(e);
                model.setError(e);
            });
        }
        else {
            model.setSelectedFeatureId(undefined);
            model.setClickedStructureRange(undefined);
        }
    };
    const { left, width } = getFeatureGeometry(feature, structurePositionToAlignmentMap);
    const color = getFeatureColor(feature.type);
    return (React.createElement(Tooltip, { title: React.createElement(FeatureTooltipContent, { feature: feature }), followCursor: true },
        React.createElement("div", { onClick: () => {
                handleClick();
            }, onMouseEnter: () => {
                handleMouseEnter();
            }, onMouseLeave: () => {
                handleMouseLeave();
            }, style: {
                position: 'absolute',
                left,
                top: 0,
                width,
                height: TRACK_HEIGHT,
                backgroundColor: color,
                opacity: isHovered || isSelected ? 0.9 : 0.6,
                cursor: 'pointer',
                borderRadius: 2,
                border: isSelected
                    ? SELECTED_BORDER
                    : isHovered
                        ? HOVERED_BORDER
                        : 'none',
                boxSizing: 'border-box',
            } })));
});
const HoverMarker = observer(function HoverMarker({ model, }) {
    const { alignmentHoverPos } = model;
    if (alignmentHoverPos === undefined) {
        return null;
    }
    const left = alignmentHoverPos * CHAR_WIDTH;
    return (React.createElement("div", { style: {
            position: 'absolute',
            left,
            top: 0,
            bottom: 0,
            width: CHAR_WIDTH,
            backgroundColor: HOVER_MARKER_COLOR,
            pointerEvents: 'none',
            zIndex: 10,
        } }));
});
const FeatureTypeLabel = observer(function FeatureTypeLabel({ type, labelWidth, model, }) {
    return (React.createElement(Tooltip, { title: type, placement: "left" },
        React.createElement("div", { style: {
                height: TRACK_HEIGHT + TRACK_GAP,
                width: labelWidth - 4,
                fontSize: 9,
                fontFamily: 'monospace',
                textAlign: 'right',
                paddingRight: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
            } },
            React.createElement("span", { onClick: e => {
                    e.stopPropagation();
                    model.hideFeatureType(type);
                }, style: {
                    cursor: 'pointer',
                    color: HIDE_BUTTON_COLOR,
                    fontWeight: 'bold',
                    fontSize: 8,
                    lineHeight: 1,
                }, title: `Hide ${type} track` }, "x"),
            React.createElement("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, type))));
});
const FeatureTypeTrackContent = observer(function FeatureTypeTrackContent({ features, model, sequenceLength, }) {
    const trackWidth = sequenceLength * CHAR_WIDTH;
    return (React.createElement("div", { style: {
            position: 'relative',
            height: TRACK_HEIGHT,
            width: trackWidth,
            marginBottom: TRACK_GAP,
        } },
        features.map(feature => (React.createElement(FeatureBar, { key: feature.uniqueId, feature: feature, model: model }))),
        React.createElement(HoverMarker, { model: model })));
});
export const ProteinFeatureTrackLabels = observer(function ProteinFeatureTrackLabels({ data, labelWidth, model, }) {
    const { hiddenFeatureTypes } = model;
    const visibleTypes = getVisibleTypes(data.featureTypes, hiddenFeatureTypes);
    return (React.createElement(React.Fragment, null, visibleTypes.map(type => (React.createElement(FeatureTypeLabel, { key: type, type: type, labelWidth: labelWidth, model: model })))));
});
export const ProteinFeatureTrackContent = observer(function ProteinFeatureTrackContent({ data, model, }) {
    const { hiddenFeatureTypes } = model;
    const visibleTypes = getVisibleTypes(data.featureTypes, hiddenFeatureTypes);
    return (React.createElement("div", { onMouseMove: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const alignmentPos = Math.floor(x / CHAR_WIDTH);
            if (alignmentPos >= 0 && alignmentPos < data.sequenceLength) {
                model.hoverAlignmentPosition(alignmentPos);
            }
        }, onMouseLeave: () => {
            model.setHoveredPosition(undefined);
        } }, visibleTypes.map(type => (React.createElement(FeatureTypeTrackContent, { key: type, features: data.groupedFeatures[type], model: model, sequenceLength: data.sequenceLength })))));
});
