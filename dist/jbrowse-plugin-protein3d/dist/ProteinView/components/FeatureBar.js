import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { CHAR_WIDTH, HOVERED_BORDER, SELECTED_BORDER, TRACK_HEIGHT, } from '../constants';
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
export default FeatureBar;
