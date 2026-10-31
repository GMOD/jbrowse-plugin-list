import React, { Suspense, lazy, useState } from 'react';
import Help from '@mui/icons-material/Help';
import { IconButton } from '@mui/material';
import { observer } from 'mobx-react';
// icons
// lazies
const HelpDialog = lazy(() => import('./HelpDialog'));
const HelpButton = observer(function HelpButton() {
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
});
export default HelpButton;
