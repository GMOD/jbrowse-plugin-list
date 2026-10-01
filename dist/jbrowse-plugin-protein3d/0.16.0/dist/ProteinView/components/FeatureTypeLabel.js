import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { IconButton, Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { HIDE_BUTTON_COLOR } from '../constants';
const FeatureTypeLabel = observer(function FeatureTypeLabel({ type, laneCount, model, }) {
    const expanded = model.expandedFeatureTypes.has(type);
    const iconSize = model.trackHeight;
    return (React.createElement(Tooltip, { title: type, placement: "left" },
        React.createElement("div", { style: {
                height: '100%',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: expanded ? 'flex-start' : 'center',
                justifyContent: 'flex-end',
                gap: 2,
            } },
            React.createElement(IconButton, { onClick: () => {
                    model.hideFeatureType(type);
                }, title: `Hide ${type} track`, sx: { p: 0, color: HIDE_BUTTON_COLOR } },
                React.createElement(CloseIcon, { sx: { fontSize: iconSize } })),
            laneCount > 1 ? (React.createElement(IconButton, { onClick: () => {
                    model.toggleFeatureTypeExpanded(type);
                }, title: expanded
                    ? `Collapse ${type} track`
                    : `Expand ${type} track (${laneCount} overlapping rows)`, sx: { p: 0, color: HIDE_BUTTON_COLOR } }, expanded ? (React.createElement(UnfoldLessIcon, { sx: { fontSize: iconSize } })) : (React.createElement(UnfoldMoreIcon, { sx: { fontSize: iconSize } })))) : null,
            React.createElement("span", null, type))));
});
export default FeatureTypeLabel;
