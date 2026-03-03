import React, { Suspense, lazy, useState } from 'react';
import Help from '@mui/icons-material/Help';
import { IconButton } from '@mui/material';
// icons
// lazies
const HelpDialog = lazy(() => import('./HelpDialog'));
export default function HelpButton() {
    const [show, setShow] = useState(false);
    return (React.createElement(React.Fragment, null,
        React.createElement(IconButton, { onClick: () => {
                setShow(true);
            } },
            React.createElement(Help, null)),
        show ? (React.createElement(Suspense, { fallback: null },
            React.createElement(HelpDialog, { handleClose: () => {
                    setShow(false);
                } }))) : null));
}
//# sourceMappingURL=HelpButton.js.map