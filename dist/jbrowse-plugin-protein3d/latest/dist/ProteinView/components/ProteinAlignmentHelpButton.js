import React, { lazy } from 'react';
import { getSession } from '@jbrowse/core/util';
import Help from '@mui/icons-material/Help';
import { IconButton, Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
const ProteinAlignmentHelpDialog = lazy(() => import('./ProteinAlignmentHelpDialog'));
const ProteinAlignmentHelpButton = observer(function ProteinAlignmentHelpButton({ model }) {
    return (React.createElement(Tooltip, { title: "What the alignment panel shows" },
        React.createElement(IconButton, { size: "small", onClick: () => {
                getSession(model).queueDialog(handleClose => [
                    ProteinAlignmentHelpDialog,
                    { handleClose },
                ]);
            } },
            React.createElement(Help, { fontSize: "small" }))));
});
export default ProteinAlignmentHelpButton;
