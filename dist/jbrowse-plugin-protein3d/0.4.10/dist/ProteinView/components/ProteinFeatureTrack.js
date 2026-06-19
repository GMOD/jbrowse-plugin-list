import React from 'react';
import { observer } from 'mobx-react';
import { CHAR_WIDTH, TRACK_GAP, TRACK_HEIGHT } from '../constants';
import FeatureBar from './FeatureBar';
import FeatureTypeLabel from './FeatureTypeLabel';
import HoverMarker from './HoverMarker';
function getVisibleTypes(featureTypes, hiddenFeatureTypes) {
    return featureTypes.filter(type => !hiddenFeatureTypes.has(type));
}
const FeatureTypeTrackContent = observer(function FeatureTypeTrackContent({ features, model, sequenceLength, }) {
    return (React.createElement("div", { style: {
            position: 'relative',
            height: TRACK_HEIGHT,
            width: sequenceLength * CHAR_WIDTH,
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
