import React from 'react';
import { Checkbox, Divider, ListItemText, Menu, MenuItem } from '@mui/material';
export default function LaunchOptionsMenu({ anchorEl, onClose, options, sideBySide, onSideBySideChange, }) {
    return (React.createElement(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: onClose, "data-testid": "protein-launch-options-menu" },
        options.map(opt => (React.createElement(MenuItem, { key: opt.key, "data-testid": `protein-launch-option-${opt.key}`, onClick: opt.onClick },
            React.createElement(ListItemText, { primary: opt.title, secondary: opt.description })))),
        React.createElement(Divider, null),
        React.createElement(MenuItem, { "data-testid": "protein-launch-side-by-side", onClick: () => {
                onSideBySideChange(!sideBySide);
            } },
            React.createElement(Checkbox, { checked: sideBySide, size: "small" }),
            React.createElement(ListItemText, { primary: "Open side by side", secondary: "Place the protein view right of the genome view instead of below it" }))));
}
