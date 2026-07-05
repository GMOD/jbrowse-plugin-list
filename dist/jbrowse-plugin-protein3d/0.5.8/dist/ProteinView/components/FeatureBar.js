import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { setMolstarLoci } from '../applyLociInteractivity';
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
    const { molstarPluginContext, selectedFeatureId } = model;
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
    const handleClick = () => {
        const structure = model.molstarStructure;
        const newSelected = !isSelected;
        if (structure && molstarPluginContext) {
            setMolstarLoci({
                structure,
                plugin: molstarPluginContext,
                channel: 'select',
                entityId: model.mappedEntityId,
                spec: newSelected
                    ? { kind: 'range', start: feature.start - 1, end: feature.end }
                    : undefined,
            }).catch((e) => {
                console.error(e);
                model.setError(e);
            });
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
