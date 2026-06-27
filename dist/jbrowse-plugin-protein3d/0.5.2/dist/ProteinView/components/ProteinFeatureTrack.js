import React from 'react';
import { observer } from 'mobx-react';
import { CHAR_WIDTH } from '../constants';
import FeatureBar from './FeatureBar';
import FeatureTypeLabel from './FeatureTypeLabel';
import HoverMarker from './HoverMarker';
const FeatureTypeTrackContent = observer(function FeatureTypeTrackContent({ features, model, sequenceLength, }) {
    return (React.createElement("div", { style: {
            position: 'relative',
            height: model.trackHeight,
            width: sequenceLength * CHAR_WIDTH,
            marginBottom: model.trackGap,
        } }, features.map(feature => (React.createElement(FeatureBar, { key: feature.uniqueId, feature: feature, model: model })))));
});
export const ProteinFeatureTrackLabels = observer(function ProteinFeatureTrackLabels({ data, labelWidth, model, }) {
    return (React.createElement(React.Fragment, null, data.visibleTypes.map(type => (React.createElement(FeatureTypeLabel, { key: type, type: type, labelWidth: labelWidth, model: model })))));
});
export const ProteinFeatureTrackContent = observer(function ProteinFeatureTrackContent({ data, model, }) {
    return (React.createElement("div", { style: { position: 'relative' }, onMouseMove: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const alignmentPos = Math.floor((e.clientX - rect.left) / CHAR_WIDTH);
            if (alignmentPos >= 0 && alignmentPos < data.sequenceLength) {
                model.hoverAlignmentPosition(alignmentPos);
            }
        }, onMouseLeave: () => {
            model.setHoveredPosition(undefined);
        } },
        data.visibleTypes.map(type => (React.createElement(FeatureTypeTrackContent, { key: type, features: data.groupedFeatures[type], model: model, sequenceLength: data.sequenceLength }))),
        React.createElement(HoverMarker, { model: model })));
});
