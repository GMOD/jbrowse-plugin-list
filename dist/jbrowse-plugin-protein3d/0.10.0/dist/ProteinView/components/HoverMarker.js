import React from 'react';
import { observer } from 'mobx-react';
import { CHAR_WIDTH, HOVER_MARKER_COLOR } from '../constants';
const HoverMarker = observer(function HoverMarker({ model, }) {
    const { alignmentHoverPos } = model;
    if (alignmentHoverPos === undefined) {
        return null;
    }
    return (React.createElement("div", { style: {
            position: 'absolute',
            left: alignmentHoverPos * CHAR_WIDTH,
            top: 0,
            bottom: 0,
            width: CHAR_WIDTH,
            backgroundColor: HOVER_MARKER_COLOR,
            pointerEvents: 'none',
            zIndex: 10,
        } }));
});
export default HoverMarker;
