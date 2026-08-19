import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../../components/TextField2';
import { DEFAULT_EBI_EMAIL } from '../../../utils/ebiJobDispatcher';
const useStyles = makeStyles()({
    field: {
        minWidth: 300,
    },
    help: {
        marginBottom: 8,
    },
});
export default function BlastSettingsDialog({ handleClose, ebiEmail, }) {
    const { classes } = useStyles();
    const [tempEbiEmail, setTempEbiEmail] = useState(ebiEmail);
    return (React.createElement(Dialog, { open: true, maxWidth: "lg", onClose: () => {
            handleClose();
        } },
        React.createElement(DialogTitle, null, "BLAST Settings"),
        React.createElement(DialogContent, null,
            React.createElement(Typography, { variant: "subtitle2", className: classes.help }, "Searches run at EBI, which asks for a contact address on every job so they can reach whoever is generating the load. If your site sends real volume, use your own."),
            React.createElement(TextField2, { autoFocus: true, margin: "dense", label: "EBI contact email", fullWidth: true, variant: "outlined", value: tempEbiEmail, className: classes.field, onChange: e => {
                    setTempEbiEmail(e.target.value);
                } }),
            React.createElement(Button, { variant: "contained", onClick: () => {
                    setTempEbiEmail(DEFAULT_EBI_EMAIL);
                } }, "Reset")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { variant: "contained", color: "secondary", onClick: () => {
                    handleClose();
                } }, "Cancel"),
            React.createElement(Button, { color: "primary", variant: "contained", onClick: () => {
                    handleClose({ ebiEmail: tempEbiEmail });
                } }, "Save"))));
}
