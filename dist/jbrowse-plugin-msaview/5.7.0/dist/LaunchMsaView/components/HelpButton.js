import React, { Suspense, lazy, useState } from 'react';
import Help from '@mui/icons-material/Help';
import { IconButton, Tooltip } from '@mui/material';
const HelpDialog = lazy(() => import('./HelpDialog'));
export default function HelpButton() {
    const [show, setShow] = useState(false);
    return (React.createElement(React.Fragment, null,
        React.createElement(Tooltip, { title: "What each tab does" },
            React.createElement(IconButton, { "aria-label": "Help", onClick: () => {
                    setShow(true);
                } },
                React.createElement(Help, null))),
        show ? (React.createElement(Suspense, { fallback: null },
            React.createElement(HelpDialog, { handleClose: () => {
                    setShow(false);
                } }))) : null));
}
