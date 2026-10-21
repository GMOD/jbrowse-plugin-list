import React from 'react';
import { observer } from 'mobx-react';
import FeatureBar from './FeatureBar';
// Bars are placed as fractions of the row, which alone carries the px height:
// dragging the resize handle then restyles one row instead of re-rendering
// every bar (p53 has 1,432, and a drag cost 180ms a frame).
const ProteinFeatureTrack = observer(function ProteinFeatureTrack({ group, model, }) {
    const { selectedFeatureId, trackGap } = model;
    const lanes = model.expandedFeatureTypes.has(group.type) ? group.laneCount : 1;
    const height = `calc(${100 / lanes}% - ${trackGap}px)`;
    return group.layouts.map(layout => (React.createElement(FeatureBar, { key: layout.feature.uniqueId, layout: layout, top: `${(Math.min(layout.lane, lanes - 1) / lanes) * 100}%`, height: height, selected: selectedFeatureId === layout.feature.uniqueId, model: model })));
});
export default ProteinFeatureTrack;
