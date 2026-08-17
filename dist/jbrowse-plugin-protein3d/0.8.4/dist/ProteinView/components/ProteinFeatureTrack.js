import React from 'react';
import { observer } from 'mobx-react';
import FeatureBar from './FeatureBar';
import FeatureTypeLabel from './FeatureTypeLabel';
import { CHAR_WIDTH } from '../constants';
import useAlignmentColumnHover from '../hooks/useAlignmentColumnHover';
const FeatureTypeTrackContent = observer(function FeatureTypeTrackContent({ group, model, sequenceLength, expanded, }) {
    const lanes = expanded ? group.laneCount : 1;
    const laneUnit = model.trackHeight + model.trackGap;
    return (React.createElement("div", { style: {
            position: 'relative',
            height: lanes * model.trackHeight + (lanes - 1) * model.trackGap,
            width: sequenceLength * CHAR_WIDTH,
            marginBottom: model.trackGap,
        } }, group.layouts.map(layout => (React.createElement(FeatureBar, { key: layout.feature.uniqueId, layout: layout, top: (expanded ? layout.lane : 0) * laneUnit, model: model })))));
});
export const ProteinFeatureTrackLabels = observer(function ProteinFeatureTrackLabels({ data, labelWidth, model, }) {
    return (React.createElement(React.Fragment, null, data.visibleGroups.map(group => (React.createElement(FeatureTypeLabel, { key: group.type, type: group.type, laneCount: group.laneCount, expanded: model.expandedFeatureTypes.has(group.type), labelWidth: labelWidth, model: model })))));
});
export const ProteinFeatureTrackContent = observer(function ProteinFeatureTrackContent({ data, model, }) {
    const hoverHandlers = useAlignmentColumnHover(model, data.sequenceLength);
    return (React.createElement("div", { ...hoverHandlers }, data.visibleGroups.map(group => (React.createElement(FeatureTypeTrackContent, { key: group.type, group: group, model: model, sequenceLength: data.sequenceLength, expanded: model.expandedFeatureTypes.has(group.type) })))));
});
