import React, { lazy } from 'react';
import { getSession } from '@jbrowse/core/util';
import Help from '@mui/icons-material/Help';
import { IconButton } from '@mui/material';
// icons
const ProteinAlignmentHelpDialog = lazy(() => import('./ProteinAlignmentHelpDialog'));
export default function ProteinAlignmentHelpButton({ model, }) {
    return (React.createElement(IconButton, { style: { float: 'right' }, onClick: () => {
            getSession(model).queueDialog(handleClose => [
                ProteinAlignmentHelpDialog,
                { handleClose },
            ]);
        } },
        React.createElement(Help, null)));
}
//# sourceMappingURL=ProteinAlignmentHelpButton.js.map