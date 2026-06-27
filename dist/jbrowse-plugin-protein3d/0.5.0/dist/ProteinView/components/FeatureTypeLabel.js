import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { HIDE_BUTTON_COLOR } from '../constants';
const FeatureTypeLabel = observer(function FeatureTypeLabel({ type, labelWidth, model, }) {
    return (React.createElement(Tooltip, { title: type, placement: "left" },
        React.createElement("div", { style: {
                height: model.trackHeight + model.trackGap,
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
            React.createElement(IconButton, { onClick: e => {
                    e.stopPropagation();
                    model.hideFeatureType(type);
                }, title: `Hide ${type} track`, sx: { p: 0, color: HIDE_BUTTON_COLOR } },
                React.createElement(CloseIcon, { sx: { fontSize: model.trackHeight } })),
            React.createElement("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, type))));
});
export default FeatureTypeLabel;
