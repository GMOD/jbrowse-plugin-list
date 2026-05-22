import React from 'react';
import { Button, DialogActions } from '@mui/material';
export default function SubmitCancelActions({ onSubmit, onCancel, submitDisabled, submitLabel = 'Submit', cancelLabel = 'Cancel', }) {
    return (React.createElement(DialogActions, null,
        React.createElement(Button, { color: "primary", variant: "contained", disabled: submitDisabled, onClick: () => {
                onSubmit();
            } }, submitLabel),
        React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                onCancel();
            } }, cancelLabel)));
}
//# sourceMappingURL=SubmitCancelActions.js.map