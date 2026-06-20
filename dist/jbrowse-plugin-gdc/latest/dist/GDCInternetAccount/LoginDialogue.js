import React, { useState } from 'react';
import { Button, DialogContent, TextField, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Dialog } from '@jbrowse/core/ui';
const useStyles = makeStyles()(theme => ({
    root: {
        margin: theme.spacing(1),
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
    },
    imgContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    img: {
        width: 100,
        maxWidth: '100%',
        maxHeight: '100%',
        verticalAlign: 'middle',
    },
    helperTextContainer: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    submitTokenContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    alertContainer: {
        paddingBottom: theme.spacing(2),
    },
}));
export default function LoginDialogue({ handleClose, }) {
    const [token, setToken] = useState('');
    const { classes } = useStyles();
    return (React.createElement(Dialog, { open: true, onClose: () => {
            handleClose();
        }, maxWidth: "sm", title: "Login to access controlled GDC data" },
        React.createElement(DialogContent, null,
            React.createElement("div", { className: classes.root },
                React.createElement("div", { className: classes.paper },
                    React.createElement(Typography, { variant: "h4", align: "center" }, "GDC Data Portal"),
                    React.createElement("div", { className: classes.helperTextContainer },
                        React.createElement(Typography, { variant: "h6", component: "h1", align: "center" }, "Login to access controlled data"),
                        React.createElement(Typography, { variant: "body1", align: "center" }, "An authentication token is required to access controlled data."),
                        React.createElement(Typography, { variant: "body2", align: "center" }, "You will need to provide your authentication token every time you start a new session, as the token is deleted when the session expires.")),
                    React.createElement("div", { className: classes.submitTokenContainer },
                        React.createElement(TextField, { color: "primary", variant: "outlined", label: "Enter token", onChange: event => {
                                setToken(event.target.value);
                            } }),
                        React.createElement("div", { className: classes.buttonContainer },
                            React.createElement(Button, { color: "primary", variant: "contained", size: "large", onClick: () => {
                                    handleClose(token);
                                } }, "Login"))))))));
}
//# sourceMappingURL=LoginDialogue.js.map