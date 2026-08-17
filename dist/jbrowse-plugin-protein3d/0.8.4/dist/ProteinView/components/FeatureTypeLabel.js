import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { IconButton, Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { HIDE_BUTTON_COLOR } from '../constants';
const FeatureTypeLabel = observer(function FeatureTypeLabel({ type, laneCount, expanded, labelWidth, model, }) {
    const lanes = expanded ? laneCount : 1;
    const canExpand = laneCount > 1;
    return (React.createElement(Tooltip, { title: type, placement: "left" },
        React.createElement("div", { style: {
                height: lanes * (model.trackHeight + model.trackGap),
                width: labelWidth - 4,
                fontSize: 9,
                fontFamily: 'monospace',
                textAlign: 'right',
                paddingRight: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: expanded ? 'flex-start' : 'center',
                justifyContent: 'flex-end',
                gap: 2,
            } },
            React.createElement(IconButton, { onClick: e => {
                    e.stopPropagation();
                    model.hideFeatureType(type);
                }, title: `Hide ${type} track`, sx: { p: 0, color: HIDE_BUTTON_COLOR } },
                React.createElement(CloseIcon, { sx: { fontSize: model.trackHeight } })),
            canExpand ? (React.createElement(IconButton, { onClick: e => {
                    e.stopPropagation();
                    model.toggleFeatureTypeExpanded(type);
                }, title: expanded
                    ? `Collapse ${type} track`
                    : `Expand ${type} track (${laneCount} overlapping rows)`, sx: { p: 0, color: HIDE_BUTTON_COLOR } }, expanded ? (React.createElement(UnfoldLessIcon, { sx: { fontSize: model.trackHeight } })) : (React.createElement(UnfoldMoreIcon, { sx: { fontSize: model.trackHeight } })))) : null,
            React.createElement("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, type))));
});
export default FeatureTypeLabel;
