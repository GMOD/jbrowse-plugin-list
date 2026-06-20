import React from 'react';
import { Button, DialogContent, Typography, Paper } from '@mui/material';
import { Dialog } from '@jbrowse/core/ui';
import { makeStyles } from 'tss-react/mui';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
const THEME_SPACING_A = 8; // theme.spacing(2)
const THEME_SPACING_B = 6; // theme.spacing(1)
const useStyles = makeStyles()(theme => ({
    closeButton: {
        position: 'absolute',
        left: '80px',
        color: theme.palette.grey[500],
    },
    root: {
        margin: THEME_SPACING_B,
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        padding: THEME_SPACING_A,
    },
    imgContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    img: {
        maxWidth: '100%',
        maxHeight: '100%',
        verticalAlign: 'middle',
    },
    helperTextContainer: {
        paddingTop: THEME_SPACING_A,
        paddingBottom: THEME_SPACING_A,
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: THEME_SPACING_A,
        alignItems: 'center',
        background: theme.palette.grey[100],
        padding: THEME_SPACING_B,
        marginTop: THEME_SPACING_A,
        marginBottom: THEME_SPACING_A,
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
}));
export default function TipDialogue({ handleClose, }) {
    const { classes } = useStyles();
    return (React.createElement(Dialog, { open: true, onClose: handleClose, maxWidth: "sm", title: "How to upload bulk files from the GDC to JBrowse" },
        React.createElement(DialogContent, null,
            React.createElement("div", { className: classes.root },
                React.createElement("div", { className: classes.paper },
                    React.createElement("div", { className: classes.imgContainer },
                        React.createElement("img", { className: classes.img, src: "https://i.imgur.com/jCKe4of.png" })),
                    React.createElement(Paper, { className: classes.textContainer, elevation: 0 },
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 1")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Perform a query on the GDC")),
                        React.createElement(ArrowForwardIcon, null),
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 2")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Enable column for 'File UUID'")),
                        React.createElement(ArrowForwardIcon, null),
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 3")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Click JSON button to Export")),
                        React.createElement(ArrowForwardIcon, null),
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 4")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Drop JSON file into the GDC Widget on JBrowse"))),
                    React.createElement("div", { className: classes.buttonContainer },
                        React.createElement(Button, { color: "primary", variant: "contained", size: "large", onClick: handleClose }, "Close")))))));
}
//# sourceMappingURL=TipDialogue.js.map