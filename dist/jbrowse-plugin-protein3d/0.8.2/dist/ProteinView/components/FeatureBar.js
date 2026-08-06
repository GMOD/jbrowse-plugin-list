import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { HOVERED_BORDER, SELECTED_BORDER } from '../constants';
import { getFeatureColor } from '../hooks/useUniProtFeatures';
import { clickProteinToGenome } from '../proteinToGenomeMapping';
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
const FeatureBar = observer(function FeatureBar({ layout, top, model, }) {
    const [isHovered, setIsHovered] = useState(false);
    const { selectedFeatureId } = model;
    const { feature, left, width } = layout;
    const isSelected = selectedFeatureId === feature.uniqueId;
    const handleMouseEnter = () => {
        setIsHovered(true);
        model.setAlignmentHoverRange({
            start: layout.alignmentStart,
            end: layout.alignmentEnd,
        });
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
        model.setAlignmentHoverRange(undefined);
    };
    // The model's `select` autorun owns the magenta molstar selection, deriving
    // it from clickedStructureRange. Setting/clearing that range here (rather than
    // also driving molstar imperatively) keeps a single source of truth: on
    // deselect the autorun correctly falls back to the whole-alignment highlight
    // when showHighlight is on, instead of blanking the selection.
    const handleClick = () => {
        if (isSelected) {
            model.setSelectedFeatureId(undefined);
            model.setClickedStructureRange(undefined);
        }
        else {
            model.setSelectedFeatureId(feature.uniqueId);
            clickProteinToGenome({
                model,
                structureSeqPos: layout.structureStart,
                structureSeqEndPos: layout.structureEnd,
            }).catch((e) => {
                console.error(e);
                model.setError(e);
            });
        }
    };
    const color = getFeatureColor(feature.type);
    return (React.createElement(Tooltip, { title: React.createElement(FeatureTooltipContent, { feature: feature }), followCursor: true },
        React.createElement("div", { "data-testid": `protein-feature-${feature.type}`, "data-feature-id": feature.uniqueId, "data-feature-start": feature.start, "data-feature-end": feature.end, onClick: () => {
                handleClick();
            }, onMouseEnter: () => {
                handleMouseEnter();
            }, onMouseLeave: () => {
                handleMouseLeave();
            }, style: {
                position: 'absolute',
                left,
                top,
                width,
                height: model.trackHeight,
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
