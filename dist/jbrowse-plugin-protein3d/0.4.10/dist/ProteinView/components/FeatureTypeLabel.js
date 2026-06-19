import React from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { HIDE_BUTTON_COLOR, TRACK_GAP, TRACK_HEIGHT } from '../constants';
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
export default FeatureTypeLabel;
