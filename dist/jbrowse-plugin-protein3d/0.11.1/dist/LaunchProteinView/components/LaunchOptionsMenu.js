import React from 'react';
import { ListItemText, Menu, MenuItem } from '@mui/material';
export default function LaunchOptionsMenu({ anchorEl, onClose, options, }) {
    return (React.createElement(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: onClose, "data-testid": "protein-launch-options-menu" }, options.map(opt => (React.createElement(MenuItem, { key: opt.key, "data-testid": `protein-launch-option-${opt.key}`, onClick: opt.onClick },
        React.createElement(ListItemText, { primary: opt.title, secondary: opt.description }))))));
}
