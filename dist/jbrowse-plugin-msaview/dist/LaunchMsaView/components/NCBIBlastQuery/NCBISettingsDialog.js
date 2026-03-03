import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, } from '@mui/material';
import { BASE_BLAST_URL } from './consts';
import TextField2 from '../../../components/TextField2';
export default function NCBISettingsDialog({ handleClose, baseUrl, }) {
    const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);
    return (React.createElement(Dialog, { open: true, maxWidth: "lg", onClose: () => {
            handleClose();
        } },
        React.createElement(DialogTitle, null, "BLAST Settings"),
        React.createElement(DialogContent, null,
            React.createElement(TextField2, { autoFocus: true, margin: "dense", label: "BLAST Base URL", fullWidth: true, variant: "outlined", value: tempBaseUrl, style: { minWidth: '300px' }, onChange: e => {
                    setTempBaseUrl(e.target.value);
                } }),
            React.createElement(Button, { variant: "contained", onClick: () => {
                    setTempBaseUrl(BASE_BLAST_URL);
                } }, "Reset")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { variant: "contained", color: "secondary", onClick: () => {
                    handleClose();
                } }, "Cancel"),
            React.createElement(Button, { color: "primary", variant: "contained", onClick: () => {
                    handleClose(tempBaseUrl);
                } }, "Save"))));
}
//# sourceMappingURL=NCBISettingsDialog.js.map