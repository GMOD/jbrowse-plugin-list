import React from 'react';
import { Dialog, DialogContent, DialogTitle, MenuItem, MenuList, Typography, } from '@mui/material';
export default function LaunchOptionsDialog({ open, onClose, options, }) {
    return (React.createElement(Dialog, { open: open, onClose: onClose },
        React.createElement(DialogTitle, null, "Launch options"),
        React.createElement(DialogContent, null,
            React.createElement(MenuList, null, options.map(opt => (React.createElement(MenuItem, { key: opt.key, onClick: opt.onClick },
                React.createElement("div", null,
                    React.createElement(Typography, { variant: "body1" }, opt.title),
                    React.createElement(Typography, { variant: "body2", color: "text.secondary" }, opt.description)))))))));
}
